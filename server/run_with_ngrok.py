from pyngrok import ngrok
from app import app
import os
from dotenv import load_dotenv

load_dotenv()

def start_ngrok():
    # Get the port from environment variable or use default
    port = int(os.getenv('PORT', 5000))
    
    # Set ngrok auth token
    ngrok_auth_token = "2sRt4tos8CV4HriQ79lC2PDo3w1_6kVZjRoRMfRz5BTNVGdjc"
    if not ngrok_auth_token:
        raise ValueError("NGROK_AUTH_TOKEN not found in environment variables. Please add it to your .env file.")
    
    ngrok.set_auth_token(ngrok_auth_token)
    
    # Open a ngrok tunnel to the HTTP server
    public_url = ngrok.connect(port).public_url
    print(f' * ngrok tunnel "{public_url}" -> http://127.0.0.1:{port}')
    
    return public_url

if __name__ == '__main__':
    # Start ngrok
    public_url = start_ngrok()
    
    # Update CORS settings if needed
    app.config['CORS_ORIGINS'] = [public_url]
    
    # Run the Flask app
    app.run(port=int(os.getenv('PORT', 5000))) 