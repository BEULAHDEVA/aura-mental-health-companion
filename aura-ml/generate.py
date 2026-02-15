import torch
from model import AuraLLM, device, block_size

# Load the tokenizer from the dataset again
with open('c:/Users/Beulah/MENTAL HEALTH/aura-ml/dataset.txt', 'r', encoding='utf-8') as f:
    text = f.read()

chars = sorted(list(set(text)))
vocab_size = len(chars)
stoi = { ch:i for i,ch in enumerate(chars) }
itos = { i:ch for i,ch in enumerate(chars) }
decode = lambda l: ''.join([itos[i] for i in l])

# Initialize and load model
model = AuraLLM(vocab_size)
model.load_state_dict(torch.load('aura_mental_health_model.pth', map_location=device))
model.to(device)
model.eval()

# Generate from scratch
context = torch.zeros((1, 1), dtype=torch.long, device=device)
print("\n--- NEW GENERATION ---")
generated = model.generate(context, max_new_tokens=300)[0].tolist()
print(decode(generated))
