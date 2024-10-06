import requests
import hashlib
import json
import time

# 拼多多开放平台API网关
api_url = "https://gw-api.pinduoduo.com/api/router"

# 应用参数
client_id = "f15639975cba4df6bc8afcde5151086a"
client_secret = "2b32a01a4d9ca5327595cf97eed3f798631c87f3"
access_token = "YOUR_ACCESS_TOKEN"

# 当前时间戳
timestamp = str(int(time.time()))

# 请求参数
params = {
    "type": "pdd.ddk.goods.search",
    "client_id": client_id,
    "timestamp": timestamp,
    "data_type": "JSON",
    "access_token": access_token,
    "with_coupon": "true",
    # 其他业务参数，如关键词等
    "keyword": "麻辣嫩滑牛肉",
}

# 签名计算
def sign_request(params, client_secret):
    sorted_params = sorted(params.items())
    sign_str = client_secret + ''.join(['{}{}'.format(k, v) for k, v in sorted_params]) + client_secret
    sign = hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()
    return sign

params["sign"] = sign_request(params, client_secret)

# 发起请求
response = requests.post(api_url, data=params)
result = response.json()

# 处理结果
if "error_response" in result:
    print("请求出错：", result["error_response"])
else:
    goods_list = result.get("goods_search_response", {}).get("goods_list", [])
    for goods in goods_list:
        print("商品ID：", goods["goods_id"])
        print("商品名称：", goods["goods_name"])
        print("商品价格：", goods["min_group_price"])
        print("商品链接：", goods["goods_url"])
        print("---------------------------")
