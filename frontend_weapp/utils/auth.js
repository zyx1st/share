// frontend_weapp/utils/auth.js
const app = getApp(); // To potentially store global data later

// Define the backend server URL. 
// For development, this might be http://localhost:5000 or your local IP.
// For production, this will be your deployed backend URL.
const BASE_URL = 'http://127.0.0.1:5000'; // REPLACE WITH YOUR ACTUAL BACKEND URL if not localhost

const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          // Send code to backend
          wx.request({
            url: `${BASE_URL}/api/auth/login`,
            method: 'POST',
            data: {
              code: res.code
            },
            success: (response) => {
              if (response.statusCode === 200 && response.data.message === "Login successful") {
                console.log('Login successful:', response.data);
                // Store user session/token if backend returns one
                // For MVP, we can just resolve with success
                // Example: wx.setStorageSync('user_token', response.data.token);
                // Example: app.globalData.userInfo = response.data.user;
                resolve(response.data);
              } else {
                console.error('Login failed from backend:', response);
                reject(response.data);
              }
            },
            fail: (err) => {
              console.error('wx.request failed:', err);
              reject(err);
            }
          });
        } else {
          console.error('wx.login failed, no code:', res);
          reject(res);
        }
      },
      fail: (err) => {
        console.error('wx.login API call failed:', err);
        reject(err);
      }
    });
  });
};

module.exports = {
  login
};
