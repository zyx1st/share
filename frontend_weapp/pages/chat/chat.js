// frontend_weapp/pages/chat/chat.js
const app = getApp();
const BASE_URL = 'http://127.0.0.1:5000'; // Ensure this matches your backend

Page({
  data: {
    messages: [], // Format: { sender: 'user'/'ai', text: 'message content' }
    inputValue: '',
    user_id: null, // Will be set from globalData or storage
    conversation_id: null, // Will be set after first message or when loading existing chat
    scrollHeight: 0, // For dynamic height of scroll view
    scrollToView: '', // To scroll to the latest message
    isSending: false
  },

  onLoad: function (options) {
    // Example: Get user_id from global data (set after login)
    // This assumes user_id is stored in globalData after successful login
    // You might need to retrieve it from wx.getStorageSync if that's your pattern
    const storedUserId = wx.getStorageSync('user_id'); // Assuming user_id was stored from login step
    if (storedUserId) {
      this.setData({ user_id: storedUserId });
    } else {
      // Handle case where user_id is not available (e.g., redirect to login)
      console.error("User ID not found. Please login.");
      wx.showModal({
        title: '错误',
        content: '请先登录！',
        showCancel: false,
        success: () => wx.redirectTo({ url: '/pages/index/index' })
      });
      return;
    }
    
    // If conversation_id is passed via options (e.g., from a list of conversations)
    if (options.conversation_id) {
      this.setData({ conversation_id: options.conversation_id });
      // TODO: Load existing messages for this conversation_id
    } else {
      // Start with a default AI greeting or first prompt if it's a new chat
      // This matches the backend's llm_service.py initial prompt logic
       this.addMessageToChat('ai', '你好，有什么想和我聊聊的吗？或者我们可以从描述最近让你困扰的一件事开始。');
    }
    this.calculateScrollHeight();
  },

  onReady: function () {
    this.calculateScrollHeight();
  },
  
  // Calculate scroll view height dynamically
  calculateScrollHeight: function() {
    let systemInfo = wx.getSystemInfoSync();
    let windowHeight = systemInfo.windowHeight;
    // Query the input area height
    let query = wx.createSelectorQuery().in(this); // Added .in(this) for component context
    query.select('.input-area').boundingClientRect(rect => {
      if (rect) {
        let inputAreaHeight = rect.height;
        this.setData({
          scrollHeight: windowHeight - inputAreaHeight
        });
      } else {
        // Fallback if query fails, estimate or use a fixed value
         this.setData({
          scrollHeight: windowHeight - 60 // Assuming approx 60px for input area
        });
      }
    }).exec();
  },

  addMessageToChat: function(sender, text) {
    const newMessage = { sender, text };
    const currentMessages = this.data.messages;
    this.setData({
      messages: [...currentMessages, newMessage],
      // Ensure that scrollToView is updated after messages array is confirmed to be updated
    }, () => {
      this.setData({
        scrollToView: `msg-${this.data.messages.length - 1}`
      });
    });
  },

  onInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  onSend: function () {
    if (!this.data.inputValue.trim()) return;
    if (!this.data.user_id) {
      wx.showToast({ title: '请先登录', icon: 'none'});
      return;
    }
    this.setData({ isSending: true });

    const userMessage = this.data.inputValue;
    this.addMessageToChat('user', userMessage);
    this.setData({ inputValue: '' }); // Clear input field

    wx.request({
      url: `${BASE_URL}/api/chat/send_message`,
      method: 'POST',
      data: {
        user_id: this.data.user_id,
        message: userMessage,
        conversation_id: this.data.conversation_id
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.ai_response) {
          this.addMessageToChat('ai', res.data.ai_response.text);
          if (res.data.conversation_id && !this.data.conversation_id) {
            this.setData({ conversation_id: res.data.conversation_id });
          }
        } else {
          console.error('Failed to send message or get AI response:', res);
          this.addMessageToChat('ai', '抱歉，暂时无法连接到服务，请稍后再试。');
        }
      },
      fail: (err) => {
        console.error('Error sending message:', err);
        this.addMessageToChat('ai', '网络错误，请检查您的连接。');
      },
      complete: () => {
         this.setData({ isSending: false });
         // Ensure scroll after response and potential state updates in success/fail
         this.setData({}, () => { // Use setData callback to ensure DOM is updated
            this.setData({ scrollToView: `msg-${this.data.messages.length -1}`});
         });
      }
    });
  }
});
