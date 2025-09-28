# GazeGuard

GazeGuard is an advanced AI-powered proctoring solution designed to ensure secure and fair online coding assessments. The system integrates real-time retina tracking, face recognition, device detection, and sentiment analysis to monitor candidate focus and emotional state during exams.

## Project Status

> **Note:** This project is not fully completed. Currently, the following modules are completed:
> - Authentication
> - Face Recognition (Anti-Spoofing)
> - Device Detection
>
> Modules in progress:
> - Gaze Tracking
> - Sentiment Detection
> - Accuracy Benchmarking (planned on 100+ test cases)

## Key Features

- **Authentication:** Secure login and user verification using Google OAuth.
- **Face Recognition & Anti-Spoofing:** Detects and verifies candidate identity, prevents spoofing attempts.
- **Device Detection:** Monitors and logs unauthorized device usage during assessments.
- **Gaze Tracking (In Progress):** Real-time retina tracking to ensure candidate focus.
- **Sentiment Analysis (In Progress):** Monitors emotional state to detect stress or suspicious behavior.

## Team Leadership

- Led a team of 4 developers in designing and implementing GazeGuard.
- Oversaw system architecture, task delegation, and integration of retina tracking with sentiment analysis.
- Coordinated development and integration of all modules.

## Architecture & Workflow

1. **Authentication**: User logs in via secure Google OAuth.
2. **Face Recognition**: System verifies identity and checks for spoofing.
3. **Device Detection**: Monitors for unauthorized devices.
4. **Gaze & Sentiment Analysis**: (In progress) Tracks eye movement and emotional state.
5. **Logging & Reporting**: All events are logged for review.

## Repository Structure

- `Authentication Code/` — Node.js backend and React frontend for authentication
- `ai exam proctoring/`
  - `face-antispoofing/` — Face recognition and anti-spoofing
  - `device-detection/` — Device detection scripts
  - `multi-face-detection/` — Multi-face monitoring

## Getting Started

1. Clone the repository:
   ```sh
   git clone https://github.com/rajeevsingh3108/GazeGuard.git
   ```
2. See individual module folders for setup instructions.

## Roadmap

- [x] Authentication
- [x] Face Recognition & Anti-Spoofing
- [x] Device Detection
- [ ] Gaze Tracking
- [ ] Sentiment Detection
- [ ] Accuracy Benchmarking

## License

This project is licensed under the MIT License.

---

For more details, visit the [GitHub repository](https://github.com/rajeevsingh3108/GazeGuard).
