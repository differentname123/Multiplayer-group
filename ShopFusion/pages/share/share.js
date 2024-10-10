// pages/share/share.js

import jsQR from 'jsqr'; // jsQR 可以直接在微信小程序中使用

Page({
  data: {
    images: [], // 存储图片路径和解析结果的数组
    canvasWidth: 300, // 初始 Canvas 的宽度
    canvasHeight: 300, // 初始 Canvas 的高度
  },

  // 选择图片并解析
  chooseImage() {
    const that = this;
    wx.chooseImage({
      count: 9, // 最多可选9张
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        tempFilePaths.forEach((filePath) => {
          // 将图片解析并添加到 images 列表
          that.parseImage(filePath);
        });
      },
    });
  },

  // 解析图片中的二维码
  parseImage(filePath) {
    const that = this;
    const ctx = wx.createCanvasContext('qrCanvas', this);

    // 获取图片信息
    wx.getImageInfo({
      src: filePath,
      success(imgInfo) {
        const imgWidth = imgInfo.width;
        const imgHeight = imgInfo.height;

        // 输出图片尺寸
        console.log(`Image dimensions: ${imgWidth}x${imgHeight}`);

        // 限制 Canvas 的最大尺寸，避免超过小程序的限制
        const maxCanvasSize = 600; // 可根据需要调整
        let canvasWidth = imgWidth;
        let canvasHeight = imgHeight;

        if (imgWidth > maxCanvasSize || imgHeight > maxCanvasSize) {
          const scale = Math.min(maxCanvasSize / imgWidth, maxCanvasSize / imgHeight);
          canvasWidth = Math.floor(imgWidth * scale);
          canvasHeight = Math.floor(imgHeight * scale);
        }

        // 设置 Canvas 的尺寸
        that.setData({
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight,
        });

        // 清理 Canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 绘制原图到 Canvas
        ctx.drawImage(filePath, 0, 0, canvasWidth, canvasHeight);
        ctx.draw(false, () => {
          // 获取像素数据
          wx.canvasGetImageData({
            canvasId: 'qrCanvas',
            x: 0,
            y: 0,
            width: canvasWidth,
            height: canvasHeight,
            success(res) {
              console.log(`canvasGetImageData success: width=${res.width}, height=${res.height}, data length=${res.data.length}`);

              const imageData = {
                data: new Uint8ClampedArray(res.data),
                width: res.width,
                height: res.height,
              };

              try {
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                  that.handleQRCodeResult(code.data, filePath);
                } else {
                  console.log('First attempt to decode QR code failed, trying cropped image.');
                  // 初次识别失败，尝试裁剪后再次识别
                  that.cropAndRetry(filePath, imgWidth, imgHeight);
                }
              } catch (error) {
                console.error('jsQR error:', error);
                // 初次识别异常，尝试裁剪后再次识别
                that.cropAndRetry(filePath, imgWidth, imgHeight);
              }
            },
            fail(err) {
              console.error('获取像素数据失败', err);
              that.handleDecodeFailure(filePath);
            },
          });
        });
      },
      fail(err) {
        console.error('获取图片信息失败', err);
        that.handleDecodeFailure(filePath);
      },
    });
  },

  // 裁剪图片并再次尝试识别
cropAndRetry(filePath, imgWidth, imgHeight) {
  const that = this;
  const ctx = wx.createCanvasContext('qrCanvas', this);

  // 计算裁剪区域
  const cropLeft = Math.floor(imgWidth * 0.75); // 左侧裁剪掉 1/2
  const cropTop = Math.floor(imgHeight * 0.5); // 上部裁剪掉 1/2
  const cropRight = imgWidth; // 右侧不裁剪
  const cropBottom = Math.floor(imgHeight * 0.75); // 下部裁剪掉 1/4

  const cropWidth = cropRight - cropLeft;
  const cropHeight = cropBottom - cropTop;

  // 确保裁剪后的宽高为正数
  if (cropWidth <= 0 || cropHeight <= 0) {
    console.error('裁剪区域计算错误');
    that.handleDecodeFailure(filePath);
    return;
  }

  // 输出裁剪区域信息
  console.log(`Crop area: left=${cropLeft}, top=${cropTop}, width=${cropWidth}, height=${cropHeight}`);

  // 限制 Canvas 的最大尺寸
  const maxCanvasSize = 600; // 可根据需要调整
  let canvasWidth = cropWidth;
  let canvasHeight = cropHeight;

  if (cropWidth > maxCanvasSize || cropHeight > maxCanvasSize) {
    const scale = Math.min(maxCanvasSize / cropWidth, maxCanvasSize / cropHeight);
    canvasWidth = Math.floor(cropWidth * scale);
    canvasHeight = Math.floor(cropHeight * scale);
  }

  // 更新 Canvas 的尺寸为裁剪区域的尺寸
  that.setData({
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
  });

  // 清理 Canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 绘制裁剪后的图片到 Canvas
  ctx.drawImage(
    filePath,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    0,
    0,
    canvasWidth,
    canvasHeight
  );
  ctx.draw(false, () => {
    // 获取裁剪后图片的像素数据
    wx.canvasGetImageData({
      canvasId: 'qrCanvas',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      success(res) {
        console.log(`Cropped canvasGetImageData success: width=${res.width}, height=${res.height}, data length=${res.data.length}`);

        const imageData = {
          data: new Uint8ClampedArray(res.data),
          width: res.width,
          height: res.height,
        };

        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            that.handleQRCodeResult(code.data, filePath);
          } else {
            console.log('Second attempt to decode QR code failed.');
            // 识别失败，将裁剪后的图片路径作为最终的图片显示
            wx.canvasToTempFilePath({
              canvasId: 'qrCanvas',
              success(tempFileRes) {
                console.log('Cropped image saved:', tempFileRes.tempFilePath);
                that.setData({
                  images: that.data.images.concat({
                    path: tempFileRes.tempFilePath,
                    result: '解析失败，显示裁剪后的图片',
                  }),
                });
              },
              fail(err) {
                console.error('Failed to save cropped image:', err);
                that.handleDecodeFailure(filePath);
              },
            });
          }
        } catch (error) {
          console.error('jsQR error after cropping:', error);
          that.handleDecodeFailure(filePath);
        }
      },
      fail(err) {
        console.error('获取裁剪后像素数据失败', err);
        that.handleDecodeFailure(filePath);
      },
    });
  });
},


  // 处理二维码解析结果
  handleQRCodeResult(resultText, filePath) {
    const that = this;
    console.log('resultText:', resultText);

    // 检查 resultText 是否是指定的 URL
    if (resultText.startsWith('https://file-link.pinduoduo.com/')) {
      const key_code = resultText.split('/').pop(); // 提取 key_code
      console.log(`Extracted key_code: ${key_code}`);
      // 调用云函数 fetchData
      that.fetchDataFromCloudFunction(key_code, filePath);
    } else {
      // 如果不是指定的 URL，直接显示结果
      that.setData({
        images: that.data.images.concat({
          path: filePath,
          result: resultText,
        }),
      });
    }
  },

  fetchDataFromCloudFunction(key_code, filePath) {
    const that = this;
    console.log(`Starting fetchDataFromCloudFunction with key_code: ${key_code}`);

    wx.cloud.callFunction({
      name: 'fetchData',
      data: {
        key_code: key_code,
      },
      success: (res) => {
        console.log('Cloud function response:', res);
        if (res.result.status === 'success') {
          const rawData = res.result.data;
          console.log('Raw Data:', rawData);

          // 递归函数，查找 key 为 currentGoods 的值
          const findCurrentGoods = (obj) => {
            if (typeof obj !== 'object' || obj === null) return null;
            if ('currentGoods' in obj) return obj.currentGoods;

            for (let key in obj) {
              if (obj.hasOwnProperty(key)) {
                const result = findCurrentGoods(obj[key]);
                if (result) return result;
              }
            }
            return null;
          };

          const currentGoods = findCurrentGoods(rawData);

          if (currentGoods) {
            const goodsName = currentGoods.goodsName || '商品名称未知';
            const hdThumbUrl = currentGoods.hdThumbUrl || '';

            console.log(`Found goodsName: ${goodsName}, hdThumbUrl: ${hdThumbUrl}`);

            // 下载图片
            if (hdThumbUrl) {
              wx.downloadFile({
                url: hdThumbUrl,
                success: (downloadRes) => {
                  if (downloadRes.statusCode === 200) {
                    const imagePath = downloadRes.tempFilePath;

                    // 更新页面数据
                    that.setData({
                      images: that.data.images.concat({
                        path: imagePath,
                        result: goodsName,
                      }),
                    });
                  } else {
                    console.error('Image download failed', downloadRes);
                    that.setData({
                      images: that.data.images.concat({
                        path: filePath,
                        result: goodsName,
                      }),
                    });
                  }
                },
                fail: (err) => {
                  console.error('Image download failed', err);
                  that.setData({
                    images: that.data.images.concat({
                      path: filePath,
                      result: goodsName,
                    }),
                  });
                },
              });
            } else {
              // 如果没有 hdThumbUrl，直接更新 goodsName
              that.setData({
                images: that.data.images.concat({
                  path: filePath,
                  result: goodsName,
                }),
              });
            }
          } else {
            console.error('currentGoods not found in the response');
            that.setData({
              images: that.data.images.concat({
                path: filePath,
                result: 'currentGoods 未找到',
              }),
            });
          }
        } else {
          console.error('Error:', res.result.message);
          that.setData({
            images: that.data.images.concat({
              path: filePath,
              result: '解析失败',
            }),
          });
        }
      },
      fail: (err) => {
        console.error('Cloud function call failed:', err);
        that.setData({
          images: that.data.images.concat({
            path: filePath,
            result: '解析失败',
          }),
        });
      },
    });
  },

  // 处理解析失败的情况
  handleDecodeFailure(filePath) {
    const that = this;
    console.error('解析失败');
    that.setData({
      images: that.data.images.concat({
        path: filePath,
        result: '无法解析该图片',
      }),
    });
  },

  // 分享结果
  shareResults() {
    // 调用微信的分享功能
    wx.showShareMenu({
      withShareTicket: true,
    });
  },

  // 设置分享内容
  onShareAppMessage() {
    return {
      title: '分享我的图片解析结果',
      path: '/pages/share/share',
    };
  },

  // 跳转到教程页面
  goToTutorial() {
    wx.navigateTo({
      url: '/pages/tutorial/tutorial',
    });
  },
});
