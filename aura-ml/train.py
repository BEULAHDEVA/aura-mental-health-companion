import torch
import os
from model import AuraLLM, device, block_size, batch_size, learning_rate, max_iters, eval_interval, eval_iters

# 1. Load your Mental Health Dataset
# If you don't have one yet, I will use a placeholder. 
# PLEASE replace 'dataset.txt' with your actual mental health text corpus.
data_path = 'c:/Users/Beulah/MENTAL HEALTH/aura-ml/dataset.txt'

if not os.path.exists(data_path):
    print("Dataset not found! Creating a small dummy dataset for testing...")
    with open(data_path, 'w', encoding='utf-8') as f:
        f.write("I am here for you. How are you feeling today? It is okay to feel sad sometimes. Peace starts with a breath.")

with open(data_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 2. Simple Character-Level Tokenizer (Build from scratch)
chars = sorted(list(set(text)))
vocab_size = len(chars)
stoi = { ch:i for i,ch in enumerate(chars) }
itos = { i:ch for i,ch in enumerate(chars) }
encode = lambda s: [stoi[c] for c in s] 
decode = lambda l: ''.join([itos[i] for i in l])

# 3. Train/Val Split
data = torch.tensor(encode(text), dtype=torch.long)
n = int(0.9*len(data))
train_data = data[:n]
val_data = data[n:]

def get_batch(split):
    data = train_data if split == 'train' else val_data
    ix = torch.randint(len(data) - block_size, (batch_size,))
    x = torch.stack([data[i:i+block_size] for i in ix])
    y = torch.stack([data[i+1:i+block_size+1] for i in ix])
    x, y = x.to(device), y.to(device)
    return x, y

@torch.no_grad()
def estimate_loss():
    out = {}
    model.eval()
    for split in ['train', 'val']:
        losses = torch.zeros(eval_iters)
        for k in range(eval_iters):
            X, Y = get_batch(split)
            logits, loss = model(X, Y)
            losses[k] = loss.item()
        out[split] = losses.mean()
    model.train()
    return out

# 4. Initialize Model
model = AuraLLM(vocab_size)
m = model.to(device)

if os.path.exists('aura_mental_health_model.pth'):
    print("Loading existing weights and resuming training...")
    model.load_state_dict(torch.load('aura_mental_health_model.pth', map_location=device))

optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)

print(f"Starting training on {device}...")

# 5. Training Loop
for iter in range(max_iters):
    if iter % eval_interval == 0:
        losses = estimate_loss()
        print(f"step {iter}: train loss {losses['train']:.4f}, val loss {losses['val']:.4f}")
        torch.save(model.state_dict(), 'aura_mental_health_model.pth')
        print(f"Checkout saved at step {iter}")

    xb, yb = get_batch('train')
    logits, loss = model(xb, yb)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()

# 6. Save the trained model
torch.save(model.state_dict(), 'aura_mental_health_model.pth')
print("Model saved!")

# 7. Test Generation
context = torch.zeros((1, 1), dtype=torch.long, device=device)
print("\n--- AI Sample Generation ---")
print(decode(m.generate(context, max_new_tokens=100)[0].tolist()))
