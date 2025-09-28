import cv2
from ultralytics import YOLO
import time
from datetime import datetime
model = YOLO('yolov8m.pt')
cap = cv2.VideoCapture(0)
CELL_PHONE_CLASS_ID = 67
CONFIDENCE_THRESHOLD = 0.6
log_file = open("detection_log.txt","a", encoding="utf-8")
prev_time = time.time()
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_resized = cv2.resize(frame, (640, 480))
    results = model(frame_resized)[0]
    boxes = results.boxes

    for box in boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        x1, y1, x2, y2 = map(int, box.xyxy[0])

        if cls == CELL_PHONE_CLASS_ID and conf >= CONFIDENCE_THRESHOLD:
            color = (0, int(255 * conf), 255 - int(255 * conf))
            label = f"Cell Phone: {conf:.2f}"
            cv2.rectangle(frame_resized, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame_resized, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_file.write(f"{timestamp} - Suspicious Activity Detected! (Cell Phone) - Box: ({x1},{y1},{x2},{y2})\n")
            log_file.flush()
            cv2.putText(frame_resized, "Suspicious Activity Detected!", (50, 50),cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

            print("Mobile Detected! Closing Camera...")
            cap.release()
            log_file.close()
            cv2.destroyAllWindows()
            exit()

    current_time = time.time()
    fps = 1 / (current_time - prev_time)
    prev_time = current_time
    cv2.putText(frame_resized, f"FPS: {fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    cv2.imshow('Advanced Cell Phone Detection', frame_resized)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
log_file.close()
cv2.destroyAllWindows()
