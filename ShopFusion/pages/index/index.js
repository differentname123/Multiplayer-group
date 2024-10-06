Page({
  data: {
    productList: [],
    page: 1,  // 当前页码
    hasMore: true // 是否还有更多商品
  },
  
  onLoad() {
    this.loadProducts();
  },

  // 初次加载商品
  loadProducts() {
    if (!this.data.hasMore) return;

    wx.showLoading({ title: '加载中...' });

    // 模拟请求数据（可以换成实际 API 请求）
    setTimeout(() => {
      let newProducts = [
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        { id: this.data.page * 10 + 1, imageUrl: '/images/product1.png', title: '商品' + (this.data.page * 10 + 1), price: '￥24.9' },
        
        { id: this.data.page * 10 + 2, imageUrl: '/images/product2.png', title: '商品' + (this.data.page * 10 + 2), price: '￥17.9' }
        // 模拟更多商品
      ];

      let updatedList = this.data.productList.concat(newProducts);
      
      this.setData({
        productList: updatedList,
        page: this.data.page + 1,
        hasMore: newProducts.length > 0 // 根据返回的数据判断是否还有更多
      });

      wx.hideLoading();
    }, 1000); // 模拟网络延迟
  },

  // 滚动到底部加载更多商品
  loadMoreProducts() {
    if (this.data.hasMore) {
      this.loadProducts();
    }
  }
});
