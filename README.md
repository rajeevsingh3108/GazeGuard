# GazeGuard - AI-Based Smart Proctoring System

An intelligent web-based proctoring system that leverages AI and computer vision to monitor user behavior during online examinations. GazeGuard is built using Flask for the backend and React for the frontend, providing a comprehensive solution for secure and automated test proctoring.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Setup (Flask)](#backend-setup-flask)
- [Frontend Setup (React)](#frontend-setup-react)
- [Running the Application](#running-the-application)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license) 

## Features

- **AI-Based Gaze Monitoring:** Uses computer vision to detect and monitor student gaze patterns during exams
- **Face Detection & Recognition:** Real-time facial detection to ensure the registered student is taking the test
- **Test Creation & Management:** Instructors can create tests with multiple-choice and custom questions
- **Automated Proctoring:** Comprehensive monitoring including:
  - Camera feed monitoring
  - Tab/window switching detection
  - Unusual behavior detection
  - Real-time alerting
- **User Authentication:** Secure login and registration for students and instructors with role-based access control
- **Timer Functionality:** Customizable time limits for each test with countdown display
- **Results Management:** Detailed submission records with analytics and performance metrics
- **Admin Dashboard:** Comprehensive dashboard for monitoring and managing tests and students
- **Responsive Design:** Mobile-friendly interface for accessibility

## Technologies Used

- **Frontend:** 
  - React.js (JavaScript library for UI)
  - Vite (Fast build tool and dev server)
  - Tailwind CSS (Utility-first CSS framework)
  - Axios (HTTP client for API calls)
  - PostCSS (CSS processing)

- **Backend:** 
  - Python 3.8+
  - Flask (Lightweight web framework)
  - Flask-SQLAlchemy (ORM)
  - OpenCV (Computer vision for face/gaze detection)
  - WebSockets (Real-time communication)

- **Database:** 
  - SQLite (Default)
  - PostgreSQL/MySQL (Optional)

- **Other Libraries & Tools:**
  - NumPy & SciPy (Numerical computing)
  - PIL/Pillow (Image processing)
  - ESLint (Code linting)

## Project Structure

```
GazeGuard/
├── backend/                          # Flask backend application
│   ├── app.py                       # Main Flask application
│   ├── add_users.py                 # User management utilities
│   ├── create_db_sqlite.py          # Database initialization
│   ├── init.py                      # Package initialization
│   ├── haarcascade_frontalface_default.xml  # Face detection model
│   └── instance/                    # Instance-specific files
│
├── src/                             # React frontend source code
│   ├── App.jsx                      # Main App component
│   ├── App.css                      # Main styling
│   ├── main.jsx                     # Entry point
│   ├── index.css                    # Global styles
│   ├── assets/                      # Static assets (images, icons)
│   └── components/                  # React components
│       ├── admin_dashboard.jsx      # Admin dashboard
│       ├── admin.jsx                # Admin panel
│       ├── login_admin.jsx          # Admin login
│       ├── login_user.jsx           # Student login
│       ├── Register.jsx             # User registration
│       ├── user.jsx                 # Student interface
│       ├── user_test.jsx            # Test taking interface
│       ├── video.jsx                # Video monitoring component
│       ├── navbar.jsx               # Navigation bar
│       ├── navUser.jsx              # User navigation
│       ├── docs.jsx                 # Documentation page
│       └── [other components]       # Additional UI components
│
├── public/                          # Public static files
├── package.json                     # Node.js dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
└── README.md                        # This file
```

## Architecture

### Backend Architecture
- **Flask Application:** RESTful API endpoints for test management, user authentication, and proctoring data
- **Database Layer:** SQLAlchemy ORM for database operations
- **Computer Vision Module:** OpenCV-based gaze tracking and face detection
- **WebSocket Server:** Real-time communication between frontend and backend for live monitoring

### Frontend Architecture
- **Component-Based UI:** Modular React components for different user roles
- **State Management:** Efficient state handling for test data and user sessions
- **API Integration:** Axios for backend communication
- **Real-Time Updates:** WebSocket integration for live proctoring feedback

## Backend Setup (Flask)

### Step 1: Clone the Repository
```bash
git clone https://github.com/rajeevsingh3108/GazeGuard.git
cd GazeGuard/backend
```

### Step 2: Create a Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Backend Dependencies
```bash
pip install -r requirements.txt
```

Ensure your `requirements.txt` includes:
- Flask
- Flask-SQLAlchemy
- OpenCV (cv2)
- numpy
- scipy
- Pillow
- python-socketio
- python-dotenv

### Step 4: Initialize the Database
```bash
python create_db_sqlite.py
```

### Step 5: Run the Flask Server
```bash
python app.py
```

The Flask server will be running at **http://127.0.0.1:5000**

## Frontend Setup (React)

### Step 1: Install Frontend Dependencies
```bash
cd ../  # Go back to root directory
npm install
```

### Step 2: Install Tailwind CSS (if not already configured)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3: Start the React Development Server
```bash
npm run dev
```

The React app will be running at **http://localhost:5173** (Vite default) or **http://localhost:3000** depending on your configuration.

## Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Run with npm scripts

Update your `package.json` to include:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Access the Application

1. Open your web browser
2. Navigate to **http://localhost:5173** (or the configured frontend port)
3. The frontend will automatically communicate with the Flask backend at **http://127.0.0.1:5000**

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/admin-login` - Admin authentication

### Test Management Endpoints
- `GET /api/tests` - Get all tests
- `POST /api/tests/create` - Create new test
- `GET /api/tests/<test_id>` - Get specific test
- `PUT /api/tests/<test_id>` - Update test
- `DELETE /api/tests/<test_id>` - Delete test

### Proctoring Endpoints
- `POST /api/proctoring/start` - Start monitoring
- `GET /api/proctoring/logs/<test_id>` - Get proctoring logs
- `POST /api/proctoring/flag` - Flag suspicious activity

### Results Endpoints
- `POST /api/results/submit` - Submit test results
- `GET /api/results/<student_id>` - Get student results
- `GET /api/results/test/<test_id>` - Get test analytics

## Features in Detail

### Gaze Tracking
The system uses AI-based computer vision to track student gaze during the exam:
- Detects when student looks away from the screen
- Generates alerts for suspicious behavior
- Logs all gaze tracking data for review

### Face Detection
- Verifies student identity using facial recognition
- Detects presence of unauthorized persons
- Ensures the registered student is taking the test

### Tab Switching Detection
- Monitors browser tab switching
- Detects attempts to visit other websites
- Logs all suspicious activity

### Real-Time Monitoring
- Live camera feed monitoring
- Real-time alert notifications
- Admin dashboard for proctoring oversight

## Troubleshooting

### Backend Issues
- **Port 5000 already in use:** Change Flask port in `app.py`
- **Missing dependencies:** Run `pip install -r requirements.txt` again
- **Database errors:** Delete `instance/` folder and reinitialize with `python create_db_sqlite.py`

### Frontend Issues
- **Node modules issues:** Delete `node_modules` folder and run `npm install` again
- **Port already in use:** Configure different port in `vite.config.js`
- **CSS not loading:** Ensure Tailwind CSS is properly configured

### Camera/Proctoring Issues
- **Camera not accessible:** Check browser permissions and camera availability
- **Face detection not working:** Ensure good lighting and webcam quality
- **WebSocket connection errors:** Verify backend is running and accessible

## Development Guidelines

### Code Style
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Use Prettier for code formatting

### Commits
```bash
git add .
git commit -m "feature: description of changes"
git push origin main
```

### Testing
Run tests before submitting pull requests:
```bash
# Backend tests
pytest

# Frontend tests
npm test
```

## Security Considerations

- **HTTPS:** Use HTTPS in production
- **CORS:** Configure CORS properly for production domain
- **Authentication:** Implement JWT tokens for secure API access
- **Data Encryption:** Encrypt sensitive data in database
- **Camera Permissions:** Implement proper camera permission handling

## Performance Optimization

- **Frontend:** Use lazy loading for components
- **Backend:** Implement caching for frequently accessed data
- **Database:** Add indexes on frequently queried fields
- **Video Streaming:** Compress video streams for efficient transmission

## Contributing

We welcome contributions from the community. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact & Support

- **Developer 1:** Rajeev Singh
- **Developer 2:** Rajdeep Mishra

For support, issues, or feature requests, please open an issue on the GitHub repository.

## Acknowledgments

- OpenCV for computer vision capabilities
- React community for excellent documentation
- Flask community for a lightweight web framework
- Tailwind CSS for utility-first styling

---

**Last Updated:** December 2025
**Version:** 1.0.0

