// pages/exampleDetail/index.js
Page({
  data: {
    type: '',
    envId: '',
    showUploadTip: false,

    haveGetOpenId: false,
    openId: '',

    haveGetCodeSrc: false,
    codeSrc: '',

    haveGetRecord: false,
    record: '',

    haveGetImgSrc: false,
    imgSrc: '',
  },

  onLoad(options) {
    this.setData({ type: options?.type, envId: options?.envId });
  },

  getOpenId() {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.envId
      },
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      this.setData({
        haveGetOpenId: true,
        openId: resp.result.openid
      });
      wx.hideLoading();
    }).catch((e) => {
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    });
  },

  clearOpenId() {
    this.setData({
      haveGetOpenId: false,
      openId: ''
    });
  },

  getCodeSrc() {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.envId
      },
      data: {
        type: 'getMiniProgramCode'
      }
    }).then((resp) => {
      this.setData({
        haveGetCodeSrc: true,
        codeSrc: resp.result
      });
      wx.hideLoading();
    }).catch((e) => {
      console.log(e);
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    });
  },

  clearCodeSrc() {
    this.setData({
      haveGetCodeSrc: false,
      codeSrc: ''
    });
  },

  getRecord() {
    // 输出当前的 envId
    console.log("当前的 envId:", this.data.envId);
    wx.showLoading({
      title: 'loading',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.envId
      },
      data: {
        type: 'selectRecord'
      }
    }).then((resp) => {
      this.setData({
        haveGetRecord: true,
        record: resp.result.data
      });
      wx.hideLoading();
    }).catch((e) => {
      console.log(e);
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    });
  },

  clearRecord() {
    this.setData({
      haveGetRecord: false,
      record: ''
    });
  },

  uploadMedia() {
    wx.showLoading({
      title: '',
    });
  
    // 让用户拍摄或从手机相册中选择图片或视频
    wx.chooseMedia({
      count: 1, // 最多选择一个文件
      mediaType: ['image', 'video'], // 允许选择图片或视频
      sourceType: ['album', 'camera'], // 允许从相册选择或使用相机拍摄
      maxDuration: 60, // 视频最大时长 60 秒
      success: chooseResult => {
        const selectedFile = chooseResult.tempFiles[0];
  
        // 判断文件类型，确保只上传图片
        if (selectedFile.fileType === 'image') {
          // 将图片上传至云存储空间
          wx.cloud.uploadFile({
            // 指定上传到的云路径，可以根据需要动态命名
            cloudPath: `my-photo-${Date.now()}.png`,
            // 指定要上传的文件的小程序临时文件路径
            filePath: selectedFile.tempFilePath,
            // 输出文件路径
            config: {
              env: this.data.envId
            }
          }).then(res => {
            console.log('上传成功', res);
            this.setData({
              haveGetImgSrc: true,
              imgSrc: res.fileID
            });
            wx.hideLoading();
          }).catch((e) => {
            console.log(e);
            wx.hideLoading();
          });
        } else {
          console.log('选择的文件不是图片');
          wx.hideLoading();
        }
      },
      fail: (e) => {
        console.log('选择文件失败', e);
        wx.hideLoading();
      }
    });
  },

  loadImage() {
    wx.showLoading({
      title: '加载中...',
    });
  
    // 从云存储空间下载图片
    const fileID = 'cloud://demo-8g342rg41cedb115.6465-demo-8g342rg41cedb115-1330128457/my-photo-1728050686131.png'; // 替换为你的云文件 ID
    wx.cloud.downloadFile({
      fileID: fileID,
      config: {
        env: this.data.envId
      },
      success: res => {
        console.log('下载成功', res);
        this.setData({
          imgSrc: res.tempFilePath,
          haveGetImgSrc: true
        });
        wx.hideLoading();
      },
      fail: (e) => {
        console.log('下载失败', e);
        wx.hideLoading();
      }
    });
  },

  clearImgSrc() {
    this.setData({
      haveGetImgSrc: false,
      imgSrc: ''
    });
  },

  goOfficialWebsite() {
    const url = 'https://docs.cloudbase.net/toolbox/quick-start';
    wx.navigateTo({
      url: `../web/index?url=${url}`,
    });
  },

})