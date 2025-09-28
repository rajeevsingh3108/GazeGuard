# GazeGaurd Step 1 Login with Google OAuth2.0 and JWT Authentication
This project demonstrates how to implement Google OAuth2.0 authentication in a React application, with a Node.js backend using Express. The authentication flow includes obtaining an authorization code from Google, exchanging it for access and ID tokens, and using JWT for secure session management.
## Features
- Google OAuth2.0 integration for user authentication.
- JWT-based session management.
- Secure storage of tokens.
- Simple React frontend for user interaction.
- Express backend to handle OAuth2.0 flow and token management.
## Prerequisites
- Node.js and npm installed on your machine.
- A Google Cloud project with OAuth2.0 credentials (Client ID and Client Secret).
## Setup Instructions
### 1. Google Cloud Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to "APIs & Services" > "Credentials".
4. Click on "Create Credentials" and select "OAuth 2.0 Client IDs".
5. Set the application type to "Web application".
6. Add authorized redirect URIs (e.g., `http://localhost:5000/auth
/google/callback`).
7. Save your Client ID and Client Secret.
### 2. Backend Setup
1. Navigate to the `config` directory.
2. Create a `.env` file and add your Google Client ID, Client Secret, and
   PORT number:
   ```
   GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
   PORT=5000
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
### 3. Frontend Setup
1. Navigate to the `client` directory.
2. Create a `.env` file and add your Google Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=YOUR
   _CLIENT_ID_HERE
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the React application:
   ```bash
   npm start
   ```
### 4. Testing the Application
1. Open your browser and navigate to `http://localhost:3000`.
2. Click on the "Login with Google" button.
3. You will be redirected to Google's OAuth2.0 consent screen.
4. After consenting, you will be redirected back to the application, and your
   user information will be displayed.
## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
