// frontend_weapp/pages/mood_journal/mood_journal.js
Page({
  data: {},
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '心情日记' 
    });
  },
  goBack: function() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
