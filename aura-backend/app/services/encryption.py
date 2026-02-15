import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from dotenv import load_dotenv

load_dotenv()

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "aura-default-secret-key-must-be-changed")

def get_cipher():
    # Derive a key from the master secret
    salt = b'aura-salt' # In production, use a more secure salt
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(ENCRYPTION_KEY.encode()))
    return Fernet(key)

def encrypt_content(content: str) -> str:
    f = get_cipher()
    return f.encrypt(content.encode()).decode()

def decrypt_content(token: str) -> str:
    f = get_cipher()
    return f.decrypt(token.encode()).decode()
