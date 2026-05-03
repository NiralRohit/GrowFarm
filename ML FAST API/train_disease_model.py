"""
GrowFarm — Plant Disease Detection Model Trainer
==================================================
Uses Transfer Learning with pretrained MobileNetV2 for fast, accurate disease detection.
Downloads the PlantVillage dataset automatically and trains a classifier.

Usage:
  python train_disease_model.py

Output:
  Pickle/Plant_Diseas_v2.pth  — New trained model
"""

import os
import sys
import time
import shutil
import zipfile
import urllib.request
import json
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models
from PIL import Image

# ─── Configuration ───────────────────────────────────────────
DATASET_DIR = Path("Data/PlantVillage")
MODEL_SAVE_PATH = Path("Pickle/Plant_Diseas_v2.pth")
CLASS_NAMES_PATH = Path("Pickle/disease_classes_v2.json")
BATCH_SIZE = 32
NUM_EPOCHS = 8        # Transfer learning converges fast
LEARNING_RATE = 0.001
IMG_SIZE = 224         # MobileNetV2 expects 224x224
VALIDATION_SPLIT = 0.15

# ─── Disease Classes (38 classes from PlantVillage) ──────────
EXPECTED_CLASSES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
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


def download_dataset():
    """Download PlantVillage dataset if not present."""
    if DATASET_DIR.exists() and len(list(DATASET_DIR.iterdir())) > 10:
        print(f"✓ Dataset already exists at {DATASET_DIR} ({len(list(DATASET_DIR.iterdir()))} classes)")
        return True

    print("📥 Downloading PlantVillage dataset...")
    print("   This is a ~1GB download. Please be patient.\n")
    
    # Multiple mirror URLs for the PlantVillage dataset
    urls = [
        "https://data.mendeley.com/public-files/datasets/tywbtsjrjv/files/d5652a28-c1d8-4b76-97f3-72fb80f94efc/file_downloaded",
        "https://ml-datasets-public.s3.amazonaws.com/plantvillage.zip",
    ]
    
    zip_path = Path("Data/plantvillage.zip")
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    
    downloaded = False
    for url in urls:
        try:
            print(f"   Trying: {url[:60]}...")
            
            def progress_hook(count, block_size, total_size):
                percent = min(count * block_size * 100 / max(total_size, 1), 100)
                mb_done = count * block_size / (1024 * 1024)
                mb_total = total_size / (1024 * 1024) if total_size > 0 else 0
                sys.stdout.write(f"\r   Progress: {percent:.1f}% ({mb_done:.1f}/{mb_total:.1f} MB)")
                sys.stdout.flush()
            
            urllib.request.urlretrieve(url, str(zip_path), progress_hook)
            print("\n   ✓ Download complete!")
            downloaded = True
            break
        except Exception as e:
            print(f"\n   ✗ Failed: {e}")
            continue
    
    if not downloaded:
        print("\n❌ Could not download dataset automatically.")
        print("   Please download the PlantVillage dataset manually:")
        print("   1. Go to: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset")
        print("   2. Download and extract to: Data/PlantVillage/")
        print("   3. Each subfolder should be a disease class (e.g., Apple___Apple_scab/)")
        print("   4. Run this script again.\n")
        
        # Create a synthetic mini-dataset for demonstration
        print("🔧 Creating synthetic training data for demonstration...")
        create_synthetic_dataset()
        return True
    
    # Extract
    print("📦 Extracting dataset...")
    with zipfile.ZipFile(str(zip_path), 'r') as zf:
        zf.extractall("Data/")
    
    # Find the actual data directory (might be nested)
    for root, dirs, files in os.walk("Data/"):
        if len(dirs) > 20 and any('___' in d for d in dirs):
            if root != str(DATASET_DIR):
                shutil.move(root, str(DATASET_DIR))
            break
    
    # Cleanup
    if zip_path.exists():
        zip_path.unlink()
    
    print(f"✓ Dataset extracted to {DATASET_DIR}")
    return True


def create_synthetic_dataset():
    """
    Create a synthetic training dataset when the real PlantVillage 
    dataset cannot be downloaded. Uses carefully crafted synthetic images
    with color patterns that represent each disease class.
    """
    print("   Generating synthetic images for each class...")
    
    # Color profiles for each disease (RGB base + pattern)
    disease_colors = {
        'Apple___Apple_scab': [(34, 100, 34), (80, 70, 30)],       # Green + brown spots
        'Apple___Black_rot': [(34, 100, 34), (30, 20, 15)],        # Green + black spots
        'Apple___Cedar_apple_rust': [(34, 100, 34), (200, 100, 30)], # Green + orange spots
        'Apple___healthy': [(50, 150, 50), None],                    # Pure green
        'Blueberry___healthy': [(40, 130, 60), None],
        'Cherry_(including_sour)___Powdery_mildew': [(50, 130, 50), (220, 220, 220)], # White powder
        'Cherry_(including_sour)___healthy': [(45, 140, 55), None],
        'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': [(80, 160, 50), (150, 150, 130)],
        'Corn_(maize)___Common_rust_': [(80, 160, 50), (180, 90, 30)],  # Orange rust
        'Corn_(maize)___Northern_Leaf_Blight': [(80, 160, 50), (120, 100, 70)],
        'Corn_(maize)___healthy': [(90, 170, 60), None],
        'Grape___Black_rot': [(50, 120, 50), (40, 25, 20)],
        'Grape___Esca_(Black_Measles)': [(50, 120, 50), (100, 50, 40)],
        'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': [(50, 120, 50), (130, 90, 50)],
        'Grape___healthy': [(55, 130, 55), None],
        'Orange___Haunglongbing_(Citrus_greening)': [(120, 160, 40), (160, 160, 50)], # Yellowing
        'Peach___Bacterial_spot': [(45, 130, 50), (100, 70, 40)],
        'Peach___healthy': [(50, 140, 55), None],
        'Pepper,_bell___Bacterial_spot': [(40, 120, 40), (90, 60, 35)],
        'Pepper,_bell___healthy': [(45, 135, 45), None],
        'Potato___Early_blight': [(50, 130, 45), (120, 80, 40)],  # Concentric rings
        'Potato___Late_blight': [(50, 130, 45), (40, 35, 30)],    # Dark water-soaked  
        'Potato___healthy': [(55, 140, 50), None],
        'Raspberry___healthy': [(45, 130, 50), None],
        'Soybean___healthy': [(50, 140, 45), None],
        'Squash___Powdery_mildew': [(60, 140, 50), (230, 230, 230)],
        'Strawberry___Leaf_scorch': [(40, 100, 40), (120, 40, 40)],  # Red-purple scorch
        'Strawberry___healthy': [(45, 130, 50), None],
        'Tomato___Bacterial_spot': [(50, 130, 45), (80, 60, 35)],
        'Tomato___Early_blight': [(50, 130, 45), (110, 80, 45)],
        'Tomato___Late_blight': [(50, 130, 45), (35, 30, 28)],
        'Tomato___Leaf_Mold': [(50, 130, 45), (90, 100, 60)],  # Olive mold
        'Tomato___Septoria_leaf_spot': [(50, 130, 45), (160, 140, 100)],  # Tan spots
        'Tomato___Spider_mites Two-spotted_spider_mite': [(50, 130, 45), (200, 180, 150)],
        'Tomato___Target_Spot': [(50, 130, 45), (100, 75, 50)],
        'Tomato___Tomato_Yellow_Leaf_Curl_Virus': [(120, 160, 40), (180, 180, 50)], # Yellow curl
        'Tomato___Tomato_mosaic_virus': [(70, 150, 60), (110, 160, 70)],  # Mosaic pattern
        'Tomato___healthy': [(55, 145, 50), None],
    }
    
    import random
    import numpy as np
    
    NUM_IMAGES_PER_CLASS = 60  # More images = better training
    
    for class_name, colors in disease_colors.items():
        class_dir = DATASET_DIR / class_name
        class_dir.mkdir(parents=True, exist_ok=True)
        
        base_color = colors[0]
        spot_color = colors[1]
        
        for i in range(NUM_IMAGES_PER_CLASS):
            # Create base image with slight random variation
            img = np.zeros((256, 256, 3), dtype=np.uint8)
            
            # Fill with base color + noise
            for c in range(3):
                noise = np.random.randint(-20, 20, (256, 256))
                img[:, :, c] = np.clip(base_color[c] + noise, 0, 255)
            
            # Add leaf-like texture (gradient from center)
            cx, cy = 128 + random.randint(-20, 20), 128 + random.randint(-20, 20)
            for x in range(256):
                for y in range(256):
                    dist = ((x - cx)**2 + (y - cy)**2) ** 0.5
                    if dist > 120:
                        img[x, y] = [20, 30, 20]  # Dark background
                    elif dist > 100:
                        fade = (120 - dist) / 20
                        img[x, y] = [int(img[x,y,c] * fade + 20 * (1-fade)) for c in range(3)]
            
            # Add disease spots if diseased
            if spot_color is not None:
                num_spots = random.randint(8, 30)
                for _ in range(num_spots):
                    sx = random.randint(40, 216)
                    sy = random.randint(40, 216)
                    radius = random.randint(3, 15)
                    for dx in range(-radius, radius + 1):
                        for dy in range(-radius, radius + 1):
                            if dx*dx + dy*dy <= radius*radius:
                                nx, ny = sx + dx, sy + dy
                                if 0 <= nx < 256 and 0 <= ny < 256:
                                    for c in range(3):
                                        img[nx, ny, c] = min(255, max(0, spot_color[c] + random.randint(-15, 15)))
            
            # Save
            pil_img = Image.fromarray(img)
            pil_img.save(str(class_dir / f"{class_name}_{i:04d}.jpg"), quality=90)
        
        sys.stdout.write(f"\r   Generated {class_name}: {NUM_IMAGES_PER_CLASS} images")
        sys.stdout.flush()
    
    print(f"\n   ✓ Created {len(disease_colors)} classes × {NUM_IMAGES_PER_CLASS} images = {len(disease_colors) * NUM_IMAGES_PER_CLASS} total images")


def build_model(num_classes):
    """
    Build a MobileNetV2-based classifier with transfer learning.
    MobileNetV2 is lightweight, fast, and achieves excellent accuracy.
    """
    # Use pretrained MobileNetV2 (trained on ImageNet — 1.4M images)
    try:
        model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    except Exception:
        # Fallback for older torchvision
        model = models.mobilenet_v2(pretrained=True)
    
    # Freeze early layers (they already know generic features)
    for name, param in model.named_parameters():
        if 'features.14' not in name and 'features.15' not in name and 'features.16' not in name and 'features.17' not in name and 'features.18' not in name and 'classifier' not in name:
            param.requires_grad = False
    
    # Replace the classifier head for our disease classes
    num_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(num_features, 512),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(512, num_classes)
    )
    
    return model


def train():
    """Main training pipeline."""
    print("=" * 60)
    print("  🌿 GrowFarm Disease Detection — Model Training")
    print("=" * 60)
    print()
    
    # Step 1: Get dataset
    if not download_dataset():
        return
    
    # Step 2: Data transforms
    print("\n📊 Setting up data pipeline...")
    
    train_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(0.5),
        transforms.RandomVerticalFlip(0.3),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.RandomAffine(degrees=0, translate=(0.1, 0.1), scale=(0.9, 1.1)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])  # ImageNet norms
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Load dataset
    full_dataset = datasets.ImageFolder(str(DATASET_DIR), transform=train_transform)
    class_names = full_dataset.classes
    num_classes = len(class_names)
    
    print(f"   Classes: {num_classes}")
    print(f"   Total images: {len(full_dataset)}")
    
    # Split into train/val
    val_size = int(len(full_dataset) * VALIDATION_SPLIT)
    train_size = len(full_dataset) - val_size
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
    
    # Apply val transform to validation set
    val_dataset.dataset.transform = val_transform
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=True)
    
    print(f"   Train: {train_size} images, Val: {val_size} images")
    print(f"   Batches/epoch: {len(train_loader)}")
    
    # Step 3: Build model
    print("\n🧠 Building MobileNetV2 model (transfer learning)...")
    model = build_model(num_classes)
    
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"   Total parameters: {total_params:,}")
    print(f"   Trainable parameters: {trainable_params:,} ({trainable_params/total_params*100:.1f}%)")
    
    # Step 4: Training setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"   Device: {device}")
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), 
                                  lr=LEARNING_RATE, weight_decay=0.01)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=NUM_EPOCHS)
    
    # Step 5: Training loop
    print(f"\n🏋️ Training for {NUM_EPOCHS} epochs...")
    print("-" * 60)
    
    best_val_acc = 0.0
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
    
    for epoch in range(NUM_EPOCHS):
        epoch_start = time.time()
        
        # ── Train ──
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            # Progress bar
            if (batch_idx + 1) % 10 == 0 or batch_idx == len(train_loader) - 1:
                sys.stdout.write(f"\r   Epoch [{epoch+1}/{NUM_EPOCHS}] Batch [{batch_idx+1}/{len(train_loader)}] "
                               f"Loss: {running_loss/(batch_idx+1):.4f} Acc: {100.*correct/total:.2f}%")
                sys.stdout.flush()
        
        train_loss = running_loss / len(train_loader)
        train_acc = 100. * correct / total
        
        # ── Validate ──
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()
        
        val_loss = val_loss / len(val_loader)
        val_acc = 100. * val_correct / val_total
        
        scheduler.step()
        
        epoch_time = time.time() - epoch_start
        
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        print(f"\n   ✓ Epoch {epoch+1}/{NUM_EPOCHS} ({epoch_time:.1f}s) — "
              f"Train: {train_acc:.2f}% | Val: {val_acc:.2f}% | "
              f"LR: {scheduler.get_last_lr()[0]:.6f}")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), str(MODEL_SAVE_PATH))
            print(f"   ⭐ New best model saved! (Val Acc: {val_acc:.2f}%)")
    
    print("-" * 60)
    print(f"\n🏆 Training Complete!")
    print(f"   Best Validation Accuracy: {best_val_acc:.2f}%")
    print(f"   Model saved to: {MODEL_SAVE_PATH}")
    
    # Save class names
    with open(str(CLASS_NAMES_PATH), 'w') as f:
        json.dump(class_names, f, indent=2)
    print(f"   Class names saved to: {CLASS_NAMES_PATH}")
    
    # Save training history
    with open('Pickle/training_history.json', 'w') as f:
        json.dump(history, f, indent=2)
    
    return model, class_names


if __name__ == "__main__":
    train()
