Page({
  data: {
    productList: [], // 商品的完整列表
    filteredProductList: [], // 筛选后的商品列表
    page: 1,
    loadingMore: false,
    hasMore: true,
    filterSelected: {
      onePerson: true, // "差一人" 标签状态
      mySubscription: false // "我的订阅" 标签状态
    }
  },

  onLoad() {
    this.loadProducts();
  },

  // 加载商品数据
  loadProducts() {
    if (!this.data.hasMore) return;

    this.setData({ loadingMore: true });

    // 模拟请求数据，可以替换为实际的 API 请求
    setTimeout(() => {
      const newProducts = [
        { id: 1, imageUrl: '/assets/product1.png', title: '商品1', description: '差一人商品', price: '24.9', onePerson: true, mySubscription: false },
        { id: 2, imageUrl: '/assets/product2.png', title: '商品2', description: '我的订阅商品', price: '17.9', onePerson: false, mySubscription: true }
        // 更多商品
      ];

      this.setData({
        productList: this.data.productList.concat(newProducts),
        page: this.data.page + 1,
        loadingMore: false,
        hasMore: newProducts.length > 0
      });

      // 初次加载时也要进行筛选处理
      this.filterProducts();
    }, 1000);
  },

  // 标签点击事件
  onFilterClick(event) {
    const filterType = event.currentTarget.dataset.type;
    const currentStatus = this.data.filterSelected[filterType];
    console.log('当前点击的标签:', filterType); // 调试日志

    // 切换标签选中状态
    this.setData({
      [`filterSelected.${filterType}`]: !currentStatus
    });
    console.log('当前标签状态:', this.data.filterSelected); // 调试日志

    // 更新筛选后的商品列表
    this.filterProducts();
  },

  // 筛选商品列表
  filterProducts() {
    const { onePerson, mySubscription } = this.data.filterSelected;

    let filteredProducts = this.data.productList;

    // 根据选中的标签进行筛选
    if (onePerson) {
      filteredProducts = filteredProducts.filter(product => product.onePerson);
    }
    if (mySubscription) {
      filteredProducts = filteredProducts.filter(product => product.mySubscription);
    }

    // 更新筛选后的商品列表
    this.setData({
      filteredProductList: filteredProducts.length > 0 ? filteredProducts : this.data.productList
    });
  },

  // 滚动到底部加载更多商品
  loadMoreProducts() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadProducts();
    }
  },

  // 参与拼团事件
  onJoinGroup() {
    wx.showToast({
      title: '成功加入拼团',
      icon: 'success'
    });
  }
});
