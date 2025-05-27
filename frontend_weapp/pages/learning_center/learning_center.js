// frontend_weapp/pages/learning_center/learning_center.js
Page({
  data: {},
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '爱的小课堂' 
    });
  },
  goBack: function() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
