import cv2
import numpy as np
modelFile = "res10_300x300_ssd_iter_140000_fp16.caffemodel"
configFile = "deploy.prototxt"
net = cv2.dnn.readNetFromCaffe(configFile, modelFile)
cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()
    if not ret:
        break

    (h, w) = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0,(300, 300), (104.0, 177.0, 123.0))
    net.setInput(blob)
    detections = net.forward()
    num_faces = 0
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > 0.6:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (startX, startY, endX, endY) = box.astype("int")
            num_faces += 1
            cv2.rectangle(frame, (startX, startY), (endX, endY), (255, 0, 0), 2)
    
    if num_faces > 1:
        cv2.putText(frame, "SUSPICIOUS: Multiple Faces Detected!", (50, 50),cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 3)
        print("SUSPICIOUS: Multiple Faces Detected! Closing Camera...")
        cap.release()
        cv2.destroyAllWindows()
        exit()

    cv2.imshow("Face Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

