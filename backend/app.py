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
import requests

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
    conn = sqlite3.connect('users.db', timeout=15.0)
    conn.execute('PRAGMA journal_mode=WAL;')
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
            test_id TEXT NOT NULL,
            answers TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            session_login TEXT NOT NULL,
            score INTEGER,
            total INTEGER,
            timestamp TEXT
        )
    ''')
    # Add timestamp column to existing tables (NULL default works in SQLite ALTER TABLE)
    try:
        conn.execute('ALTER TABLE user_test_sessions ADD COLUMN timestamp TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
        
    try:
        conn.execute('ALTER TABLE user_test_sessions ADD COLUMN score INTEGER')
    except sqlite3.OperationalError:
        pass

    try:
        conn.execute('ALTER TABLE user_test_sessions ADD COLUMN total INTEGER')
    except sqlite3.OperationalError:
        pass
    
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

    # Coding Tests table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS coding_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_code TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            problem_statement TEXT NOT NULL,
            sample_input TEXT NOT NULL,
            sample_output TEXT NOT NULL,
            test_cases TEXT NOT NULL,
            timer INTEGER NOT NULL,
            is_test_started BOOLEAN DEFAULT 0
        )
    ''')

    try:
        conn.execute('ALTER TABLE coding_tests ADD COLUMN is_test_started BOOLEAN DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists

    try:
        conn.execute('ALTER TABLE user_test_sessions ADD COLUMN timestamp DATETIME DEFAULT CURRENT_TIMESTAMP')
    except sqlite3.OperationalError:
        pass  # Column already exists

    # User Coding Test Sessions table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_coding_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            test_id TEXT NOT NULL,
            code TEXT NOT NULL,
            language TEXT NOT NULL,
            score INTEGER,
            total INTEGER,
            ip_address TEXT NOT NULL,
            session_login TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
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
    expected_role = data.get('expected_role', 'user')  # 'user' or 'admin'
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE LOWER(username) = ?', (username.lower(),)).fetchone()
    conn.close()
    if user:
        salt = user['salt']
        salted_password = password.encode('utf-8') + salt
        if bcrypt.checkpw(salted_password, user['password']):
            actual_role = user['role']
            # Role mismatch enforcement
            if actual_role != expected_role:
                if expected_role == 'admin':
                    return jsonify({"message": "Access denied. This account is not an admin account. Please use the User login portal."}), 403
                else:
                    return jsonify({"message": "Access denied. Admin accounts cannot log in from the User portal. Please use the Admin login portal."}), 403
            token = generate_token(username, actual_role)
            redirect_path = "/admin" if actual_role == "admin" else "/user"
            return jsonify({"message": "Login successful!", "redirect": redirect_path, "token": token, "role": actual_role}), 200

    return jsonify({"message": "Invalid username or password."}), 401

def analyze_head_orientation(face_rect, image_shape):
    # Get the face rectangle [x, y, w, h]
    x, y, w, h = face_rect
    img_h, img_w = image_shape[0], image_shape[1]

    # Calculate the center of the face
    face_center_x = x + w // 2
    face_center_y = y + h // 2

    # Horizontal Check: Must be in the middle 30% of the screen (very strict)
    frame_center_x = img_w // 2
    distance_x = abs(face_center_x - frame_center_x)
    horizontal_threshold = img_w // 6 # Stricter: 1/6 of width from center

    # Vertical Check: Must be in the upper-middle band (where faces sit)
    # Looking down at a phone or lap will move the face center below this band
    expected_y = img_h * 0.4 # Typical face position
    distance_y = abs(face_center_y - expected_y)
    vertical_threshold = img_h // 6 # 16% deviation allowed

    if distance_x > horizontal_threshold or distance_y > vertical_threshold:
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

    frame_file = request.files['frame']
    img_rgb = np.array(Image.open(io.BytesIO(frame_file.read())))
    frame_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    gray_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

    # Face Detection Fallback Logic
    try:
        import cvlib as cv
        faces, confidences = cv.detect_face(frame_bgr)
    except Exception as e:
        print("cvlib face detection error, falling back to Haar:", e)
        faces_raw = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))
        faces = [[x, y, x+w, y+h] for (x, y, w, h) in faces_raw]

    orientation_status = "No Face Detected"
    sentiment = "Unknown"
    warnings_list = []
    num_faces = len(faces)

    if num_faces == 0:
        warnings_list.append("No Face Detected — Please face the camera")
        orientation_status = "No Face Detected"
    elif num_faces > 1:
        warnings_list.append(f"Multiple Faces Detected ({num_faces}) — Unauthorized person present")
        orientation_status = "Multiple Faces"
    else:
        # Exactly one face — check orientation
        f = faces[0]
        rect = [f[0], f[1], f[2]-f[0], f[3]-f[1]]
        orientation_status = analyze_head_orientation(rect, frame_bgr.shape)
        if orientation_status == "Face Turned Away":
            warnings_list.append("Looking Away — Please focus on the screen")

        # Sentiment analysis (best-effort)
        try:
            from deepface import DeepFace
            result = DeepFace.analyze(frame_bgr, actions=['emotion'], enforce_detection=False, silent=True)
            sentiment = result[0]['dominant_emotion'] if isinstance(result, list) else result['dominant_emotion']
        except Exception as e:
            print("Sentiment analysis error:", e)

    # Phone/device detection using TensorFlow (Replacing broken cvlib/Darknet)
    try:
        import tensorflow as tf
        from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
        
        # Load model once (it will be cached in memory)
        if not hasattr(app, 'device_model'):
            print("Loading MobileNetV2 for device detection...")
            app.device_model = MobileNetV2(weights='imagenet')
            
        # Resize and preprocess
        img_for_tf = cv2.resize(frame_bgr, (224, 224))
        img_for_tf = cv2.cvtColor(img_for_tf, cv2.COLOR_BGR2RGB)
        x = np.expand_dims(img_for_tf, axis=0)
        x = preprocess_input(x)
        
        preds = app.device_model.predict(x, verbose=0)
        decoded = decode_predictions(preds, top=5)[0]
        
        # Labels to watch for
        cheat_labels = ['cellular_telephone', 'handheld_computer', 'notebook', 'laptop', 'remote_control', 'tablet', 'book']
        detected = [p[1] for p in decoded if p[1] in cheat_labels and p[2] > 0.15]
        
        if detected:
            msg = f"Device Detected — {', '.join(set(detected)).replace('_', ' ')} found"
            warnings_list.append(msg)
            print(f"DEBUG: TF Detection: {msg}")
            
    except Exception as e:
        print("TF Object detection error:", e)

    # Persist to DB
    if username and test_code:
        conn = get_db_connection()
        conn.execute(
            'INSERT INTO proctoring_logs (username, test_code, head_orientation, sentiment) VALUES (?, ?, ?, ?)',
            (username, test_code, orientation_status, sentiment)
        )
        for w in warnings_list:
            conn.execute(
                'INSERT INTO warnings (username, test_code, warning_type) VALUES (?, ?, ?)',
                (username, test_code, w)
            )
        conn.commit()
        conn.close()

    primary_warning = warnings_list[0] if warnings_list else None
    return jsonify({"status": orientation_status, "sentiment": sentiment, "warning": primary_warning, "all_warnings": warnings_list})


@app.route('/get-all-tests', methods=['GET'])
def get_all_tests():
    conn = get_db_connection()
    tests = conn.execute('SELECT test_code, is_test_started FROM tests').fetchall()
    conn.close()
    return jsonify([dict(t) for t in tests]), 200

@app.route('/get-all-coding-tests', methods=['GET'])
def get_all_coding_tests():
    conn = get_db_connection()
    tests = conn.execute('SELECT test_code, is_test_started FROM coding_tests').fetchall()
    conn.close()
    return jsonify([dict(t) for t in tests]), 200

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

@app.route('/start-coding-test', methods=['POST'])
def start_coding_test():
    data = request.get_json()
    test_code = data.get('testCode')
    conn = get_db_connection()
    conn.execute('UPDATE coding_tests SET is_test_started = ? WHERE test_code = ?', (True, test_code))
    conn.commit()
    conn.close()
    return jsonify({"message": "Coding test started successfully."}), 200

@app.route('/end-coding-test', methods=['POST'])
def end_coding_test():
    data = request.get_json()
    test_code = data.get('testCode')
    conn = get_db_connection()
    conn.execute('UPDATE coding_tests SET is_test_started = ? WHERE test_code = ?', (False, test_code))
    conn.commit()
    conn.close()
    return jsonify({"message": "Coding test ended successfully."}), 200

@app.route('/log-warning', methods=['POST'])
def log_warning():
    """Lets the frontend persist client-side warnings (tab-switch, copy-paste) to the DB."""
    data = request.get_json()
    username = data.get('username')
    test_code = data.get('testCode')
    warning_type = data.get('warningType')
    if not all([username, test_code, warning_type]):
        return jsonify({"error": "Missing fields"}), 400
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO warnings (username, test_code, warning_type) VALUES (?, ?, ?)',
        (username, test_code, warning_type)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Warning logged."}), 201

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

    from datetime import datetime
    # Insert data into the user_test_sessions table
    conn.execute(
        'INSERT INTO user_test_sessions (username, test_id, answers, ip_address, session_login, score, total, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (username, test_id, json.dumps(answers), ip_address, session_login, score, total, datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'))
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Test submitted successfully.", "score": score, "total": total}), 201

@app.route('/get-test-data/<test_code>', methods=['GET'])
def get_test_data(test_code):
    conn = get_db_connection()

    # Query the test based on test_code and ensure it has been started by an admin
    test_query = '''
        SELECT test_code, questions, timer, is_test_started
        FROM tests
        WHERE test_code = ? AND is_test_started = 1
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
        return jsonify({'error': 'Test not found or not started by the admin.'}), 404


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
    
    # Try MCQ first
    session = conn.execute('''
        SELECT answers, score, total, 'MCQ' as test_type
        FROM user_test_sessions 
        WHERE username = ? AND test_id = ?
    ''', (username, test_code)).fetchone()

    # If not MCQ, try Coding
    if not session:
        session = conn.execute('''
            SELECT code as answers, score, total, 'Coding' as test_type
            FROM user_coding_sessions 
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
        answers = {}
        attempted = 0
        score = 0
        total = 0
        incorrect = 0
    else:
        test_type = session['test_type']
        if test_type == 'MCQ':
            try:
                answers = json.loads(session['answers']) if session['answers'] else {}
            except:
                answers = {}
            attempted = len(answers.keys())
            score = session['score'] if session['score'] is not None else 0
            total = session['total'] if session['total'] is not None else 0
            incorrect = attempted - score
        else:
            answers = {"code": session['answers']} if session['answers'] else {}
            score = session['score'] if session['score'] is not None else 0
            total = session['total'] if session['total'] is not None else 0
            attempted = total  # For coding, we assume they attempted if a session exists
            incorrect = total - score

    return jsonify({
        "score": score,
        "total": total,
        "attempted": attempted,
        "incorrect": incorrect,
        "answers": answers,
        "logs": [dict(log) for log in logs],
        "warnings": [dict(w) for w in warnings]
    }), 200

import subprocess
import tempfile

def execute_code(language, code, stdin):
    with tempfile.TemporaryDirectory() as temp_dir:
        if language == "python":
            script_path = os.path.join(temp_dir, "script.py")
            with open(script_path, "w") as f:
                f.write(code)
            try:
                proc = subprocess.run(["python", script_path], input=stdin, text=True, capture_output=True, timeout=5)
                return {"output": proc.stdout, "error": proc.stderr}
            except subprocess.TimeoutExpired:
                return {"output": "", "error": "Execution timed out."}
            except Exception as e:
                return {"output": "", "error": str(e)}
                
        elif language == "c++":
            cpp_path = os.path.join(temp_dir, "main.cpp")
            exe_path = os.path.join(temp_dir, "main.exe")
            with open(cpp_path, "w") as f:
                f.write(code)
            try:
                compile_proc = subprocess.run(["g++", cpp_path, "-o", exe_path], text=True, capture_output=True, timeout=10)
                if compile_proc.returncode != 0:
                    return {"output": "", "error": "Compilation Error:\n" + compile_proc.stderr}
                run_proc = subprocess.run([exe_path], input=stdin, text=True, capture_output=True, timeout=5)
                return {"output": run_proc.stdout, "error": run_proc.stderr}
            except subprocess.TimeoutExpired:
                return {"output": "", "error": "Execution timed out."}
            except Exception as e:
                return {"output": "", "error": "Please ensure g++ is installed. " + str(e)}

        elif language == "java":
            java_path = os.path.join(temp_dir, "Main.java")
            with open(java_path, "w") as f:
                f.write(code)
            try:
                compile_proc = subprocess.run(["javac", java_path], text=True, capture_output=True, timeout=10)
                if compile_proc.returncode != 0:
                    return {"output": "", "error": "Compilation Error:\n" + compile_proc.stderr}
                run_proc = subprocess.run(["java", "-cp", temp_dir, "Main"], input=stdin, text=True, capture_output=True, timeout=5)
                return {"output": run_proc.stdout, "error": run_proc.stderr}
            except subprocess.TimeoutExpired:
                return {"output": "", "error": "Execution timed out."}
            except Exception as e:
                return {"output": "", "error": "Please ensure Java SDK is installed. " + str(e)}
                
    return {"output": "", "error": "Unsupported language."}

@app.route('/fetch-leetcode', methods=['POST'])
def fetch_leetcode():
    data = request.json
    slug = data.get('slug')
    if not slug:
        return jsonify({"error": "No slug provided"}), 400
    
    url = "https://leetcode.com/graphql"
    query = """
    query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            title
            content
            exampleTestcases
        }
    }
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Content-Type": "application/json"
        }
        response = requests.post(url, json={"query": query, "variables": {"titleSlug": slug}}, headers=headers)
        result = response.json()
        question = result.get('data', {}).get('question')
        if not question:
            return jsonify({"error": "Problem not found"}), 404
        
        # LeetCode content is HTML, we can return it directly or try to strip it a bit in the frontend
        return jsonify({
            "title": question.get('title'),
            "content": question.get('content'),
            "sample_input": question.get('exampleTestcases', '')
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create-coding-test', methods=['POST'])
def create_coding_test():
    data = request.json
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO coding_tests (test_code, title, problem_statement, sample_input, sample_output, test_cases, timer)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (data['testCode'], data['title'], data['problemStatement'], data['sampleInput'], data['sampleOutput'], json.dumps(data['testCases']), int(data['timer'])))
        conn.commit()
        conn.close()
        return jsonify({"message": "Coding test created successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"message": "Test code already exists."}), 400
    except Exception as e:
        return jsonify({"message": "Error creating coding test", "error": str(e)}), 500

@app.route('/get-coding-test', methods=['GET'])
def get_coding_test():
    test_code = request.args.get('testCode')
    conn = get_db_connection()
    test = conn.execute('SELECT * FROM coding_tests WHERE test_code = ? AND is_test_started = 1', (test_code,)).fetchone()
    conn.close()
    if test:
        return jsonify({
            "title": test['title'],
            "problem_statement": test['problem_statement'],
            "sample_input": test['sample_input'],
            "sample_output": test['sample_output'],
            "timer": test['timer']
        }), 200
    return jsonify({"message": "Test not found or not started."}), 404

@app.route('/run-code', methods=['POST'])
def run_code():
    data = request.json
    result = execute_code(data['language'], data['code'], data.get('stdin', ''))
    return jsonify(result)

@app.route('/submit-coding-test', methods=['POST'])
def submit_coding_test():
    data = request.json
    test_code = data['test_id']
    username = data['username']
    language = data['language']
    code = data['code']
    session_login = data.get('session_login', '')
    ip_address = request.remote_addr

    conn = get_db_connection()
    test = conn.execute('SELECT * FROM coding_tests WHERE test_code = ?', (test_code,)).fetchone()
    if not test:
        conn.close()
        return jsonify({"message": "Test not found"}), 404

    test_cases = json.loads(test['test_cases'])
    passed = 0
    total = len(test_cases)
    
    for tc in test_cases:
        result = execute_code(language, code, tc['input'])
        if result['output'].strip() == tc['output'].strip():
            passed += 1

    conn.execute('''
        INSERT INTO user_coding_sessions (username, test_id, code, language, score, total, ip_address, session_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (username, test_code, code, language, passed, total, ip_address, session_login))
    conn.commit()
    conn.close()
    
    return jsonify({"score": passed, "total": total}), 200

@app.route('/get-user-sessions', methods=['GET'])
def get_user_sessions():
    conn = get_db_connection()
    sessions = conn.execute('SELECT username, test_id, ip_address, session_login, score, total, timestamp FROM user_test_sessions ORDER BY COALESCE(timestamp, session_login) DESC').fetchall()
    conn.close()
    return jsonify([dict(s) for s in sessions]), 200

@app.route('/get-all-user-sessions', methods=['GET'])
def get_all_user_sessions():
    conn = get_db_connection()
    # MCQ sessions — use COALESCE so older rows without timestamp still sort correctly
    query = '''
        SELECT username, test_id, ip_address, session_login, score, total,
               COALESCE(timestamp, session_login) as timestamp, 'MCQ' as test_type
        FROM user_test_sessions
        UNION ALL
        SELECT username, test_id, ip_address, session_login, score, total,
               timestamp, 'Coding' as test_type
        FROM user_coding_sessions
        UNION ALL
        SELECT username, test_code as test_id, 'N/A' as ip_address, 'Incomplete' as session_login, NULL as score, NULL as total,
               MAX(timestamp) as timestamp, 
               CASE WHEN EXISTS (SELECT 1 FROM coding_tests ct WHERE ct.test_code = proctoring_logs.test_code) THEN 'Coding' ELSE 'MCQ' END as test_type
        FROM proctoring_logs
        WHERE NOT EXISTS (SELECT 1 FROM user_test_sessions WHERE user_test_sessions.username = proctoring_logs.username AND user_test_sessions.test_id = proctoring_logs.test_code)
        AND NOT EXISTS (SELECT 1 FROM user_coding_sessions WHERE user_coding_sessions.username = proctoring_logs.username AND user_coding_sessions.test_id = proctoring_logs.test_code)
        GROUP BY username, test_code
        UNION ALL
        SELECT username, test_code as test_id, 'N/A' as ip_address, 'Incomplete' as session_login, NULL as score, NULL as total,
               MAX(timestamp) as timestamp, 
               CASE WHEN EXISTS (SELECT 1 FROM coding_tests ct WHERE ct.test_code = warnings.test_code) THEN 'Coding' ELSE 'MCQ' END as test_type
        FROM warnings
        WHERE NOT EXISTS (SELECT 1 FROM user_test_sessions WHERE user_test_sessions.username = warnings.username AND user_test_sessions.test_id = warnings.test_code)
        AND NOT EXISTS (SELECT 1 FROM user_coding_sessions WHERE user_coding_sessions.username = warnings.username AND user_coding_sessions.test_id = warnings.test_code)
        AND NOT EXISTS (SELECT 1 FROM proctoring_logs WHERE proctoring_logs.username = warnings.username AND proctoring_logs.test_code = warnings.test_code)
        GROUP BY username, test_code
        ORDER BY timestamp DESC
    '''
    sessions = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(s) for s in sessions]), 200

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