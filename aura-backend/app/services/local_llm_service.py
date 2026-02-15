import torch
import torch.nn as nn
from torch.nn import functional as F
import os
import sys

# Hyperparameters must match training
block_size = 64
n_embd = 128
n_head = 4
n_layer = 4
dropout = 0.2
device = 'cuda' if torch.cuda.is_available() else 'cpu'

print(f"[Mini-Aura] Using device: {device}")

class Head(nn.Module):
    def __init__(self, head_size):
        super().__init__()
        self.key = nn.Linear(n_embd, head_size, bias=False)
        self.query = nn.Linear(n_embd, head_size, bias=False)
        self.value = nn.Linear(n_embd, head_size, bias=False)
        self.register_buffer('tril', torch.tril(torch.ones(block_size, block_size)))
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        B, T, C = x.shape
        k = self.key(x)
        q = self.query(x)
        wei = q @ k.transpose(-2,-1) * C**-0.5
        wei = wei.masked_fill(self.tril[:T, :T] == 0, float('-inf'))
        wei = F.softmax(wei, dim=-1)
        wei = self.dropout(wei)
        v = self.value(x)
        out = wei @ v 
        return out

class MultiHeadAttention(nn.Module):
    def __init__(self, num_heads, head_size):
        super().__init__()
        self.heads = nn.ModuleList([Head(head_size) for _ in range(num_heads)])
        self.proj = nn.Linear(n_embd, n_embd)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        out = torch.cat([h(x) for h in self.heads], dim=-1)
        out = self.dropout(self.proj(out))
        return out

class FeedForward(nn.Module):
    def __init__(self, n_embd):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_embd, 4 * n_embd),
            nn.ReLU(),
            nn.Linear(4 * n_embd, n_embd),
            nn.Dropout(dropout),
        )

    def forward(self, x):
        return self.net(x)

class Block(nn.Module):
    def __init__(self, n_embd, n_head):
        super().__init__()
        head_size = n_embd // n_head
        self.sa = MultiHeadAttention(n_head, head_size)
        self.ffwd = FeedForward(n_embd)
        self.ln1 = nn.LayerNorm(n_embd)
        self.ln2 = nn.LayerNorm(n_embd)

    def forward(self, x):
        x = x + self.sa(self.ln1(x))
        x = x + self.ffwd(self.ln2(x))
        return x

class AuraLLM(nn.Module):
    def __init__(self, vocab_size):
        super().__init__()
        self.token_embedding_table = nn.Embedding(vocab_size, n_embd)
        self.position_embedding_table = nn.Embedding(block_size, n_embd)
        self.blocks = nn.Sequential(*[Block(n_embd, n_head=n_head) for _ in range(n_layer)])
        self.ln_f = nn.LayerNorm(n_embd)
        self.lm_head = nn.Linear(n_embd, vocab_size)

    def forward(self, idx, targets=None):
        B, T = idx.shape
        tok_emb = self.token_embedding_table(idx)
        pos_emb = self.position_embedding_table(torch.arange(T, device=device))
        x = tok_emb + pos_emb
        x = self.blocks(x)
        x = self.ln_f(x)
        logits = self.lm_head(x)
        return logits, None

    def generate(self, idx, max_new_tokens):
        for _ in range(max_new_tokens):
            idx_cond = idx[:, -block_size:]
            logits, _ = self(idx_cond)
            logits = logits[:, -1, :]
            probs = F.softmax(logits, dim=-1)
            idx_next = torch.multinomial(probs, num_samples=1)
            idx = torch.cat((idx, idx_next), dim=1)
        return idx

# Singleton instance
_model = None
_tokenizer = None

def init_model():
    global _model, _tokenizer
    if _model is not None:
        return

    model_path = 'c:/Users/Beulah/MENTAL HEALTH/aura-ml/aura_mental_health_model.pth'
    data_path = 'c:/Users/Beulah/MENTAL HEALTH/aura-ml/dataset.txt'

    print(f"[Mini-Aura] Initializing from: {model_path}")

    if not os.path.exists(model_path):
        print(f"[Mini-Aura] ERROR: Model file not found at {model_path}")
        return
    if not os.path.exists(data_path):
        print(f"[Mini-Aura] ERROR: Tokenizer data not found at {data_path}")
        return

    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            text = f.read()

        chars = sorted(list(set(text)))
        vocab_size = len(chars)
        
        _tokenizer = {
            'stoi': { ch:i for i,ch in enumerate(chars) },
            'itos': { i:ch for i,ch in enumerate(chars) },
            'encode': lambda s: [ { ch:i for i,ch in enumerate(chars) }.get(c, 0) for c in s],
            'decode': lambda l: ''.join([{ i:ch for i,ch in enumerate(chars) }[i] for i in l])
        }

        print(f"[Mini-Aura] Vocab size: {vocab_size}")

        _model = AuraLLM(vocab_size)
        state_dict = torch.load(model_path, map_location=device)
        _model.load_state_dict(state_dict)
        _model.to(device)
        _model.eval()
        print("[Mini-Aura] Model successfully loaded.")
    except Exception as e:
        print(f"[Mini-Aura] CRITICAL ERROR during initialization: {e}")
        _model = None

async def generate_response(prompt: str):
    global _model, _tokenizer
    
    if _model is None:
        init_model()
    
    if _model is None:
        return "I'm having a little trouble connecting to my local brain. Please ensure the model file is ready. 🌿"

    input_text = f"User: {prompt}\nAura: "
    
    try:
        encoded = _tokenizer['encode'](input_text)
        idx = torch.tensor([encoded], dtype=torch.long, device=device)
        
        with torch.no_grad():
            generated_idx = _model.generate(idx, max_new_tokens=100)
        
        result = _tokenizer['decode'](generated_idx[0].tolist())
        
        if "Aura:" in result:
            response = result.split("Aura:")[-1].strip()
            response = response.split("User:")[0].strip()
            return response if response else "I am listening."
        
        return result
    except Exception as e:
        print(f"[Mini-Aura] Generation Error: {e}")
        return "My thoughts are a bit tangled right now. Could you tell me more?"

# Pre-warm the model
init_model()
