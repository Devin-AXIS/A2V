// 调试登录功能
console.log("🔍 开始调试登录功能...")

// 测试 API 基础 URL
const API_BASE_URL = 'http://localhost:3001'
console.log("🌐 API 基础 URL:", API_BASE_URL)

// 测试登录请求
async function testLogin() {
  try {
    console.log("🔐 测试登录请求...")
    
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@aino.com',
        password: 'admin123'
      })
    })
    
    console.log("📡 响应状态:", response.status)
    console.log("📡 响应头:", Object.fromEntries(response.headers.entries()))
    
    const data = await response.json()
    console.log("📡 响应数据:", data)
    
    if (response.ok) {
      console.log("✅ 登录成功!")
      // 存储 token
      localStorage.setItem('aino_token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      console.log("💾 Token 已存储:", data.data.token)
    } else {
      console.log("❌ 登录失败:", data)
    }
  } catch (error) {
    console.error("❌ 请求失败:", error)
  }
}

// 测试应用列表请求
async function testApplications() {
  try {
    console.log("📋 测试应用列表请求...")
    
    const token = localStorage.getItem('aino_token')
    console.log("🔑 使用 Token:", token)
    
    const response = await fetch(`${API_BASE_URL}/api/applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    console.log("📡 响应状态:", response.status)
    const data = await response.json()
    console.log("📡 响应数据:", data)
    
    if (response.ok) {
      console.log("✅ 获取应用列表成功!")
    } else {
      console.log("❌ 获取应用列表失败:", data)
    }
  } catch (error) {
    console.error("❌ 请求失败:", error)
  }
}

// 运行测试
console.log("🚀 开始运行测试...")
testLogin().then(() => {
  setTimeout(() => {
    testApplications()
  }, 1000)
})

// 导出函数供控制台调用
window.testLogin = testLogin
window.testApplications = testApplications
