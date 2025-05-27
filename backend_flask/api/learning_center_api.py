# backend_flask/api/learning_center_api.py
from flask import Blueprint, jsonify

learning_center_bp = Blueprint('learning_center_api', __name__, url_prefix='/api/learning_center') 

@learning_center_bp.route('/', methods=['GET'])
def placeholder():
    return jsonify(message="Welcome to the Learning Center (爱的小课堂) API placeholder!")
