// cloudfunctions/fetchData/index.js
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

exports.main = async (event, context) => {
  const { key_code } = event;

  // 构建初始请求 URL
  const baseUrl = `https://file-link.pinduoduo.com/${key_code}`;

  // 默认的请求头信息
  const defaultHeaders = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'cookie': 'api_uid=CkjpJmcCQXoqewBVtILWAg==; webp=1; PDDAccessToken=C2KSDKYYLOZJFETH44POXAZFFRO65F3KSR3GB4TXYVDSUZQYCBXQ120570b;',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
  };

  console.log(`Starting fetchData with key_code: ${key_code}`);

  try {
    // 1. 发起初始请求，获取重定向后的 URL
    let response = await axios.get(baseUrl, {
      headers: defaultHeaders,
      maxRedirects: 0, // 禁止自动跟随重定向
      validateStatus: (status) => status >= 200 && status < 400, // 处理 3xx 状态码
    });

    console.log(`Initial request: Status Code ${response.status}`);

    // 获取重定向的目标 URL
    if ([301, 302, 307, 308].includes(response.status)) {
      const redirectedUrl = response.headers['location'];
      console.log(`Redirected to: ${redirectedUrl}`);
      if (!redirectedUrl) {
        console.error('Redirected URL not found in headers.');
        return { status: 'error', message: 'Redirected URL not found in headers.' };
      }

      // 2. 访问重定向后的 URL
      response = await axios.get(redirectedUrl, {
        headers: defaultHeaders,
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      console.log(`Redirected request: Status Code ${response.status}`);

      // 3. 解析网页，找到最终 URL
      if (response.status === 200) {
        const data = response.data;
        const finalMatch = data.match(/location\.replace\(['"](pincard_ask\.html[^'"]+)['"]/);
        if (finalMatch) {
          const finalUrl = `https://mobile.yangkeduo.com/${finalMatch[1]}`;
          console.log(`Found final URL: ${finalUrl}`);

          // 4. 访问最终的 `pincard_ask.html` 页面
          response = await axios.get(finalUrl, {
            headers: defaultHeaders,
          });

          console.log(`Final URL request: Status Code ${response.status}`);

          // 5. 提取 window.rawData 数据
          const rawDataMatch = response.data.match(/window\.rawData\s*=\s*({.*?});/);
          if (rawDataMatch) {
            const rawDataStr = rawDataMatch[1];
            try {
              const rawData = JSON.parse(rawDataStr);
              console.log('Successfully parsed rawData.');
              return { status: 'success', data: rawData };
            } catch (err) {
              console.error('JSON parsing failed:', err);
              return { status: 'error', message: 'JSON parsing failed.' };
            }
          } else {
            console.error('rawData not found in the final response.');
            return { status: 'error', message: 'rawData not found in the final response.' };
          }
        } else {
          console.error('Final URL not found in redirected response.');
          return { status: 'error', message: 'Final URL not found in redirected response.' };
        }
      } else {
        console.error(`Unexpected status code when accessing redirected URL: ${response.status}`);
        return { status: 'error', message: `Unexpected status code when accessing redirected URL: ${response.status}` };
      }
    } else {
      console.error(`Unexpected status code in initial request: ${response.status}`);
      return { status: 'error', message: `Unexpected status code in initial request: ${response.status}` };
    }
  } catch (error) {
    console.error('Request failed:', error);
    return { status: 'error', message: `Request failed: ${error.message}` };
  }
};
