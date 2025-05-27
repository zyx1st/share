// pages/index/index.js
const auth = require('../../utils/auth'); 

Page({
  data: {
    userInfo: null,
    loginMessage: ''
  },
  onLoad: function () {
    const userId = wx.getStorageSync('user_id');
    if (userId) {
      // To avoid showing full user ID, you might want to just indicate logged in status
      // Or show a part of it like: `已登录 (User ID: ${userId.slice(0,6)}...)`
      this.setData({ loginMessage: `已登录 (User ID: ${userId.slice(0,6)}...)` }); 
    }
  },
  handleLogin: function() {
    auth.login()
      .then(res => {
        console.log('Login successful on page:', res);
        const userId = res.user_id || 'N/A';
        this.setData({ 
          // Display partial ID for privacy
          loginMessage: `登录成功! (User ID: ${userId !== 'N/A' ? userId.slice(0,6) : 'N/A'}...)`,
        });
        if (res.user_id) {
          wx.setStorageSync('user_id', res.user_id); 
        }
      })
      .catch(err => {
        console.error('Login failed on page:', err);
        this.setData({ loginMessage: `登录失败: ${err.error || '未知错误'}` });
        wx.removeStorageSync('user_id'); 
      });
  },
  goToChat: function() {
    const userId = wx.getStorageSync('user_id');
    if (userId) {
      wx.navigateTo({ url: '/pages/chat/chat' });
    } else {
      wx.showToast({ title: '请先登录', icon: 'none'});
    }
  },
  // Add this function
  goToSupport: function() {
    wx.navigateTo({
      url: '/pages/support/support'
    });
  }
});
