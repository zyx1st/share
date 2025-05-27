# backend_flask/api/chat.py
from flask import Blueprint, request, jsonify
import datetime
import pymongo
from bson import ObjectId # For handling MongoDB ObjectIds

# Assuming config.py is in the parent directory or accessible
from ..config import MONGO_URI
# Placeholder for LLM interaction - to be replaced with actual LLM API calls
from .llm_service import get_llm_response 

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

# Initialize MongoDB client (similar to auth.py)
try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client.get_database() 
    conversations_collection = db.conversations
    users_collection = db.users # Assuming users_collection is needed for user validation
except pymongo.errors.ConnectionFailure as e:
    print(f"Could not connect to MongoDB: {e}")
    conversations_collection = None
    users_collection = None

@chat_bp.route('/send_message', methods=['POST'])
def send_message():
    data = request.get_json()
    user_id_str = data.get('user_id') # Assuming frontend sends user_id (e.g., from login response)
    user_message_text = data.get('message')
    conversation_id_str = data.get('conversation_id') # Optional

    if not user_id_str or not user_message_text:
        return jsonify({"error": "user_id and message are required"}), 400

    if not users_collection or not conversations_collection:
        return jsonify({"error": "Database service not available"}), 503

    # Validate user_id
    try:
        user_oid = ObjectId(user_id_str)
        if not users_collection.find_one({"_id": user_oid}):
             return jsonify({"error": "User not found"}), 404
    except Exception: # Invalid ObjectId format
        return jsonify({"error": "Invalid user_id format"}), 400


    timestamp = datetime.datetime.utcnow()
    user_message = {"sender": "user", "text": user_message_text, "timestamp": timestamp}

    conversation_oid = None
    if conversation_id_str:
        try:
            conversation_oid = ObjectId(conversation_id_str)
        except Exception:
            return jsonify({"error": "Invalid conversation_id format"}), 400
    
    # LLM Interaction
    ai_response_text = get_llm_response(user_message_text, str(conversation_oid) if conversation_oid else None, user_id_str)
    ai_message = {"sender": "ai", "text": ai_response_text, "timestamp": datetime.datetime.utcnow()}

    try:
        if conversation_oid:
            result = conversations_collection.update_one(
                {"_id": conversation_oid, "user_id": user_oid}, 
                {"$push": {"messages": {"$each": [user_message, ai_message]}}, "$set": {"last_updated_time": timestamp}}
            )
            if result.matched_count == 0:
                return jsonify({"error": "Conversation not found or access denied"}), 404
        else:
            new_conversation = {
                "user_id": user_oid,
                "start_time": timestamp,
                "last_updated_time": timestamp,
                "messages": [user_message, ai_message]
            }
            insert_result = conversations_collection.insert_one(new_conversation)
            conversation_oid = insert_result.inserted_id
        
        return jsonify({
            "message": "Message processed", 
            "conversation_id": str(conversation_oid),
            "ai_response": ai_message
        }), 200

    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": "Database operation failed", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500


@chat_bp.route('/conversations/<user_id_str>', methods=['GET'])
def get_conversations_list(user_id_str): # Renamed to avoid conflict with collection name variable
    if not users_collection or not conversations_collection:
        return jsonify({"error": "Database service not available"}), 503
    try:
        user_oid = ObjectId(user_id_str)
        if not users_collection.find_one({"_id": user_oid}):
             return jsonify({"error": "User not found"}), 404
    except Exception:
         return jsonify({"error": "Invalid user_id format"}), 400

    try:
        user_conversations = list(conversations_collection.find({"user_id": user_oid}).sort("last_updated_time", pymongo.DESCENDING))
        for conv in user_conversations:
            conv["_id"] = str(conv["_id"])
            conv["user_id"] = str(conv["user_id"])
            # Optionally, could also stringify ObjectIds within messages if any
        return jsonify(user_conversations), 200
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": "Database query failed", "details": str(e)}), 500
