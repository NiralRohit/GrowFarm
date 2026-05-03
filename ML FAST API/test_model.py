"""Quick test to verify the disease detection model loads and works"""
import sys
print(f"Python: {sys.version}")

import torch
print(f"PyTorch: {torch.__version__}")

from utils.model import ResNet9
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import io
import numpy as np

# Disease classes (same as main.py)
disease_classes = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
    'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
]

print(f"\nTotal classes: {len(disease_classes)}")

# Load model
model = ResNet9(3, len(disease_classes))
model.load_state_dict(torch.load('Pickle/Plant_Diseas.pth', map_location='cpu', weights_only=False))
model.eval()
print(f"Model loaded! Parameters: {sum(p.numel() for p in model.parameters()):,}")

# Create a synthetic test image (green leaf = should predict healthy)
print("\n--- Testing with synthetic green leaf image ---")
green_img = Image.new('RGB', (256, 256), (34, 139, 34))  # Forest green
transform = transforms.Compose([transforms.Resize(256), transforms.ToTensor()])
img_t = transform(green_img)
img_u = torch.unsqueeze(img_t, 0)

with torch.no_grad():
    output = model(img_u)
    probs = F.softmax(output, dim=1)
    top5_probs, top5_indices = torch.topk(probs, 5, dim=1)

print("Top 5 predictions for GREEN image:")
for i in range(5):
    idx = top5_indices[0][i].item()
    prob = top5_probs[0][i].item()
    print(f"  {i+1}. {disease_classes[idx]} — {prob*100:.2f}%")

# Create a brown spotted image (should predict a disease)
print("\n--- Testing with brown-spotted image ---")
brown_img = Image.new('RGB', (256, 256), (34, 139, 34))  # Start green
pixels = brown_img.load()
# Add brown spots
for x in range(50, 200, 15):
    for y in range(50, 200, 15):
        for dx in range(-5, 6):
            for dy in range(-5, 6):
                if 0 <= x+dx < 256 and 0 <= y+dy < 256:
                    pixels[x+dx, y+dy] = (139, 69, 19)  # Brown spots

img_t2 = transform(brown_img)
img_u2 = torch.unsqueeze(img_t2, 0)

with torch.no_grad():
    output2 = model(img_u2)
    probs2 = F.softmax(output2, dim=1)
    top5_probs2, top5_indices2 = torch.topk(probs2, 5, dim=1)

print("Top 5 predictions for BROWN-SPOTTED image:")
for i in range(5):
    idx = top5_indices2[0][i].item()
    prob = top5_probs2[0][i].item()
    print(f"  {i+1}. {disease_classes[idx]} — {prob*100:.2f}%")

print("\n✓ Model is functional!")
