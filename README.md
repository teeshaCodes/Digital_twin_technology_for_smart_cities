# UrbanPulse — Smart City Digital Twin Dashboard

UrbanPulse is a full-stack, real-time Digital Twin simulation and monitoring dashboard designed for city administrators and citizens. It integrates weather, air quality index (AQI), and traffic telemetry, showing live conditions on a dark-styled interactive map. It uses a **scikit-learn cyclical time-series regression model** to predict future pollution and traffic trends and features crowdsourced reporting and administrative zone controls.

---

## Key Features

1. **Dual Perspective HUD**:
   - **City Admin View**: Full telemetry cards, Recharts analytical dashboards, zone drawing overlay, alert controls, and raw CSV data exporters.
   - **Citizen Mobile HUD**: High-readability advisories ("Is it safe to go outside?"), route planners that suggest paths avoiding heavily congested or polluted zones, issue filings (potholes, garbage, water leaks), and crowdsourced logs.
2. **Interactive Map (CartoDB Dark Matter + Leaflet)**:
   - Dynamic heatmaps (sensor grid overlays mapping live temp, traffic, and AQI fluctuations).
   - Address search and automatic panning using keyless Nominatim.
   - Custom SVG pulsing markers representing crowdsourced issues.
3. **Data Aggregation & High-Fidelity Simulation Fallback**:
   - Poller service aggregates metrics from live APIs (OpenWeather/AQICN/TomTom) when keys are supplied in `.env`.
   - In keyless/offline mode, a realistic Simulation Engine generates cyclical daily fluctuations (morning/evening rush hour peaks, diurnal weather curves, and filling municipal bins).
4. **Autonomous Alert Engine**:
   - Reviews live indicators and files warning levels (AQI spikes, storms, waste spills) to prevent structural danger, featuring notification cooldown limits.
5. **ML Prediction Microservice**:
   - Fits OLS Linear Regression on time-series history arrays, utilizing cyclical trigonometric time features ($\sin(t), \cos(t)$) to capture complex daily traffic patterns.

---

## Project Structure

```
urbanpulse/
├── backend/
│   ├── src/
│   │   ├── config/       # Mongoose client with JSON-file local db fallback
│   │   ├── routes/       # REST routes (/api/weather, /api/history, etc.)
│   │   ├── services/     # Aggregator schedulers & alert trigger engine
│   │   └── server.js     # Express starter entry script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # MapDashboard, AdminPanel, CitizenView, AlertBanner
│   │   ├── App.jsx       # Global router state, theme controller, and UI grid
│   │   ├── index.css     # Tailwind directives & digital twin pulse keyframes
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── ml-service/
│   ├── app.py            # FastAPI endpoints
│   └── requirements.txt  # FastAPI, scikit-learn, numpy
├── .env.example          # Template environment configurations
└── README.md             # Running procedures documentation
```

---

## Installation & Running Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Python](https://www.python.org/downloads/) (3.9 or higher)
- (Optional) [MongoDB](https://www.mongodb.com/) (runs automatically in Local JSON file mode if absent)

### Step 1: Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Fill out the API keys if you wish to query live APIs. Leaving them blank enables **Mock Simulation Mode** so the app starts fully functional immediately without any external accounts!

---

### Step 2: Boot ML Microservice (FastAPI)
Navigate to the `ml-service` directory, set up a virtual environment, install requirements, and run the server:
```bash
cd ml-service

# Create and activate virtual environment
python -m venv venv
# On Windows (Powershell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI microservice
python app.py
```
The ML microservice will start on: **`http://localhost:8000`**

---

### Step 3: Boot Backend Server (Express)
Open a new terminal window in the `backend` folder, install dependencies, and start the app:
```bash
cd backend
npm install
npm start
```
The backend server will run on: **`http://localhost:5000`**
The poller will immediately begin updating logs every 60 seconds.

---

### Step 4: Boot Frontend Client (Vite React)
Open a third terminal window in the `frontend` folder, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The React application will compile and start on: **`http://localhost:3000`**

Open your browser to: **`http://localhost:3000`** to view the live Digital Twin Dashboard.

---

## Verification Tests

### 1. Verification of ML Predict Engine
You can test the FastAPI endpoint using a POST request tool (e.g. cURL, Postman) to ensure predictions are resolving:
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"aqi_history": [110, 115, 122, 130, 145, 160], "traffic_history": [15, 18, 22, 35, 55, 62], "hours": 12}'
```
Returns forecasted arrays for the next 12 hours.

### 2. Verification of REST Endpoint Health
Inspect: **`http://localhost:5000/health`**
Verifies backend connection state. Returns `"database": "mongodb"` or `"database": "local-json-files"` indicating active telemetry collection.
