from ultralytics import YOLO

def train_model():
    model = YOLO('yolov8n.pt')
    model.train(data='Dataset/SplitData/dataOffline.yaml', epochs=3)

if __name__ == "__main__":
    train_model()
