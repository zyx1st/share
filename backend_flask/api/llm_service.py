# backend_flask/api/llm_service.py
import random

conversation_prompts = [
    "好的，我明白了。请先具体描述一下当时发生了什么事（事实经过）？",
    "嗯，听起来这让你感觉不太好。你当时的感受和情绪是怎样的呢？",
    "在这种情况下，你觉得自己最核心的需求和期望是什么呢？",
    "试着换位思考一下，你觉得对方当时可能的视角和需求会是什么？（我可以帮你提问）",
    "很好，我们梳理得差不多了。你现在最想对伴侣表达的核心内容是什么呢？",
    "明白了，请把你想说的总结一下，我会帮你看看如何表达更清晰。" # Added one more
]

mock_conversation_state = {} 

def get_llm_response(user_message, conversation_id, user_id):
    state_key = f"{user_id}_{conversation_id if conversation_id else 'new'}"

    if state_key not in mock_conversation_state:
        mock_conversation_state[state_key] = 0
    
    prompt_index = mock_conversation_state[state_key]
    
    if "你好" in user_message or "hello" in user_message.lower() or prompt_index >= len(conversation_prompts):
        mock_conversation_state[state_key] = 0 # Reset if greeting or end of prompts
        prompt_index = 0
    
    response = conversation_prompts[prompt_index]
    
    mock_conversation_state[state_key] = (prompt_index + 1) 
    # Removed modulo to allow finishing the sequence, reset will happen if prompt_index >= len

    return response
