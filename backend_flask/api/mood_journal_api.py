# backend_flask/api/mood_journal_api.py
from flask import Blueprint, jsonify

mood_journal_bp = Blueprint('mood_journal_api', __name__, url_prefix='/api/mood_journal') 

@mood_journal_bp.route('/', methods=['GET'])
def placeholder():
    return jsonify(message="Welcome to the Mood Journal (心情日记) API placeholder!")
