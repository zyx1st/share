// frontend_weapp/pages/conflict_diagnosis/conflict_diagnosis.js
Page({
  data: {},
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '冲突快诊' 
    });
  },
  goBack: function() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
