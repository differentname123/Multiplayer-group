// index.js
Page({
  data: {
    productList: [], // 商品的完整列表
    filteredProductList: [], // 筛选后的商品列表
    page: 1,
    loadingMore: false,
    hasMore: true,
    filterSelected: {
      onePerson: false, // "只差一人" 标签状态，默认未选中
      mySubscription: false // "我的订阅" 标签状态
    },
    globalInterval: null // 全局倒计时定时器
  },

  onLoad() {
    this.loadProducts();
    this.startGlobalCountdown(); // 启动全局倒计时
  },

  onUnload() {
    // 清除全局定时器
    clearInterval(this.data.globalInterval);
  },

  // 加载商品数据
  loadProducts() {
    if (this.data.loadingMore || !this.data.hasMore) return;

    this.setData({ loadingMore: true });

    // 构建查询条件
    const filters = {};

    if (this.data.filterSelected.onePerson) {
      filters.groupRemainCount = 1;
    }

    // 调用云函数获取商品数据
    wx.cloud.callFunction({
      name: 'getProducts',
      data: {
        page: this.data.page,
        filters: filters
      }
    }).then(res => {
      if (!res.result.success) {
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
        this.setData({ loadingMore: false });
        return;
      }

      const newProducts = res.result.data;

      // 如果返回的数据少于预期（例如少于 pageSize），且已是最后一页，设置 hasMore 为 false
      const pageSize = 10; // 与云函数中每页数量一致
      if (newProducts.length < pageSize) {
        this.setData({ hasMore: false });
        if (newProducts.length === 0 && this.data.page === 1) {
          // 如果第一页就没有数据，弹出提示
          wx.showToast({
            title: '没有符合条件的商品',
            icon: 'none'
          });
        }
      }

      if (newProducts.length === 0 && this.data.page > 1) {
        wx.showToast({
          title: '没有更多商品了',
          icon: 'none'
        });
      }

      // 处理商品数据，转换字段
      const processedProducts = newProducts.map(item => {
        // 计算还差多少人拼团成功
        const groupRemainCount = item.customerNum - item.groupUserNum;

        return {
          id: item._id,
          imageUrl: item.hdThumbUrl,
          title: item.goodsName,
          price: (Number(item.originActivityPrice) / 100).toFixed(2),
          discountPrice: (Number(item.priceReduce) / 100).toFixed(2),
          keyCode: item.keyCode,
          expireTime: Number(item.expireTime), // 确保是数字类型
          groupStatus: item.groupStatus,
          groupUserNum: item.groupUserNum,
          customerNum: item.customerNum,
          groupRemainCount: groupRemainCount,
          // 倒计时初始值
          countdown: '',
          // 标签筛选条件
          onePerson: groupRemainCount === 1,
          mySubscription: false // 根据业务逻辑设置
        };
      });

      // 更新商品列表和分页信息
      this.setData({
        productList: this.data.productList.concat(processedProducts),
        page: this.data.page + 1,
        loadingMore: false
      });

      // 更新筛选后的商品列表
      this.filterProducts();

    }).catch(err => {
      console.error('获取商品数据失败', err);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
      this.setData({ loadingMore: false });
    });
  },

  // 启动全局倒计时定时器
  startGlobalCountdown() {
    this.setData({
      globalInterval: setInterval(() => {
        this.updateCountdowns();
      }, 100) // 每 100 毫秒更新一次
    });
  },

  // 更新所有商品的倒计时
  updateCountdowns() {
    const now = Date.now(); // 当前时间毫秒数
    const updatedProductList = this.data.productList.map(product => {
      const countdown = this.calculateCountdown(product.expireTime);
      return { ...product, countdown };
    });

    const { mySubscription } = this.data.filterSelected;

    let filteredProducts = updatedProductList;

    // 根据选中的标签进行筛选
    if (mySubscription) {
      filteredProducts = filteredProducts.filter(product => product.mySubscription);
    }

    // 更新数据
    this.setData({
      productList: updatedProductList,
      filteredProductList: filteredProducts
    });
  },

  // 计算倒计时
  calculateCountdown(expireTime) {
    const now = Date.now(); // 当前时间的时间戳（毫秒）
    const expireTimeMs = Number(expireTime) * 1000; // 过期时间的时间戳（毫秒）
    const timeLeft = expireTimeMs - now;

    if (timeLeft <= 0) {
      return '已结束';
    }

    const hours = Math.floor(timeLeft / (3600 * 1000));
    const minutes = Math.floor((timeLeft % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
    const milliseconds = Math.floor((timeLeft % 1000) / 10); // 取两位小数

    const millisecondsStr = milliseconds < 10 ? `0${milliseconds}` : milliseconds;

    return `${hours}:${minutes}:${seconds}:${millisecondsStr}`;
  },

  // 标签点击事件
  onFilterClick(event) {
    const filterType = event.currentTarget.dataset.type;
    const currentStatus = this.data.filterSelected[filterType];
    console.log('当前点击的标签:', filterType);

    // 切换标签选中状态
    this.setData({
      [`filterSelected.${filterType}`]: !currentStatus,
      // 重置分页信息
      page: 1,
      productList: [],
      filteredProductList: [],
      hasMore: true
    });

    // 重新加载商品数据
    this.loadProducts();
  },

  // 筛选商品列表
  filterProducts() {
    const { mySubscription } = this.data.filterSelected;

    let filteredProducts = this.data.productList;

    // 根据选中的标签进行筛选
    if (mySubscription) {
      filteredProducts = filteredProducts.filter(product => product.mySubscription);
    }

    // 更新筛选后的商品列表
    this.setData({
      filteredProductList: filteredProducts
    });
  },

  // 滚动到底部加载更多商品
  loadMoreProducts() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadProducts();
    } else if (!this.data.hasMore) {
      wx.showToast({
        title: '没有更多商品了',
        icon: 'none'
      });
    }
  },

  // 参与拼团事件
  onJoinGroup(event) {
    const keyCode = event.currentTarget.dataset.keycode;
    const url = `https://file-link.pinduoduo.com/${keyCode}`;

    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 商品卡片点击事件（可根据需要实现）
  onProductClick(event) {
    const item = event.currentTarget.dataset.item;
    // 实现商品点击逻辑，例如跳转到详情页
  }
});
