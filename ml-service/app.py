import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

app = FastAPI(
    title="UrbanPulse ML Forecasting Microservice",
    description="Uses scikit-learn to predict hourly traffic and AQI trends using cyclical time features.",
    version="1.0.0"
)

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)

class ForecastRequest(BaseModel):
    aqi_history: List[float]
    traffic_history: List[float]
    hours: int = 12

class ForecastResponsePoint(BaseModel):
    time: str
    value: float

class ForecastResponse(BaseModel):
    aqi_predictions: List[ForecastResponsePoint]
    traffic_predictions: List[ForecastResponsePoint]
    model_info: str

def train_and_predict(history: List[float], future_hours: int) -> List[ForecastResponsePoint]:
    """
    Fits a linear regression model with cyclical (sine/cosine) features 
    to capture time-of-day traffic and AQI fluctuations.
    """
    n_samples = len(history)
    if n_samples < 3:
        raise ValueError("Insufficient historical data to train the model. Minimum 3 points required.")

    # Current time setup
    now = datetime.now()
    
    # 1. Feature Engineering
    # We reconstruct mock timestamps going backward from 'now' for training data
    times = [now - timedelta(hours=i) for i in range(n_samples)]
    times.reverse() # chronologically ordered

    def extract_features(dt_list):
        features = []
        for i, dt in enumerate(dt_list):
            hour = dt.hour + dt.minute / 60.0
            # Time index to capture long term drift/trend
            time_idx = i
            # Cyclical diurnal features
            sin_hour = np.sin(hour * 2 * np.pi / 24.0)
            cos_hour = np.cos(hour * 2 * np.pi / 24.0)
            features.append([time_idx, sin_hour, cos_hour])
        return np.array(features)

    # Prepare training features and labels
    X_train = extract_features(times)
    y_train = np.array(history)

    # 2. Model training
    model = LinearRegression()
    model.fit(X_train, y_train)

    # 3. Future feature preparation
    future_times = [now + timedelta(hours=i+1) for i in range(future_hours)]
    # Feature indices continue incrementing from n_samples
    future_features = []
    for i, dt in enumerate(future_times):
        hour = dt.hour
        time_idx = n_samples + i
        sin_hour = np.sin(hour * 2 * np.pi / 24.0)
        cos_hour = np.cos(hour * 2 * np.pi / 24.0)
        future_features.append([time_idx, sin_hour, cos_hour])
    X_future = np.array(future_features)

    # 4. Predictions
    y_pred = model.predict(X_future)
    
    # Post-process: enforce sensible physical bounds
    y_pred = np.clip(y_pred, 5, 500) # AQI and traffic levels shouldn't drop below 5 or go infinite

    # Format output
    predictions = []
    for dt, val in zip(future_times, y_pred):
        time_str = dt.strftime("%H:00")
        predictions.append(ForecastResponsePoint(time=time_str, value=round(float(val), 1)))

    return predictions

@app.post("/predict", response_model=ForecastResponse)
async def predict_trends(payload: ForecastRequest):
    try:
        # Check inputs
        if not payload.aqi_history or not payload.traffic_history:
            raise HTTPException(status_code=400, detail="Historical records cannot be empty.")
        
        # Train and extrapolate
        aqi_preds = train_and_predict(payload.aqi_history, payload.hours)
        traffic_preds = train_and_predict(payload.traffic_history, payload.hours)

        return ForecastResponse(
            aqi_predictions=aqi_preds,
            traffic_predictions=traffic_preds,
            model_info="Scikit-Learn Cyclical Linear Regression (OLS)"
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training error: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "online", "model": "scikit-learn LinearRegression"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
