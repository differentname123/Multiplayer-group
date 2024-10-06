import requests

url = "https://mobile.yangkeduo.com/pincard_ask.html"

params = {
    "__rp_name": "brand_amazing_price_group",
    "_pdd_tc": "ffffff",
    "_pdd_sbs": "1",
    "group_order_id": "2731609243698494022",
    "refer_share_channel": "command",
    "_ex_pcode": "owqd3McxsWlXJ",
    "source_app": "wx1f1628bf6959db75",
    "xcx_trace_id": "18193330316813740",
    "refer_page_sn": "10031",
    "refer_page_name": "search",
    "_m_uin": "ALCIJPHVL3KKOXFF4EG37L6YIQ_GEXDA",
    "xcx_version": "v8.3.89"
}

headers = {
    "Host": "mobile.yangkeduo.com",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b13)XWEB/9185",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Cookie": "rec_list_brand_amazing_price_group=rec_list_brand_amazing_price_group_SXNqcZ; api_uid=CiV8HmcCUfa++QB0LRw7Ag==; webp=1; PDDAccessToken=44KFFFOCEJRW2EXN3QXHY2BKMQ6NOUARBYTBAY44U7GGKLGTVY3Q123576d; pdd_user_id=1279248863063; pdd_user_uin=ALCIJPHVL3KKOXFF4EG37L6YIQ_GEXDA; jrpl=N0jPqgWvX5swTdy8lsFQnd1dpcaKXsqt; njrpl=N0jPqgWvX5swTdy8lsFQnd1dpcaKXsqt; dilx=9PMbaWaOsJCWTdnKxEoew; _nano_fp=Xpmxl0PonpXol0XbnC_0P_kxalDRFORl27mfhF1f; pdd_vds=garcYdLwsbuTcBcfuuuNsuDldfBDCsccsfxswTsTrfslLcTcDllfDxleTDcb"
}

response = requests.get(url, headers=headers, params=params, verify=False)

# 保存响应内容到文件
with open("0.dat", "wb") as file:
    file.write(response.content)

print(f"Status Code: {response.status_code}")
print(f"Headers: {response.headers}")