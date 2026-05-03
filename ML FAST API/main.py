"""
GrowFarm — Updated ML Inference Server
========================================
Supports both the original ResNet9 model and the new MobileNetV2 model.
Automatically uses the best available model.
"""
import re
import io
import json
import os
import pandas as pd
import requests
import pickle
import torch
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response
from utils.disease import disease_dic
from utils.fertilizer import fertilizer_dic
from utils.model import ResNet9

# ─── Disease Classes (original 38) ──────────────────────────
disease_classes = [
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

# ─── Model Loading (with fallback) ──────────────────────────
disease_model = None
model_type = None
active_classes = disease_classes

# Try loading new MobileNetV2 model first (better accuracy)
v2_model_path = 'Pickle/Plant_Diseas_v2.pth'
v2_classes_path = 'Pickle/disease_classes_v2.json'

if os.path.exists(v2_model_path):
    try:
        # Load class names
        if os.path.exists(v2_classes_path):
            with open(v2_classes_path, 'r') as f:
                active_classes = json.load(f)
        
        # Build MobileNetV2 model
        model = models.mobilenet_v2(weights=None)
        num_features = model.classifier[1].in_features
        model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(0.3),
            torch.nn.Linear(num_features, 512),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.2),
            torch.nn.Linear(512, len(active_classes))
        )
        model.load_state_dict(torch.load(v2_model_path, map_location='cpu', weights_only=False))
        model.eval()
        disease_model = model
        model_type = "MobileNetV2 (Trained)"
        print(f"[DiseaseAI] ✓ Loaded MobileNetV2 model ({len(active_classes)} classes)")
    except Exception as e:
        print(f"[DiseaseAI] ✗ MobileNetV2 load failed: {e}")

# Fallback to original ResNet9 model
if disease_model is None:
    try:
        model = ResNet9(3, len(disease_classes))
        model.load_state_dict(torch.load('Pickle/Plant_Diseas.pth', map_location='cpu', weights_only=False))
        model.eval()
        disease_model = model
        model_type = "ResNet9 (Original)"
        active_classes = disease_classes
        print(f"[DiseaseAI] ✓ Loaded ResNet9 model ({len(disease_classes)} classes)")
    except Exception as e:
        print(f"[DiseaseAI] ✗ ResNet9 load failed: {e}")
        print("[DiseaseAI] ⚠ No disease model available!")

print(f"[DiseaseAI] Active model: {model_type}")

# ─── Other Models ────────────────────────────────────────────
pipe = pickle.load(open('Pickle/Crop_Rec.pkl','rb'))
pipe1 = pickle.load(open('Pickle/Yield_final.pkl','rb'))

df = pd.read_csv('Data/crop_recommendation.csv')
req = pd.read_csv('Data/FertilizerData.csv')
data3 = pd.read_excel('Data/Gujarat_Village_Final.xlsx')

lb = pipe.classes_.tolist()

# ─── Image Transform ────────────────────────────────────────
# MobileNetV2 needs ImageNet normalization
if model_type and 'MobileNet' in model_type:
    inference_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
else:
    inference_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.ToTensor(),
    ])

# ─── FastAPI App ─────────────────────────────────────────────
app1 = FastAPI(
    title="Agriculture Service by Grow Farm",
    description="AI-powered crop recommendation, disease detection, and yield prediction",
    version="2.0.0",
)

app1.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Helper Functions ────────────────────────────────────────
def predict_yield(dic):
    city = dic.get('location')
    season = dic.get('season')
    area = dic.get('Area')
    crop = dic.get('crop')
    nit = dic.get('nit')
    pot = dic.get('pot')
    phos = dic.get('phos')
    ph = dic.get('ph')
    apiid = 'b56e6807765bfa742b5c07f6b3f58deb'
    state = "Gujarat"
    url1 = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={apiid}"
    response = requests.get(url1).json()
    calvin1 = response['main']['temp']
    temp1 = float(calvin1 - 273)
    data = pd.DataFrame(
        {"State_Name": state, "District_Name": city, "Crop_Year": 2022, "Season": season,
         "Crop": crop, "Area": area, "N": [nit], "P": [pot], "K": [phos], "PH": [ph], "TEM": [temp1]})
    res = pipe1.predict(data)
    return {season: res.tolist()}


def predict_res(inp):
    city = inp.get("location")
    n = inp.get("nit")
    p = inp.get("pot")
    k = inp.get("phos")
    ph = inp.get("ph")
    rain = inp.get("rain")
    apiid = 'b56e6807765bfa742b5c07f6b3f58deb'
    URL = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={apiid}"
    response = requests.get(URL).json()
    calvin = response['main']['temp']
    temp = float(calvin - 273)
    humi = response['main']['humidity']
    data = pd.DataFrame({"N": [n], "P": [p], "K": [k], "temperature": temp, "humidity": humi, "ph": [ph], "rainfall": [rain]})
    res = pipe.predict(data)
    probab = pipe.predict_proba(data)
    final_crop = sorted(list(enumerate(probab[0])), reverse=True, key=lambda x: x[1])[0:5]
    result = []
    for i in final_crop:
        crp = lb[i[0]]
        filt = req['Crop'] == crp
        nitrogen = req.loc[filt, "N"].tolist()
        phosp = req.loc[filt, "P"].tolist()
        calsh = req.loc[filt, "K"].tolist()
        ph_val = req.loc[filt, "pH"].tolist()
        temp_avg = df[df['label'] == crp]['temperature'].mean()
        hum_avg = df[df['label'] == crp]['humidity'].mean()
        rain_avg = df[df['label'] == crp]['rainfall'].mean()
        result.append({
            'Crop': lb[i[0]], 'Prob': i[1],
            'Requir_Nitro': nitrogen[0] if nitrogen else 0,
            'Require_Phosp': phosp[0] if phosp else 0,
            'Require_cal': calsh[0] if calsh else 0,
            'Requir_Ph': ph_val[0] if ph_val else 0,
            'Require_temp': temp_avg.tolist() if hasattr(temp_avg, 'tolist') else temp_avg,
            'Require_humidity': hum_avg.tolist() if hasattr(hum_avg, 'tolist') else hum_avg,
            'Require_rain': rain_avg.tolist() if hasattr(rain_avg, 'tolist') else rain_avg,
            'User_temp': temp, 'User_humidity': humi
        })
    return result


# ─── Routes ──────────────────────────────────────────────────
@app1.get('/{id}')
def index(id):
    return {'id': id}

api_key_forcast = '7ec233d4e007782a359aac89def2d631'

@app1.get('/weather/{city}')
def Weather_forecast(city):
    url = f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key_forcast}'
    r = requests.get(url)
    data = r.json()
    name = data['name']
    lon = data['coord']['lon']
    lat = data['coord']['lat']
    url2 = f'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key_forcast}'
    req2 = requests.get(url2)
    data2 = req2.json()
    final = []
    for i in range(40):
        wet = data2['list'][i]['weather'][0]['main']
        disc = data2['list'][i]['weather'][0]['description']
        temp_min = data2['list'][i]['main']['temp_min']
        temp_max = data2['list'][i]['main']['temp_max']
        time_val = data2['list'][i]['dt_txt'].split(' ')
        wind = data2['list'][0]['wind']['speed']
        final.append({time_val[0]: {time_val[1]: {'Weather': disc, 'temp_min': temp_min, 'temp_max': temp_max, 'wind': wind, 'Allover': wet}}})
    return final

@app1.get('/District/{dist}')
def find_city(dist):
    temp = data3[data3['District'] == dist]
    res = temp['Taluka'].unique().tolist()
    village_map = []
    for i in res:
        temp2 = data3[data3['Taluka'] == i]
        village = temp2['Village'].unique().tolist()
        village_map.append({i: village})
    return res, village_map

@app1.get('/Crop_Recommandation/{city}/{N}/{P}/{K}/{Ph}/{rain}')
def predict(city, N: int, P: int, K: int, Ph: str, rain: str):
    result_crop = predict_res({"location": city, "nit": N, "pot": P, "phos": K, "ph": float(Ph), "rain": float(rain)})
    data1 = json.dumps(result_crop)
    data = json.loads(data1)
    return data

@app1.get('/Crop_Yield/{dist}/{season}/{crop}/{area}/{N}/{P}/{K}/{Ph}')
def production(dist, season, crop, area: int, N: int, P: int, K: int, Ph: str):
    total_production = predict_yield({"location": dist, "season": season, "crop": crop, "Area": area, "nit": N, "pot": P, "phos": K, "ph": float(Ph)})
    return {'Yield': total_production}


# ─── DISEASE DETECTION ENDPOINT ──────────────────────────────
@app1.post('/Crop_Diseas')
async def prediction_view(file: UploadFile = File(...)):
    try:
        if disease_model is None:
            return {"error": "No disease model loaded", "Diseas": "Model not available", 
                    "Steps & Suggestions": "Please train the model first using train_disease_model.py"}
        
        bytes_str = io.BytesIO(await file.read())
        image = Image.open(bytes_str)
        
        # Convert to RGB (handles RGBA, grayscale, palette images)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Apply the correct transform for the active model
        img_t = inference_transform(image)
        img_u = torch.unsqueeze(img_t, 0)

        # Run inference
        with torch.no_grad():
            yb = disease_model(img_u)
        
        # Get softmax probabilities
        probabilities = F.softmax(yb, dim=1)
        
        # Top-5 predictions
        top5_probs, top5_indices = torch.topk(probabilities, min(5, len(active_classes)), dim=1)
        
        # Top prediction
        top_idx = top5_indices[0][0].item()
        top_prob = top5_probs[0][0].item()
        prediction = active_classes[top_idx]
        
        # Format for display
        final = prediction.replace('___', ' ').replace('_', ' ')
        
        # Get disease info
        prediction1 = str(disease_dic.get(prediction, "No additional information available for this disease."))
        to_clean = re.compile('<.*?>')
        cleantext = re.sub(to_clean, '', prediction1)
        
        # Build alternatives
        alternatives = []
        for i in range(1, min(5, len(top5_indices[0]))):
            alt_idx = top5_indices[0][i].item()
            alt_prob = top5_probs[0][i].item()
            alt_name = active_classes[alt_idx].replace('___', ' ').replace('_', ' ')
            alternatives.append({
                "Disease": alt_name,
                "Confidence": round(alt_prob * 100, 2)
            })
        
        print(f"[DiseaseAI] {model_type}: {final} ({top_prob*100:.1f}%)")
        
        return {
            "Diseas": final,
            "Confidence": round(top_prob * 100, 2),
            "Steps & Suggestions": cleantext,
            "Alternatives": alternatives,
            "RawClass": prediction,
            "ModelUsed": model_type
        }
    except Exception as e:
        print(f"[DiseaseAI] Error: {e}")
        return {
            "error": str(e),
            "Diseas": "Error analyzing image",
            "Confidence": 0,
            "Steps & Suggestions": "Please try uploading a clear photo of a single crop leaf.",
            "Alternatives": [],
            "RawClass": ""
        }


# ─── Health Check ────────────────────────────────────────────
@app1.get('/health')
def health():
    return {
        "status": "healthy",
        "disease_model": model_type,
        "disease_classes": len(active_classes),
        "crop_model": "loaded",
        "yield_model": "loaded"
    }
