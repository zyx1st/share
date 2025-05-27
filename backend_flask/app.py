from flask import Flask
from flask_cors import CORS # New import

from api.auth import auth_bp
from api.chat import chat_bp
from api.dual_chat_api import dual_chat_bp
from api.conflict_diagnosis_api import conflict_diagnosis_bp
from api.learning_center_api import learning_center_bp
from api.mood_journal_api import mood_journal_bp

app = Flask(__name__)

# Initialize CORS - Allow all origins for development
# For production, you might want to restrict origins:
# CORS(app, resources={r"/api/*": {"origins": "your-miniprogram-domain-or-specific-origin"}})
CORS(app) 

app.register_blueprint(auth_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(dual_chat_bp)
app.register_blueprint(conflict_diagnosis_bp)
app.register_blueprint(learning_center_bp)
app.register_blueprint(mood_journal_bp)

@app.route('/')
def hello_world():
    return 'Hello, Xinxi MVP Backend!'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
