# backend_flask/api/auth.py
from flask import Blueprint, request, jsonify
import requests
import pymongo # Or your chosen MongoDB driver library
# Assuming config.py is in the parent directory or accessible
# For robust path handling, consider using current_app.config from Flask
from ..config import WECHAT_APPID, WECHAT_APPSECRET, MONGO_URI 

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Initialize MongoDB client
# This is a basic setup; in a larger app, manage client connection better (e.g., Flask-PyMongo)
try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client.get_database() # Or client[DB_NAME]
    users_collection = db.users
except pymongo.errors.ConnectionFailure as e:
    print(f"Could not connect to MongoDB: {e}")
    # Handle connection error appropriately, maybe raise an exception or use a mock for testing
    users_collection = None


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    code = data.get('code')

    if not code:
        return jsonify({"error": "Code is required"}), 400

    # Exchange code for session info from WeChat API
    # Construct the URL carefully.
    # It's better to use params argument in requests.get for URL encoding
    # For example:
    # params = {
    # 'appid': WECHAT_APPID,
    # 'secret': WECHAT_APPSECRET,
    # 'js_code': code,
    # 'grant_type': 'authorization_code'
    # }
    # response = requests.get("https://api.weixin.qq.com/sns/jscode2session", params=params)
    
    # For this subtask, direct URL construction is fine.
    url = f"https://api.weixin.qq.com/sns/jscode2session?appid={WECHAT_APPID}&secret={WECHAT_APPSECRET}&js_code={code}&grant_type=authorization_code"
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)
        res_data = response.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to connect to WeChat API", "details": str(e)}), 500
    except ValueError: # Includes JSONDecodeError
        return jsonify({"error": "Invalid response from WeChat API"}), 500


    openid = res_data.get('openid')
    session_key = res_data.get('session_key')

    if not openid:
        # Consider logging the actual res_data for debugging if it's an error from WeChat.
        return jsonify({"error": "Failed to get openid from WeChat", "details": res_data.get('errmsg', '')}), 400

    # Store or update user in database
    if users_collection is not None:
        try:
            user = users_collection.find_one_and_update(
                {'openid': openid},
                {'$set': {'session_key': session_key, 'last_login': pymongo.utcnow()}}, # Using pymongo.utcnow() for current time in UTC
                upsert=True,
                return_document=pymongo.ReturnDocument.AFTER
            )
            # For MVP, we can just return a success message.
            # Later, you might generate a custom session token here.
            return jsonify({"message": "Login successful", "user_id": str(user['_id']) if user else None})
        except pymongo.errors.PyMongoError as e:
            return jsonify({"error": "Database operation failed", "details": str(e)}), 500
    else:
        # Fallback if DB connection failed during init
        # This is a simplified error handling for MVP
        print("Warning: users_collection is None. Database operations skipped.")
        return jsonify({"message": "Login processed (DB offline)", "openid": openid })


@auth_bp.route('/user_info', methods=['POST'])
def user_info():
    # This is a placeholder for updating user info like nickname, avatarUrl
    # Requires proper authentication (e.g., custom session token)
    data = request.get_json()
    # For MVP, we'll just acknowledge. Full implementation needs auth.
    # openid = data.get('openid') 
    # nickname = data.get('nickname')
    # avatar_url = data.get('avatarUrl')
    # if openid and users_collection:
    #   users_collection.update_one({'openid': openid}, {'$set': {'nickname': nickname, 'avatarUrl': avatar_url}})
    return jsonify({"message": "User info update acknowledged (placeholder)"})
