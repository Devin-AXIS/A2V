const http = require('http')

const testData = {
  name: '测试目录',
  type: 'table',
  supportsCategory: false,
  config: {},
  order: 0
}

const postData = JSON.stringify(testData)

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/directories?applicationId=0f6c007e-0d10-4119-abb9-85eef2e82dcc&moduleId=fa9d9c7c-9cc6-4aa1-ade9-b259c99b74e3',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer test-token'
  }
}

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`)
  console.log(`响应头: ${JSON.stringify(res.headers)}`)
  
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    console.log('响应体:', data)
    try {
      const parsed = JSON.parse(data)
      console.log('解析后的响应:', JSON.stringify(parsed, null, 2))
    } catch (e) {
      console.log('解析响应失败:', e)
    }
  })
})

req.on('error', (e) => {
  console.error(`请求错误: ${e.message}`)
})

req.write(postData)
req.end()
