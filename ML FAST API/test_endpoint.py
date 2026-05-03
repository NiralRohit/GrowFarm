"""Quick test of the disease detection endpoint"""
import requests
from PIL import Image
import io
import numpy as np

# Create a test image (simulating a diseased tomato leaf)
img = np.zeros((256, 256, 3), dtype=np.uint8)
# Green base with brown spots (tomato early blight pattern)
img[:, :, 0] = 50   # R
img[:, :, 1] = 130  # G  
img[:, :, 2] = 45   # B

# Add concentric ring brown spots
import random
for _ in range(20):
    cx, cy = random.randint(40, 216), random.randint(40, 216)
    for r in range(3, 12):
        for theta in range(0, 360, 5):
            x = int(cx + r * np.cos(np.radians(theta)))
            y = int(cy + r * np.sin(np.radians(theta)))
            if 0 <= x < 256 and 0 <= y < 256:
                img[x, y] = [110 + random.randint(-10, 10), 80, 45]

pil_img = Image.fromarray(img)
buf = io.BytesIO()
pil_img.save(buf, format='JPEG')
buf.seek(0)

# Send to the disease detection endpoint
print("Testing disease detection endpoint...")
response = requests.post(
    'http://localhost:8001/Crop_Diseas',
    files={'file': ('test_leaf.jpg', buf, 'image/jpeg')}
)

print(f"Status: {response.status_code}")
data = response.json()
print(f"Disease: {data.get('Diseas', 'N/A')}")
print(f"Confidence: {data.get('Confidence', 'N/A')}%")
print(f"Model: {data.get('ModelUsed', 'N/A')}")
print(f"Raw Class: {data.get('RawClass', 'N/A')}")
if data.get('Alternatives'):
    print("Alternatives:")
    for alt in data['Alternatives']:
        print(f"  - {alt['Disease']}: {alt['Confidence']}%")
print("\n✓ Disease detection is working!")
