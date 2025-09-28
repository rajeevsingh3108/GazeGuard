import os
import random
import shutil
from itertools import islice

ofp = "Dataset/SplitData"
ifp = "Dataset/all"
splitRatio = {"train": 0.4, "val": 0.5, "test": 0.1}
classes = ["fake", "real"]

def split_data():
    try:
        shutil.rmtree(ofp)
    except OSError as e:
        os.mkdir(ofp)

    os.makedirs(f"{ofp}/train/images", exist_ok=True)
    os.makedirs(f"{ofp}/train/labels", exist_ok=True)
    os.makedirs(f"{ofp}/val/images", exist_ok=True)
    os.makedirs(f"{ofp}/val/labels", exist_ok=True)
    os.makedirs(f"{ofp}/test/images", exist_ok=True)
    os.makedirs(f"{ofp}/test/labels", exist_ok=True)

    listNames = os.listdir(ifp)
    uniqueNames = list(set([name.split('.')[0] for name in listNames]))

    random.shuffle(uniqueNames)

    lenData = len(uniqueNames)
    lenTrain = int(lenData * splitRatio['train'])
    lenVal = int(lenData * splitRatio['val'])
    lenTest = int(lenData * splitRatio['test'])

    if lenData != lenTrain + lenTest + lenVal:
        remaining = lenData - (lenTrain + lenTest + lenVal)
        lenTrain += remaining

    lengthToSplit = [lenTrain, lenVal, lenTest]
    Input = iter(uniqueNames)
    Output = [list(islice(Input, elem)) for elem in lengthToSplit]
    print(f'Total Images:{lenData} \nSplit: {len(Output[0])} {len(Output[1])} {len(Output[2])}')

    sequence = ['train', 'val', 'test']
    for i, out in enumerate(Output):
        for fileName in out:
            shutil.copy(f'{ifp}/{fileName}.jpg', f'{ofp}/{sequence[i]}/images/{fileName}.jpg')
            shutil.copy(f'{ifp}/{fileName}.txt', f'{ofp}/{sequence[i]}/labels/{fileName}.txt')

    print("Split Process Completed...")

    dataYaml = f'path: ../Data\n\
    train: ../train/images\n\
    val: ../val/images\n\
    test: ../test/images\n\
    \n\
    nc: {len(classes)}\n\
    names: {classes}'

    with open(f"{ofp}/data.yaml", 'a') as f:
        f.write(dataYaml)

    print("Data.yaml file Created...")

if __name__ == "__main__":
    split_data()
