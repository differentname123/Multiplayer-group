import requests
from bs4 import BeautifulSoup
import os
import html

def make_request(gzdhylOain):
    """
    发起请求并获取最终页面内容，包含重定向处理和异常捕获。

    参数：
    gzdhylOain (str): 需要传递的参数，用于请求中的某个特定部分。

    返回：
    Response: 最终的 HTTP 响应。
    """
    # 初始请求 URL
    initial_url = f"https://file-link.pinduoduo.com/{gzdhylOain}"

    # 请求头信息，模拟真实用户请求
    headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "cookie": 'api_uid=CkjpJmcCQXoqewBVtILWAg==; webp=1; jrpl=CALqopS1ixhpEb4GNdCDGcMTHkzskqOm; njrpl=CALqopS1ixhpEb4GNdCDGcMTHkzskqOm; dilx=Zg3Np6qOYb9i5y9tCHeyR; _nano_fp=Xpmxl0PoXp9JnqXJX9_Z6hpHEuw5OsST9Ira3Ed9; PDDAccessToken=C2KSDKYYLOZJFETH44POXAZFFRO65F3KSR3GB4TXYVDSUZQYCBXQ120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaLKNzPZmpOXipOzoWizbpnzEFOHtMbpnMykLHOFQpnKbhLWoVaMGMiqIFOX',
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
    }

    try:
        # 1. 发起初始请求，获取重定向后的 URL
        response = requests.get(initial_url, headers=headers, allow_redirects=False)
        response.raise_for_status()

        # 获取重定向的目标 URL
        if response.status_code in [301, 302, 307, 308]:
            redirected_url = response.headers.get('Location')
            if not redirected_url:
                raise ValueError("Redirected URL not found in headers.")
        else:
            raise ValueError(f"Unexpected status code: {response.status_code}")

        # 2. 访问重定向后的 URL (group7.html)
        response = requests.get(redirected_url, headers=headers, allow_redirects=False)
        response.raise_for_status()

        # 获取重定向后的最终页面（可能通过 JavaScript 重定向）
        if response.status_code == 200:
            # 从响应内容中分析跳转到 `pincard_ask.html` 的 URL
            soup = BeautifulSoup(response.text, 'html.parser')
            script_tags = soup.find_all('script')

            # 查找包含跳转到 `pincard_ask.html` 的 JavaScript
            final_url = None
            for script in script_tags:
                if 'location.replace' in script.text:
                    start_index = script.text.find("pincard_ask.html")
                    if start_index != -1:
                        end_index = script.text.find("'", start_index)
                        final_url = "https://mobile.yangkeduo.com/" + script.text[start_index:end_index]
                        break

            if not final_url:
                raise ValueError("Final URL not found in JavaScript.")
        else:
            raise ValueError(f"Unexpected status code when accessing group7.html: {response.status_code}")

        # 3. 访问最终的 `pincard_ask.html` 页面
        response = requests.get(final_url, headers=headers)
        response.raise_for_status()

        # 保存返回内容中的图片
        soup = BeautifulSoup(response.text, 'html.parser')
        parent_div = soup.find('div', class_='st3konfY')

        # Step 2: 在该父容器中查找符合特征的 img 标签
        target_img = None
        if parent_div:
            img_tags = parent_div.find_all('img')
            for img in img_tags:
                src = img.get('src', '')
                # 确保提取特定域名且路径包含 "/mms-material-img/"
                if 'img.pddpic.com' in src and '/mms-material-img/' in src:
                    target_img = img
                    break
        # img_tags = soup.find_all('img')
        # if not os.path.exists('images'):
        #     os.makedirs('images')
        # for index, img_tag in enumerate(img_tags):
        #     img_url = img_tag.get('src')
        #     if img_url:
        #         if not img_url.startswith('http'):
        #             img_url = "https://mobile.yangkeduo.com" + img_url
        #         img_response = requests.get(img_url, headers=headers)
        #         if img_response.status_code == 200:
        #             with open(f'images/image_{index}.jpg', 'wb') as f:
        #                 f.write(img_response.content)
                    # print(f"Image {index} saved. URL: {img_url}")

        # 返回最终的响应
        return response

    except requests.RequestException as e:
        print("Request failed:", e)
        return None
    except ValueError as e:
        print("Error:", e)
        return None

response = make_request("WRvgUjQ6du")
if response:
    print("Final URL:", response.url)
    print("Response Content:", response.text )