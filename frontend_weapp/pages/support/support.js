// frontend_weapp/pages/support/support.js
Page({
  data: {},
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '紧急支持与声明' 
    });
  },
  goBack: function() {
    // Navigate back or to home. wx.navigateBack() might not work if page was opened by redirectTo
    // Attempt to switch to index tab first
    wx.switchTab({ 
      url: '/pages/index/index',
      fail: () => {
        // If index is not a tab or switchTab fails, try navigateTo (less ideal if index is a tab)
        // For this app structure, index is not a tab, so navigateTo or redirectTo is fine
        wx.navigateTo({ 
          url: '/pages/index/index',
          fail: () => {
            // As a last resort if navigateTo also fails (unlikely for a valid page)
            wx.redirectTo({ url: '/pages/index/index' });
          }
        });
      }
    });
  }
});
