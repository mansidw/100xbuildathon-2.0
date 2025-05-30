from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes.health_routes import health_bp

load_dotenv()

app = Flask(__name__)
CORS(app)


app.register_blueprint(health_bp)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 