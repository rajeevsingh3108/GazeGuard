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
HAAR_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
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
            score INTEGER,
            total INTEGER,
            FOREIGN KEY (test_id) REFERENCES tests (id)
        )
    ''')
    
    # Proctoring logs table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS proctoring_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            test_code TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            head_orientation TEXT NOT NULL,
            sentiment TEXT NOT NULL
        )
    ''')
    # Warnings table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            test_code TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            warning_type TEXT NOT NULL
        )
    ''')

    # User Faces table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_faces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            face_image BLOB NOT NULL
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

    username = request.form.get('username')
    test_code = request.form.get('testCode')

    # Get the frame (image) from the request
    frame_file = request.files['frame']
    img_rgb = np.array(Image.open(io.BytesIO(frame_file.read())))
    frame_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)

    # Convert the image to grayscale
    gray_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

    # Detect faces in the image
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))

    orientation_status = "No Face Detected"
    sentiment = "Unknown"
    warning = None
    
    if len(faces) == 0:
        warning = "No Face Detected"
    elif len(faces) > 0:
        for face_rect in faces:
            orientation_status = analyze_head_orientation(face_rect, frame_bgr.shape)
            
        try:
            from deepface import DeepFace
            # Analyze sentiment on the BGR frame
            result = DeepFace.analyze(frame_bgr, actions=['emotion'], enforce_detection=False)
            if isinstance(result, list):
                sentiment = result[0]['dominant_emotion']
            else:
                sentiment = result['dominant_emotion']
        except Exception as e:
            print("Error analyzing sentiment:", e)
            
        # Object detection for phones/gadgets
        try:
            import cvlib as cv
            bbox, label, conf = cv.detect_common_objects(frame_bgr, model="yolov3-tiny")
            if 'cell phone' in label or 'laptop' in label or 'remote' in label:
                warning = "Device Detected (Phone/Gadget)"
        except Exception as e:
            print("Error detecting objects:", e)

    # Save to database if username and test_code are provided
    if username and test_code:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO proctoring_logs (username, test_code, head_orientation, sentiment)
            VALUES (?, ?, ?, ?)
        ''', (username, test_code, orientation_status, sentiment))
        
        if warning:
            conn.execute('''
                INSERT INTO warnings (username, test_code, warning_type)
                VALUES (?, ?, ?)
            ''', (username, test_code, warning))
            
        conn.commit()
        conn.close()

    return jsonify({"status": orientation_status, "sentiment": sentiment, "warning": warning})


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
    
    # Fetch test questions to calculate score
    test = conn.execute('SELECT questions FROM tests WHERE test_code = ?', (test_id,)).fetchone()
    score = 0
    total = 0
    if test:
        questions = json.loads(test['questions'])
        total = len(questions)
        for q in questions:
            q_text = q.get('question')
            correct_ans = q.get('correctAnswer')
            if correct_ans and answers.get(q_text) == correct_ans:
                score += 1

    # Insert data into the user_test_sessions table
    conn.execute('''
        INSERT INTO user_test_sessions (username, test_id, answers, ip_address, session_login, score, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (username, test_id, json.dumps(answers), ip_address, session_login, score, total))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Test submitted successfully.", "score": score, "total": total}), 201

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


@app.route('/get-proctoring-logs', methods=['GET'])
def get_proctoring_logs():
    test_code = request.args.get('testCode')
    if not test_code:
        return jsonify({"error": "No testCode provided"}), 400

    conn = get_db_connection()
    logs_query = '''
        SELECT username, timestamp, head_orientation, sentiment
        FROM proctoring_logs
        WHERE test_code = ?
        ORDER BY timestamp DESC
    '''
    logs = conn.execute(logs_query, (test_code,)).fetchall()
    conn.close()

    logs_data = []
    for log in logs:
        logs_data.append({
            'username': log['username'],
            'timestamp': log['timestamp'],
            'head_orientation': log['head_orientation'],
            'sentiment': log['sentiment']
        })

    return jsonify(logs_data), 200

@app.route('/get-warnings', methods=['GET'])
def get_warnings():
    test_code = request.args.get('testCode')
    if not test_code:
        return jsonify({"error": "No testCode provided"}), 400

    conn = get_db_connection()
    logs_query = '''
        SELECT username, timestamp, warning_type
        FROM warnings
        WHERE test_code = ?
        ORDER BY timestamp DESC
    '''
    logs = conn.execute(logs_query, (test_code,)).fetchall()
    conn.close()

    logs_data = []
    for log in logs:
        logs_data.append({
            'username': log['username'],
            'timestamp': log['timestamp'],
            'warning_type': log['warning_type']
        })

    return jsonify(logs_data), 200



@app.route('/admin', methods=['GET'])
def admin_dashboard():
    return jsonify({"message": "Welcome to the Admin Dashboard!"})


@app.route('/user/dashboard', methods=['GET'])
def user_dashboard():
    return jsonify({"message": "Welcome to the User Dashboard!"})

import base64

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user')  # Default role is 'user'
    face_image = data.get('face_image')

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
                 
    if role == 'user' and face_image:
        try:
            # face_image is "data:image/jpeg;base64,..."
            header, encoded = face_image.split(",", 1)
            image_data = base64.b64decode(encoded)
            conn.execute('INSERT INTO user_faces (username, face_image) VALUES (?, ?)', (username, image_data))
        except Exception as e:
            print("Error saving face image:", e)

    conn.commit()
    conn.close()

    return jsonify({"message": "User registered successfully."}), 201

@app.route('/verify-face', methods=['POST'])
def verify_face():
    if 'frame' not in request.files:
        return jsonify({"error": "No frame provided"}), 400

    username = request.form.get('username')
    test_code = request.form.get('testCode')
    
    conn = get_db_connection()
    user_face_row = conn.execute('SELECT face_image FROM user_faces WHERE username = ?', (username,)).fetchone()
    conn.close()
    
    if not user_face_row:
        return jsonify({"verified": False, "error": "No face registered for this user"}), 400
        
    stored_image_data = user_face_row['face_image']
    
    # Save the frame to check
    frame_file = request.files['frame']
    frame_rgb = np.array(Image.open(io.BytesIO(frame_file.read())))
    frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
    
    stored_rgb = np.array(Image.open(io.BytesIO(stored_image_data)))
    stored_bgr = cv2.cvtColor(stored_rgb, cv2.COLOR_RGB2BGR)
    
    try:
        from deepface import DeepFace
        # Verify
        result = DeepFace.verify(frame_bgr, stored_bgr, enforce_detection=False)
        is_verified = result["verified"]
        
        # Log mismatch warning
        if not is_verified and username and test_code:
            conn = get_db_connection()
            conn.execute('''
                INSERT INTO warnings (username, test_code, warning_type)
                VALUES (?, ?, ?)
            ''', (username, test_code, "Face Verification Mismatch"))
            conn.commit()
            conn.close()
            
        return jsonify({"verified": is_verified, "warning": "Face Verification Mismatch" if not is_verified else None})
    except Exception as e:
        print("Error in verify-face:", e)
        return jsonify({"verified": False, "error": str(e)}), 500

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

@app.route('/get-user-test-details', methods=['GET'])
def get_user_test_details():
    username = request.args.get('username')
    test_code = request.args.get('testCode')

    if not username or not test_code:
        return jsonify({"error": "Missing parameters"}), 400

    conn = get_db_connection()
    
    # Get test session details
    session = conn.execute('''
        SELECT answers, score, total 
        FROM user_test_sessions 
        WHERE username = ? AND test_id = ?
    ''', (username, test_code)).fetchone()

    # Get proctoring logs
    logs = conn.execute('''
        SELECT timestamp, head_orientation, sentiment 
        FROM proctoring_logs 
        WHERE username = ? AND test_code = ?
        ORDER BY timestamp DESC
    ''', (username, test_code)).fetchall()

    # Get warnings
    warnings = conn.execute('''
        SELECT timestamp, warning_type 
        FROM warnings 
        WHERE username = ? AND test_code = ?
        ORDER BY timestamp DESC
    ''', (username, test_code)).fetchall()

    conn.close()

    if not session:
        return jsonify({"error": "Session not found"}), 404

    try:
        answers = json.loads(session['answers']) if session['answers'] else {}
    except:
        answers = {}
        
    attempted = len(answers.keys())
    score = session['score'] if session['score'] is not None else 0
    total = session['total'] if session['total'] is not None else 0
    incorrect = attempted - score

    return jsonify({
        "score": score,
        "total": total,
        "attempted": attempted,
        "incorrect": incorrect,
        "answers": answers,
        "logs": [dict(log) for log in logs],
        "warnings": [dict(w) for w in warnings]
    }), 200

@app.route('/get-user-sessions', methods=['GET'])
def get_user_sessions():
    conn = get_db_connection()
    
    # Fetch data from user_test_sessions
    sessions_query = '''
        SELECT username, test_id, ip_address, session_login, score, total
        FROM user_test_sessions
    '''
    sessions = conn.execute(sessions_query).fetchall()
    conn.close()
    
    # Convert sessions to a list of dictionaries
    sessions_data = []
    for session in sessions:
        sessions_data.append({
            'username': session['username'],
            'test_id': session['test_id'],
            'ip_address': session['ip_address'],
            'session_login': session['session_login'],
            'score': session['score'],
            'total': session['total']
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