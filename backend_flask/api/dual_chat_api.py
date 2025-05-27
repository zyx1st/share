# backend_flask/api/dual_chat_api.py
from flask import Blueprint, jsonify

dual_chat_bp = Blueprint('dual_chat_api', __name__, url_prefix='/api/dual_chat') 

@dual_chat_bp.route('/', methods=['GET'])
def placeholder():
    return jsonify(message="Welcome to the Dual Chat (一起谈) API placeholder!")
