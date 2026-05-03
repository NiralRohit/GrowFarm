import os
import sys
import pickle
import pandas as pd
import torch

def test():
    print("Testing file paths...")
    paths = [
        'Pickle/Crop_Rec.pkl',
        'Pickle/Yield_final.pkl',
        'Data/crop_recommendation.csv',
        'Data/FertilizerData.csv',
        'Data/Gujarat_Village_Final.xlsx'
    ]
    for p in paths:
        if os.path.exists(p):
            print(f"✅ Found: {p}")
        else:
            print(f"❌ Missing: {p}")
            
    try:
        print("Loading Crop_Rec.pkl...")
        with open('Pickle/Crop_Rec.pkl', 'rb') as f:
            pipe = pickle.load(f)
        print("✅ Crop_Rec loaded")
    except Exception as e:
        print(f"❌ Crop_Rec failed: {e}")

    try:
        print("Loading Yield_final.pkl...")
        with open('Pickle/Yield_final.pkl', 'rb') as f:
            pipe1 = pickle.load(f)
        print("✅ Yield_final loaded")
    except Exception as e:
        print(f"❌ Yield_final failed: {e}")

    try:
        print("Loading Excel data...")
        data3 = pd.read_excel('Data/Gujarat_Village_Final.xlsx')
        print(f"✅ Excel loaded ({len(data3)} rows)")
    except Exception as e:
        print(f"❌ Excel failed: {e}")

if __name__ == "__main__":
    test()
