import nacl.util
import nacl.public
import nacl.secret
import base64

class EncryptionService:
    @staticmethod
    def generate_key_pair():
        private_key = nacl.public.PrivateKey.generate()
        return private_key

    @staticmethod
    def get_public_key_from_private(private_key):
        return private_key.public_key

    @staticmethod
    def encrypt_message(message, recipient_public_key):
        private_key = nacl.public.PrivateKey.generate()
        public_key = private_key.public_key
        box = nacl.public.Box(private_key, recipient_public_key)
        encrypted = box.encrypt(message.encode('utf-8'))
        return {
            'ciphertext': base64.b64encode(encrypted.ciphertext).decode('utf-8'),
            'nonce': base64.b64encode(encrypted.nonce).decode('utf-8'),
            'public_key': base64.b64encode(bytes(public_key)).decode('utf-8'),
        }

    @staticmethod
    def decrypt_message(ciphertext, nonce, sender_public_key, private_key):
        try:
            box = nacl.public.Box(private_key, sender_public_key)
            decrypted = box.decrypt(ciphertext, nonce)
            return decrypted.decode('utf-8')
        except Exception as e:
            return f"Decryption failed: {str(e)}"
