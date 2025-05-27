// frontend_weapp/pages/dual_chat/dual_chat.js
Page({
  data: {},
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '一起谈' 
    });
  },
  goBack: function() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
