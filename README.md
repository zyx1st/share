# 心犀 MVP (Xinxi MVP)

This project is a WeChat mini-program designed to help users improve their relationships through AI-guided conversations and learning modules.

**Version:** MVP 1.0

## Implemented Features (MVP 1.0)

1.  **User Authentication:**
    *   WeChat login integration.
    *   Basic user session management (backend).
2.  **Core Module: "聊一聊" (AI-Guided Solo Reflection)**
    *   Frontend chat interface for users to interact with an AI.
    *   Backend API to process messages, interact with a (currently mock) LLM service, and store conversation history.
    *   Mock LLM service provides a guided conversation flow.
3.  **Emergency Exit & Support Page:**
    *   A dedicated page with disclaimers about the app's limitations.
    *   Placeholder links/contacts for professional psychological help and crisis hotlines.

## Tech Stack

*   **Frontend:** WeChat Mini-program (Native JavaScript)
*   **Backend:** Python (Flask)
*   **Database:** MongoDB (conceptual, via PyMongo)
*   **LLM:** Mock service (placeholder for a real LLM API)

## Project Structure

```
/xinxi_mvp
  ├── frontend_weapp/     # WeChat Mini-program code
  ├── backend_flask/      # Flask backend server
  └── README.md
```

## Prerequisites

*   [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
*   [Python 3.7+](https://www.python.org/downloads/)
*   [MongoDB](https://www.mongodb.com/try/download/community) (running instance)
*   `pip` (Python package installer)

## Setup and Running

### Backend (Flask Server)

1.  **Navigate to the backend directory:**
    ```bash
    cd xinxi_mvp/backend_flask
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure the application:**
    *   Copy or rename `config.py.example` to `config.py` if you create an example, otherwise edit `config.py` directly.
    *   Edit `backend_flask/config.py` and replace placeholder values:
        *   `WECHAT_APPID`: Your WeChat Mini-program AppID.
        *   `WECHAT_APPSECRET`: Your WeChat Mini-program AppSecret.
        *   `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/xinxi_mvp`).

5.  **Run the Flask development server:**
    ```bash
    flask run # Or python app.py
    ```
    The backend server should now be running, typically on `http://127.0.0.1:5000/`.

### Frontend (WeChat Mini-program)

1.  **Open WeChat DevTools.**
2.  **Import Project:**
    *   Click on "小程序项目" (Mini Program Project) and then the "+" (Import) button.
    *   Set the "项目目录" (Project Directory) to the `xinxi_mvp/frontend_weapp` folder.
    *   Fill in your `AppID` (the same one used in the backend `config.py`).
    *   Give your project a name.
3.  **Configure Backend URL:**
    *   In `frontend_weapp/utils/auth.js` and `frontend_weapp/pages/chat/chat.js`, ensure the `BASE_URL` constant points to your running backend server (e.g., `http://127.0.0.1:5000`).
4.  **Run the Mini-program:**
    *   Click "编译" (Compile) in WeChat DevTools.
    *   You should see the index page. You can test login and navigation to the chat and support pages.

## Deployment Considerations (Initial Thoughts)

*   **Frontend:** Deployed via WeChat DevTools to the WeChat platform.
*   **Backend:**
    *   **WeChat Mini Program Cloud Development:** Offers serverless functions, cloud database, and file storage, which could be a good integrated solution.
    *   **Traditional Cloud Servers (IaaS):** Deploying the Flask app on a VM (e.g., Tencent Cloud CVM, AWS EC2) using a WSGI server like Gunicorn and a reverse proxy like Nginx.
    *   **Platform as a Service (PaaS):** Services like Heroku, Google App Engine, or similar, which can simplify Python web app deployment.
*   **Database:**
    *   Use a managed MongoDB service (e.g., MongoDB Atlas, Tencent Cloud's MongoDB).
*   **LLM API:**
    *   The current mock LLM service (`llm_service.py`) will need to be replaced with actual API calls to a chosen LLM provider. This will involve secure API key management.

## Future Development (Post-MVP)
(Placeholder for future feature planning based on the initial requirements document)

*   "一起谈" - AI-assisted dual dialogue
*   "冲突快诊" - Conflict pattern recognition
*   "爱的小课堂" - Micro-learning modules
*   "每日一句/一问" - Inspirational content
*   "心情日记" - Mood tracking
*   User Profile enhancements (nickname, avatar)
*   Full LLM integration with robust prompt engineering.
```
