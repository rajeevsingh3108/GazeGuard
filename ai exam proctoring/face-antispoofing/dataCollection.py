import cv2
import cvzone
from cvzone.FaceDetectionModule import FaceDetector
from time import time

classID = 0
outputFolderPath = 'Dataset/DataCollect'
confidence = 0.8
save = True

blurThreshold = 35
debug = False

offsetPercentageW = 10
offsetPercentageH = 20
camWidth, camHeight = 640, 480
floatingPoint = 6

def collect_data():
    cap = cv2.VideoCapture(0)
    cap.set(3, camWidth)
    cap.set(4, camHeight)

    detector = FaceDetector()
    
    while True:
        success, img = cap.read()
        if not success:
            print("Failed to grab frame")
            break  
        imgOut = img.copy()  

        img, bboxs = detector.findFaces(img, draw=False)

        listBlur = []
        listInfo = []
        if bboxs:
            for bbox in bboxs:
                x, y, w, h = bbox["bbox"]
                score = bbox["score"][0]

                if score > confidence:
                    offsetW = (offsetPercentageW / 100) * w
                    x = int(x - offsetW)
                    w = int(w + offsetW * 2)
                    offsetH = (offsetPercentageH / 100) * h
                    y = int(y - offsetH * 3)
                    h = int(h + offsetH * 3.5)

                    if x < 0: x = 0
                    if y < 0: y = 0
                    if w < 0: w = 0
                    if h < 0: h = 0

                    imgFace = img[y:y + h, x:x + w]
                    blurValue = int(cv2.Laplacian(imgFace, cv2.CV_64F).var())
                    if blurValue > blurThreshold:
                        listBlur.append(True)
                    else:
                        listBlur.append(False)

                    ih, iw, _ = img.shape
                    xc, yc = x + w / 2, y + h / 2
                    xcn, ycn = round(xc / iw, floatingPoint), round(yc / ih, floatingPoint)
                    wn, hn = round(w / iw, floatingPoint), round(h / ih, floatingPoint)

                    if xcn > 1: xcn = 1
                    if ycn > 1: ycn = 1
                    if wn > 1: wn = 1
                    if hn > 1: hn = 1

                    listInfo.append(f"{classID} {xcn} {ycn} {wn} {hn}\n")

                    cv2.rectangle(imgOut, (x, y, w, h), (255, 0, 0), 3)
                    cvzone.putTextRect(imgOut, f'Score: {int(score * 100)}% Blur: {blurValue}', (x, y - 0),
                                       scale=2, thickness=3)

        if save:
            if all(listBlur) and listBlur != []:
                timeNow = time()
                timeNow = str(timeNow).split('.')
                timeNow = timeNow[0] + timeNow[1]
                cv2.imwrite(f"{outputFolderPath}/{timeNow}.jpg", img)
                for info in listInfo:
                    with open(f"{outputFolderPath}/{timeNow}.txt", 'a') as f:
                        f.write(info)

        cv2.imshow("Image", imgOut)
        cv2.waitKey(1)

if __name__ == "__main__":
    collect_data()
