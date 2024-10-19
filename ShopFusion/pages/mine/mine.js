// mine.js
Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      openid: '',
      points: 0
    },
    navBarHeight: 0, // 导航栏高度
    menuItems: [
      {
        iconPath: '/images/icon_share.png',
        title: '分享小程序',
        subtitle: '可获得2积分',
        item: '分享小程序'
      },
      {
        iconPath: '/images/icon_video.png',
        title: '观看视频',
        subtitle: '可获得1积分',
        item: '观看视频'
      },
      {
        iconPath: '/images/icon_group.png',
        title: '多人拼团群',
        subtitle: '',
        item: '多人拼团群'
      },
      {
        iconPath: '/images/icon_customer_service.png',
        title: '联系客服',
        subtitle: '',
        item: '联系客服'
      },
      {
        iconPath: '/images/icon_about_us.png',
        title: '关于我们',
        subtitle: '',
        item: '关于我们'
      }
    ]
  },

  onLoad: function () {
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight;
    const navHeight = 44; // 导航栏的高度
    const navBarHeight = statusBarHeight + navHeight;
    this.setData({
      navBarHeight: navBarHeight
    });
    this.getOpenIdAndUserInfo();
  },

  onShow: function() {
    // 页面显示时，重新获取用户信息，确保修改后立即生效
    this.getUserInfo();
  },

  getOpenIdAndUserInfo: function () {
    const that = this;
    // 尝试从本地缓存获取 openid
    let openid = wx.getStorageSync('openid');
    if (openid) {
      // 如果有缓存的 openid，直接使用
      that.setData({
        'userInfo.openid': openid
      });
      that.getUserInfo(); // 获取用户信息
    } else {
      // 调用云函数获取 openid
      wx.cloud.callFunction({
        name: 'getOpenId', // 云函数的名称
        success: function (res) {
          const openid = res.result.openid;
          wx.setStorageSync('openid', openid);
          that.setData({
            'userInfo.openid': openid
          });
          that.getUserInfo(); // 获取用户信息
        },
        fail: function (err) {
          console.error('[云函数] [getOpenId] 调用失败', err);
        }
      });
    }
  },

  getUserInfo: function () {
    const that = this;
    let userInfo = wx.getStorageSync('userInfo') || null;

    if (userInfo && userInfo.nickName) {
      // 如果有缓存的 userInfo，直接使用
      that.setData({
        userInfo: userInfo
      });
    } else {
      // 调用云函数获取用户信息
      wx.cloud.callFunction({
        name: 'getUser',
        data: {
          openid: that.data.userInfo.openid
        },
        success: function(res) {
          if (res.result.data) {
            // 如果数据库中有用户数据，使用并缓存
            const userData = res.result.data;
            wx.setStorageSync('userInfo', userData);
            that.setData({
              userInfo: userData
            });
          } else {
            // 如果数据库中没有用户数据，初始化并保存默认用户信息
            const userInfo = {
              nickName: '用户_' + that.data.userInfo.openid.substring(0, 6),
              avatarUrl: '/images/default.png',
              openid: that.data.userInfo.openid,
              points: 0
            };
            wx.setStorageSync('userInfo', userInfo);
            that.setData({
              userInfo: userInfo
            });
            // 保存到数据库
            that.addUserToDatabase(userInfo);
          }
        },
        fail: function(err) {
          console.error('[云函数] [getUser] 调用失败', err);
          // 初始化并保存默认用户信息
          const userInfo = {
            nickName: '用户_' + that.data.userInfo.openid.substring(0, 6),
            avatarUrl: '/images/default.png',
            openid: that.data.userInfo.openid,
            points: 0
          };
          wx.setStorageSync('userInfo', userInfo);
          that.setData({
            userInfo: userInfo
          });
          // 保存到数据库
          that.addUserToDatabase(userInfo);
        }
      });
    }
  },

  // 将用户信息保存到数据库
  addUserToDatabase: function(userInfo) {
    wx.cloud.callFunction({
      name: 'addUser',
      data: {
        openid: userInfo.openid,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        points: userInfo.points
      },
      success: function () {
        console.log('用户信息已保存到数据库');
      },
      fail: function (err) {
        console.error('[云函数] [addUser] 调用失败', err);
      }
    });
  },

  // 点击头像跳转到个人资料页面
  goToProfile: function() {
    wx.navigateTo({
      url: '/pages/profile/profile',
    });
  },

  // 菜单项点击事件，弹出提示框
  onMenuItemTap: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '提示',
      content: '你点击了' + item,
      showCancel: false,
      confirmText: '确定',
    });
  }
});