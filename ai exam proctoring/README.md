# AI-Powered Exam Proctoring System -- Gazeguard

Overview

This project implements an AI-powered exam proctoring system using computer vision and deep learning to ensure the integrity of remote exams. The system detects mobile phone usage and multiple faces, raising alerts when suspicious activity is detected.

Features

1. Mobile Phone Detection

Uses YOLOv8 to detect mobile devices in real time.
Automatically stops the exam if a mobile phone is detected.
Logs detection events with timestamps.


2. Multi-Face Detection

Uses OpenCV’s SSD face detection model to track multiple faces.
If more than one face is detected, the system raises an alert and closes the camera.

3.Face-antispoofing

Used Yolov8 to train on a generated dataset.

