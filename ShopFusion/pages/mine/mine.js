Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    points: 3,
    openid: ''
  },
  onLoad: function () {
    this.getOpenIdAndUserInfo();
  },
  getOpenIdAndUserInfo: function () {
    const that = this;
    // 调用云函数获取 openid
    wx.cloud.callFunction({
      name: 'getOpenId', // 云函数的名称
      success: function (res) {
        const openid = res.result.openid;
        wx.setStorageSync('openid', openid);
        that.setData({
          openid: openid
        });
        
        that.checkUserInfo(); // 检查用户信息
      },
      fail: function (err) {
        console.error('[云函数] [getOpenId] 调用失败', err);
      }
    });
  },
  checkUserInfo: function () {
    let userInfo = wx.getStorageSync('userInfo') || null;
    
    if (!userInfo) {
      // 使用默认头像和昵称
      userInfo = {
        nickName: '用户_' + this.data.openid.substring(0, 6),
        avatarUrl: '/images/default.png'
      };
      wx.setStorageSync('userInfo', userInfo);
    }
    
    this.setData({
      userInfo: userInfo
    });
  }
});
