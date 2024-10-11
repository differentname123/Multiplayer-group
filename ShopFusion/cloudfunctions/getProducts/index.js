// cloudfunctions/getProducts/index.js
const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
  const db = cloud.database();

  const { page = 1, filters = {} } = event;
  const pageSize = 10; // 每页显示的数量

  try {
    const _ = db.command;
    let query = db.collection('goodsInfoTable');

    // 动态构建查询条件
    if (Object.keys(filters).length > 0) {
      query = query.where(filters);
    }

    const res = await query
      .orderBy('updateTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    console.error('获取商品数据失败', err);
    return {
      success: false,
      errorMessage: err.message
    };
  }
};
