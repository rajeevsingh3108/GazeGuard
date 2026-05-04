import sqlite3
import bcrypt
import os
import json
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
from PIL import Image
import io

app = Flask(__name__ )
CORS(app)  # Enable CORS
print(cv2.__version__)
# Load the Haar cascade for face detection
# Specify the path to the Haar cascade manually
HAAR_CASCADE_PATH = 'haarcascade_frontalface_default.xml'  # Update this path
face_cascade = cv2.CascadeClassifier(HAAR_CASCADE_PATH)

# Define threshold for head turn detection
TURN_THRESHOLD = 40  # Change this based on your requirements

# Function to create a connection to the database
def get_db_connection():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn

# User and Test table creation if they don't exist
def create_tables():
    conn = get_db_connection()
    
    # Users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password BLOB NOT NULL,
            salt BLOB NOT NULL,
            role TEXT NOT NULL
        )
    ''')
    
    # Tests table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_code TEXT UNIQUE NOT NULL,
            questions TEXT NOT NULL,
            timer INTEGER NOT NULL,
            is_test_started BOOLEAN NOT NULL
        )
    ''')

    # User test sessions table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_test_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            test_id INTEGER NOT NULL,
            answers TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            session_login TEXT NOT NULL,
            FOREIGN KEY (test_id) REFERENCES tests (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Role-based access control decorator
def role_required(role):
    """Decorator to check user role."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = request.headers.get('Authorization')  # Assuming a token is sent with the request
            if token is None or not token.startswith('Bearer '):
                return jsonify({"message": "Missing or invalid token."}), 403

            user_info = decode_token(token)  # Implement your token decoding logic here
            if user_info['role'] != role:
                return jsonify({"message": "Access denied."}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE LOWER(username) = ?', (username,)).fetchone()
    print(user)  # See if the users table contains data
    conn.close()
    if user:
        # Append the salt to the password and hash it
        salt = user['salt']
        salted_password = password.encode('utf-8') + salt
        if bcrypt.checkpw(salted_password, user['password']):
            # Generate a token with the user's info, including their role
            token = generate_token(username, user['role'])  # Implement your token generation logic here
            return jsonify({"message": "Login successful!", "redirect": "/user", "token": token}), 200

    return jsonify({"message": "Invalid username or password."}), 401

def analyze_head_orientation(face_rect, image_shape):
    # Get the face rectangle
    x, y, w, h = face_rect

    # Calculate the center of the face
    face_center_x = x + w // 2
    face_center_y = y + h // 2

    # Determine if the face is within the threshold of the center of the frame
    frame_center_x = image_shape[1] // 2
    distance_from_center = abs(face_center_x - frame_center_x)

    if distance_from_center > TURN_THRESHOLD:
        return "Face Turned Away"
    else:
        return "Facing Camera"

# Route for receiving video frames and analyzing face orientation
@app.route('/face-orientation', methods=['POST'])
def face_orientation():
    if 'frame' not in request.files:
        return jsonify({"error": "No frame provided"}), 400

    # Get the frame (image) from the request
    frame_file = request.files['frame']
    frame = np.array(Image.open(io.BytesIO(frame_file.read())))

    # Convert the image to grayscale
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the image
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5)

    orientation_status = "No face Detected"
    if len(faces) > 0:
        for face_rect in faces:
            orientation_status = analyze_head_orientation(face_rect, frame.shape)

    return jsonify({"status": orientation_status})


@app.route('/get-all-tests', methods=['GET'])
def get_all_tests():
    conn = get_db_connection()
    
    # Fetch all tests
    tests_query = '''
        SELECT test_code, is_test_started
        FROM tests
    '''
    tests = conn.execute(tests_query).fetchall()
    conn.close()
    
    # Convert tests to a list of dictionaries
    tests_data = []
    for test in tests:
        tests_data.append({
            'test_code': test['test_code'],
            'is_test_started': test['is_test_started']
        })
    
    return jsonify(tests_data), 200

@app.route('/start-test', methods=['POST'])
def start_test():
    data = request.get_json()
    test_code = data.get('testCode')
    
    conn = get_db_connection()
    conn.execute('UPDATE tests SET is_test_started = ? WHERE test_code = ?', (True, test_code))
    conn.commit()
    conn.close()

    return jsonify({"message": "Test started successfully."}), 200

@app.route('/end-test', methods=['POST'])
def end_test():
    data = request.get_json()
    test_code = data.get('testCode')
    
    conn = get_db_connection()
    conn.execute('UPDATE tests SET is_test_started = ? WHERE test_code = ?', (False, test_code))
    conn.commit()
    conn.close()

    return jsonify({"message": "Test ended successfully."}), 200

@app.route('/submit-test', methods=['POST'])
def submit_test():
    data = request.get_json()
    username = data.get('username')
    test_id = data.get('test_id')
    answers = data.get('answers')
    ip_address = request.remote_addr
    session_login = data.get('session_login')

    conn = get_db_connection()
    
    # Insert data into the user_test_sessions table
    conn.execute('''
        INSERT INTO user_test_sessions (username, test_id, answers, ip_address, session_login)
        VALUES (?, ?, ?, ?, ?)
    ''', (username, test_id, json.dumps(answers), ip_address, session_login))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Test submitted successfully."}), 201

@app.route('/get-test-data/<test_code>', methods=['GET'])
def get_test_data(test_code):
    conn = get_db_connection()

    # Query the test based on test_code
    test_query = '''
        SELECT test_code, questions, timer, is_test_started
        FROM tests
        WHERE test_code = ?
    '''
    test = conn.execute(test_query, (test_code,)).fetchone()
    conn.close()
    if test:
        # Parse the questions JSON string to a Python list
        questions = json.loads(test['questions'])

        # Prepare and return the response as JSON
        test_data = {
            'test_code': test['test_code'],
            'questions': questions,  # This will now be a list of question dictionaries
            'timer': test['timer'],
            'is_test_started': test['is_test_started']
        }
        return jsonify(test_data)
    else:
        return jsonify({'error': 'Test not found'}), 404


@app.route('/admin', methods=['GET'])
def admin_dashboard():
    return jsonify({"message": "Welcome to the Admin Dashboard!"})


@app.route('/user/dashboard', methods=['GET'])
def user_dashboard():
    return jsonify({"message": "Welcome to the User Dashboard!"})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user')  # Default role is 'user'

    conn = get_db_connection()

    # Check if username already exists
    existing_user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    if existing_user:
        conn.close()
        return jsonify({"message": "Username already exists."}), 400

    # Generate a random salt
    salt = os.urandom(16)  # 16 bytes of random salt

    # Salt and hash the password
    salted_password = password.encode('utf-8') + salt
    hashed_password = bcrypt.hashpw(salted_password, bcrypt.gensalt())

    # Insert the new user into the database
    conn.execute('INSERT INTO users (username, password, salt, role) VALUES (?, ?, ?, ?)',
                 (username, hashed_password, salt, role))
    conn.commit()
    conn.close()

    return jsonify({"message": "User registered successfully."}), 201

# Create a test
@app.route('/create-test', methods=['POST'])
def create_test():
    data = request.get_json()
    test_code = data.get('testCode')
    questions = data.get('questions')
    timer = data.get('timer')

    conn = get_db_connection()
    # Check if test code already exists
    existing_test = conn.execute('SELECT * FROM tests WHERE test_code = ?', (test_code,)).fetchone()
    if existing_test:
        conn.close()
        return jsonify({"message": "Test code already exists."}), 400
    json_question = json.dumps(questions)
    # Insert new test into database
    conn.execute('INSERT INTO tests (test_code, questions, timer, is_test_started) VALUES (?, ?, ?, ?)',
                 (test_code, json_question, timer, False))
    conn.commit()
    conn.close()

    return jsonify({"message": "Test created successfully."}), 201

@app.route('/get-user-sessions', methods=['GET'])
def get_user_sessions():
    conn = get_db_connection()
    
    # Fetch username, ip_address, and session_login from user_test_sessions
    sessions_query = '''
        SELECT username, ip_address, session_login
        FROM user_test_sessions
    '''
    sessions = conn.execute(sessions_query).fetchall()
    conn.close()
    
    # Convert sessions to a list of dictionaries
    sessions_data = []
    for session in sessions:
        sessions_data.append({
            'username': session['username'],
            'ip_address': session['ip_address'],
            'session_login': session['session_login']
        })
    
    # Return the data as a JSON response
    return jsonify(sessions_data), 200

# Reset test (update questions and timer)
@app.route('/reset-test', methods=['POST'])
@role_required('admin')  # Only admin can reset tests
def reset_test():
    data = request.get_json()
    test_code = data.get('testCode')
    new_questions = data.get('questions')
    new_timer = data.get('timer')

    conn = get_db_connection()
    test = conn.execute('SELECT * FROM tests WHERE test_code = ?', (test_code,)).fetchone()

    if not test:
        conn.close()
        return jsonify({"message": "Test not found."}), 404

    conn.execute('UPDATE tests SET questions = ?, timer = ?, is_test_started = ? WHERE test_code = ?',
                 (new_questions, new_timer, False, test_code))
    conn.commit()
    conn.close()

    return jsonify({"message": "Test reset successfully."}), 200

def generate_token(username, role):
    # Implement token generation logic (e.g., JWT)
    return f"Bearer {username}-token"

def decode_token(token):
    # Implement token decoding logic (e.g., JWT)
    username, role = token.split('-token')
    return {'username': username, 'role': 'admin' if username == 'admin' else 'user'}


if __name__ == '__main__':
    create_tables()  # Ensure the database and tables exist
    app.run(debug=True)