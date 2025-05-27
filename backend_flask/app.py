from flask import Flask
from api.auth import auth_bp
from api.chat import chat_bp 
# New imports for placeholder modules
from api.dual_chat_api import dual_chat_bp
from api.conflict_diagnosis_api import conflict_diagnosis_bp
from api.learning_center_api import learning_center_bp
from api.mood_journal_api import mood_journal_bp
# from .config import MONGO_URI # if you need app.config setup

app = Flask(__name__)

# app.config['MONGO_URI'] = MONGO_URI # Example if using Flask-PyMongo or similar extension

app.register_blueprint(auth_bp)
app.register_blueprint(chat_bp) 
# Register new placeholder blueprints
app.register_blueprint(dual_chat_bp)
app.register_blueprint(conflict_diagnosis_bp)
app.register_blueprint(learning_center_bp)
app.register_blueprint(mood_journal_bp)

@app.route('/')
def hello_world():
    return 'Hello, Xinxi MVP Backend!'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
