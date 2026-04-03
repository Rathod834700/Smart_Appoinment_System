import warnings
import joblib
import pandas as pd
warnings.filterwarnings("ignore", message=".*XGBoost.*")
# ================= LOAD FILES =================
model = joblib.load("no_show_model.pkl")

# Load scaler (optional)
try:
    scaler = joblib.load("scaler.pkl")
except:
    scaler = None

# Load neighbourhood mapping
try:
    neighbourhood_map = joblib.load("neighbourhood_map.pkl")
except:
    neighbourhood_map = None

# Load column order
try:
    expected_cols = joblib.load("model_columns.pkl")
except:
    expected_cols = None


# ================= PREPROCESS =================
def preprocess_input(data):
    df = pd.DataFrame([data])

    # 🔹 Gender encoding
    df['Gender'] = df['Gender'].map({'F': 0, 'M': 1})

    # 🔹 Neighbourhood encoding
    if neighbourhood_map:
        df['Neighbourhood'] = df['Neighbourhood'].map(neighbourhood_map)
    else:
        df['Neighbourhood'] = 0

    df['Neighbourhood'] = df['Neighbourhood'].fillna(0)

    # 🔹 Waiting Days fix
    df['Waiting_Days'] = df['Waiting_Days'].apply(lambda x: max(0, x))

    # 🔹 Waiting Category (same as training)
    df['Waiting_Category'] = df['Waiting_Days'].apply(
        lambda x: 0 if x <= 1 else 1 if x <= 7 else 2 if x <= 30 else 3
    )

    # 🔹 Ensure all expected columns exist
    if expected_cols:
        for col in expected_cols:
            if col not in df.columns:
                df[col] = 0

        df = df[expected_cols]

    # 🔹 Scaling
    if scaler:
        df = scaler.transform(df)

    return df


# ================= PREDICT =================
def predict(data):
    df = preprocess_input(data)
    prediction = model.predict(df)
    return int(prediction[0])


# ================= TEST RUN =================
if __name__ == "__main__":
    sample_data = {
        "Gender": "F",
        "Age": 25,
        "Neighbourhood": "GOIABEIRAS",
        "Scholarship": 0,
        "Hipertension": 0,
        "Diabetes": 0,
        "Alcoholism": 0,
        "Handcap": 0,
        "SMS_received": 1,
        "Waiting_Days": 5
    }

    result = predict(sample_data)

    if result == 1:
        print("❌ Patient likely to MISS appointment")
    else:
        print("✅ Patient likely to SHOW UP")