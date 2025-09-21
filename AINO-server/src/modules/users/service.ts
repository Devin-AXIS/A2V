import type { TLoginReq } from "./dto"

const MOCK_EMAIL = "admin@aino.com"
const MOCK_PASS  = "admin123"

// Mock用户数据，包含权限信息
const MOCK_USERS = [
  {
    id: "u-1",
    email: "admin@aino.com",
    name: "Admin",
    role: "admin" as const,
    permissions: ["view", "create", "edit", "delete", "manage_users", "manage_roles", "system_settings", "export_data", "api_access"]
  },
  {
    id: "u-2",
    email: "operator@aino.com", 
    name: "Operator",
    role: "operator" as const,
    permissions: ["view", "create", "edit", "delete", "export_data"]
  },
  {
    id: "u-3",
    email: "viewer@aino.com",
    name: "Viewer", 
    role: "viewer" as const,
    permissions: ["view"]
  }
]

export async function loginSvc(body: TLoginReq) {
  if (body.email === MOCK_EMAIL && body.password === MOCK_PASS) {
    return {
      token: "test-token", // 先给前端一个可用 token；接库后再换 JWT
      user: {
        id: "u-1",
        email: MOCK_EMAIL,
        name: "Admin"
      }
    }
  }
  // 未通过就抛错，路由里会转成 401
  throw new Error("INVALID_CREDENTIALS")
}

// 获取当前用户信息（包含权限）
export async function getCurrentUserSvc(token: string) {
  // 先mock：根据token返回用户信息
  if (token === "test-token") {
    return MOCK_USERS[0] // 返回admin用户
  }
  
  // 无效token
  throw new Error("INVALID_TOKEN")
}
