# **GrowFarm**

## 💥 Introduction

The proposed portal aims to provide a comprehensive and integrated platform for farmers, offering a range of features and services to enhance their agricultural practices. It addresses the challenges faced by farmers who need to navigate multiple platforms for information and services related to schemes, land details, APMC markets, and smart farming techniques. By providing a unique farmer ID and centralizing information, the portal streamlines access to crucial data such as scheme notifications, land details, APMC history, and facilitates processes like applying for loans and insurance.

Moreover, the portal incorporates smart farming capabilities, utilizing machine learning, artificial intelligence, and the internet of things to assist farmers with crop recommendations, disease detection, yield prediction, and weather forecasting. With the potential to make accurate future predictions based on collected farmer data, the portal holds promise in empowering farmers with valuable insights and resources for improved decision-making and agricultural outcomes.

It is built using React for the frontend, Express, Sockets Server, and Twilio for SMS service and communication, and MongoDB for the database and machine learning algorithms for disease detection, crop prediction, and crop recommendation.

## 💡 Why did we build this?

The portal was built to address the challenges faced by farmers in accessing crucial agricultural information and services. It aims to streamline decision-making by providing a centralized platform with a unique farmer ID for accessing schemes, land details, APMC history, and smart farming capabilities. The goal is to empower farmers with valuable insights, improve their decision-making, and enhance overall agricultural outcomes.

## 🚀 Technologies Used  

### 🧠 Machine Learning & AI  
| Technology | Description |
|------------|-------------|
| ![XGBoost](https://img.shields.io/badge/XGBoost-EB5B3C?style=for-the-badge&logo=xgboost&logoColor=white) | Extreme Gradient Boosting for optimized ML models |
| ![Mask R-CNN](https://img.shields.io/badge/Mask%20R--CNN-252525?style=for-the-badge) | Instance segmentation for object detection |
| ![RAG](https://img.shields.io/badge/RAG-FF9900?style=for-the-badge) | Retrieval-Augmented Generation for enhanced AI responses |
| ![Hugging Face](https://img.shields.io/badge/Huggingface-FFCC00?style=for-the-badge&logo=huggingface&logoColor=white) | Pre-trained NLP models & transformers |
| ![LangChain](https://img.shields.io/badge/LangChain-02569B?style=for-the-badge) | Framework for developing LLM-powered applications |

---

### 🌍 Web Technologies  
| Technology | Description |
|------------|-------------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) | Backend JavaScript runtime |
| ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white) | Frontend UI framework |
| ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white) | High-performance web framework for APIs |
| ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) | NoSQL database for scalable storage |
| ![OpenWeather API](https://img.shields.io/badge/OpenWeather-FF8000?style=for-the-badge) | Real-time weather data integration |
| ![Dialogflow](https://img.shields.io/badge/Dialogflow-FF9800?style=for-the-badge&logo=dialogflow&logoColor=white) | Conversational AI & chatbot framework |
| ![Twilio API](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white) | SMS & communication integration |

### 📱 Android Technology Stack

| 🛠️ Technology | 📋 Purpose in the Farmer‑Portal App |
|---------------|------------------------------------|
| ⚡ **Kotlin** | Modern, null‑safe language powering the whole app |
| 🎨 **Jetpack Compose + Material 3** | Declarative UI & sleek components for every screen |
| 🧭 **Navigation Compose** | Smooth, type‑safe in‑app routing (Home → Weather → Chatbot …) |
| 📊 **ViewModel + StateFlow** | Lifecycle‑aware reactive state management |
| 🌐 **Retrofit 2 & OkHttp 5** | Type‑safe REST client for all backend services |
| 🔄 **Coroutines + WorkManager** | Lightweight async ops & scheduled alerts (weather, schemes) |
| 💾 **Room** | Local caching of APMC prices, schemes & offline data |
| 🔗 **Hilt** | Dependency injection for singletons, repositories, ViewModels |
| 🔔 **Firebase Cloud Messaging** | Push notifications for subsidy & weather alerts |
| 🤖 **TensorFlow Lite** | On‑device crop‑disease detection & yield inference |

---

## 🛠️ Local development

That's pretty easy. To ensure that you are able to install everything properly, we would recommend you to have <b>Git</b>, <b>NPM</b> and <b>Node.js</b> installed.

1️⃣ We will first start with setting up the Local Project Environment:

```sh
git clone https://github.com/Neelpatel11/Growfarm-Digital-farmer-portal.git
cd Growfarm-Digital-farmer-portal
npm run install
```
Now we will add the environment variables in the client/ and server/

**2️⃣ Client**
```sh
cd client
npm install
npm start
```
For server setup, you need to add your MongoDB database URL to /config/mongoose.js.

**3️⃣ Server**
```sh
cd server
npm install
npm start
```

**4️⃣ FastAPI Setup**
```sh
cd fastapi-server
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🚜 Key Features of Growfarm  

### 👤 Digital Farmer Profile  
- Every farmer gets a **unique Farmer ID** after registration.  
- The **Farmer ID** helps in tracking:  
  - 🌱 **Farm Information**  
  - 📜 **Eligible Schemes**  
  - 📝 **Scheme Application History**  
  - 💰 **Billing & Loan History**  
  - 🛡️ **Insurance Records**  

---

### 🌾 Smart Farming (Crop Recommendation System)  
- Farmers receive **crop recommendations** based on:  
  - 🧪 **Soil Parameters** (Nitrogen, Phosphorus, Potassium levels)  
  - 🌦️ **Weather Conditions**  

---

### 🌦️ Weather Broadcast & Alerts  
- **Real-time weather updates** to help farmers plan their agricultural activities.  
- 🚨 **Bad weather alerts** to protect crops and prevent losses.  

---

### 📢 Alerts & Updates on New Schemes & Subsidies  
- 📜 **Timely notifications** about government schemes & financial aid.  
- 🚀 Helps farmers take advantage of available **subsidies & benefits**.  

---

### 🏛️ Schemes Application & Tracking  
- Farmers can **browse and apply** for schemes directly on the platform.  
- 🔄 **Real-time tracking** of application status.  

---

### 🧾 APMC Billing History  
- 📊 **Digital billing system** for tracking sales & payments.  
- ✅ Ensures **transparency & accountability** in transactions.  
- 📈 Helps in maintaining **organized financial records**.  

---

### 🌍 Farm Information Integration  
- Farmers can **verify Aadhaar details** to access their farm data.  
- 🖥️ Direct integration with **ANY ROR (Record of Rights)** system.  
- 🔗 All farm-related details in **one unified portal**—no need for multiple logins.  

---

## 🧾 Class Diagram

![Class diagram](https://user-images.githubusercontent.com/83646676/227933827-aa99f4fa-dd6e-4195-9757-63b6fdb0257c.png)

## 🧾 ER diagram of farmer portal:

![Farmer portal ER Diagram](https://user-images.githubusercontent.com/83646676/227935603-30440d00-b4b6-417d-8726-2195d0c5ea90.png)

## 🧾 ER diagram of government portal:

![Government portal Er Diagram](https://user-images.githubusercontent.com/83646676/227935683-71373929-2e04-4ba3-b89a-002742eff438.png)

## 💻 Interface Design of GrowFarm Portal

### General Dashboard Overview
![Overview](./client/public/imgs/Overview.jpg)

### Smart Farming: AI Crop Recommendation
Machine learning optimized crop recommendations based on regional soil indices and weather conditions.
![Crop Recommendation](./client/public/imgs/Crop%20Recommendation.jpg)

### Smart Farming: AI Disease Prediction
Analyze crop imagery using ResNet9 architectures to instantly detect foliar diseases and receive corrective actions.
![Disease Prediction](./client/public/imgs/Disease%20Prediction.jpg)

### Real-Time Weather Forecasting
![Weather Forecast](./client/public/imgs/Weather1.jpg)

### Alerts & Government Update System
Get real-time push notifications on verified Government schemes regarding soil cards and farming subsidies.
![Alerts System](./client/public/imgs/Alert%20And%20Update%20System.jpg)

### AI Conversational Agent
An integrated conversational chatbot to assist farmers with quick queries and platform navigation.
![Chatbot](./client/public/imgs/Chatbot%20Grow.jpg)

### Trading Portal & Farm Market
![Farm Market](./client/public/imgs/farm_market.png)

### Administrator Operations Dashboard
![Admin Dashboard](./client/public/imgs/admin.jpg)
