// frontend_weapp/pages/daily_content/daily_content.js
Page({
  data: {},
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '每日一句/一问' 
    });
  },
  goBack: function() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
