import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score

# ✅ Load the dataset
df = pd.read_csv("phishing.csv")

# ✅ Drop the 'Index' column if it exists
if "Index" in df.columns:
    df = df.drop(columns=["Index"])

# ✅ Split Features (X) and Target (y)
X = df.drop(columns=["class"])  # Change "Result" to "class"
y = df["class"]

# ✅ Train-Test Split (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ✅ Train Gradient Boosting Classifier
model = GradientBoostingClassifier()
model.fit(X_train, y_train)

# ✅ Evaluate Model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"✅ Model Trained with Accuracy: {accuracy:.2f}")

# ✅ Save the model to 'model.pkl'
with open("model.pkl", "wb") as file:
    pickle.dump(model, file)

print("🎉 New model.pkl has been saved successfully!")
