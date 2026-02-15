import pandas as pd
import os

csv_path = 'c:/Users/Beulah/MENTAL HEALTH/aura-ml/dataset.csv'
txt_path = 'c:/Users/Beulah/MENTAL HEALTH/aura-ml/dataset.txt'

if not os.path.exists(csv_path):
    print("CSV not found!")
    exit()

# Load dataset
# Some rows might have issues with quotes/commas in natural language text
df = pd.read_csv(csv_path)

print(f"Columns found: {df.columns.tolist()}")

with open(txt_path, 'w', encoding='utf-8') as f:
    for _, row in df.iterrows():
        # Using .get() or checking for existence to be safe
        q = str(row.get('questionText', '')).strip()
        a = str(row.get('answerText', '')).strip()
        
        if q and a:
            f.write(f"User: {q}\n")
            f.write(f"Aura: {a}\n\n")

print(f"Successfully converted {len(df)} rows to {txt_path}")
