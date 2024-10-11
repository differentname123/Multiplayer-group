import requests


def get_public_ip():
    try:
        # 调用 httpbin 服务获取当前的公网 IP 地址
        response = requests.get('https://httpbin.org/ip')
        response.raise_for_status()  # 检查请求是否成功
        ip_data = response.json()

        # 打印和返回 IP 地址
        print(f"Public IP Address: {ip_data['origin']}")
        return ip_data['origin']
    except requests.RequestException as e:
        print(f"Failed to fetch IP address: {e}")
        return None


# 调用函数并打印 IP 地址
if __name__ == "__main__":
    get_public_ip()
