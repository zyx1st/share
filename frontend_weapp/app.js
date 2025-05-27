// app.js
App({
  globalData: {
    userInfo: null,
    token: null 
    // Add other global properties as needed
  },
  onLaunch() {
    // Optionally, check for stored session and validate it on launch
    // Example:
    // const token = wx.getStorageSync('user_token');
    // if (token) {
    //   this.globalData.token = token;
    //   // You might want to verify this token with your backend here
    // }
  }
})
