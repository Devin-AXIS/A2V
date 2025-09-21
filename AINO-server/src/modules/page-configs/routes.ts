import { Hono } from "hono"
import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const route = new Hono()

// 将配置以 JSON 文件形式落盘，返回 cfgId；读取时通过 cfgId 获取
const getStoreDir = () => {
    // ES 模块中获取当前文件路径的方式
    const __filename = fileURLToPath(import.meta.url)
    // 运行时代码目录 dist/src/modules/... → 取 dist/../uploads/page-configs
    const runtimeDir = path.dirname(__filename)
    const uploadsDir = path.resolve(runtimeDir, "../../../uploads/page-configs")
    return uploadsDir
}

// 基于 key 的存储目录（用于按业务键名读写）
const getKeyStoreDir = () => {
    const base = getStoreDir()
    return path.join(base, "keys")
}

// 仅允许安全字符，避免路径穿越
const sanitizeKey = (key: string) => {
    const safe = key.replace(/[^a-zA-Z0-9_.\-]/g, "_")
    return safe.slice(0, 200)
}

// POST /api/page-configs  Body: 任意 JSON（页面配置）  → { success, id }
route.post("/", async (c) => {
    try {
        const body = await c.req.json().catch(() => null)
        if (!body || typeof body !== "object") {
            return c.json({ success: false, message: "invalid json" }, 400)
        }
        const dir = getStoreDir()
        await fs.mkdir(dir, { recursive: true })
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
        const file = path.join(dir, `${id}.json`)
        await fs.writeFile(file, JSON.stringify(body, null, 2), "utf-8")
        return c.json({ success: true, id })
    } catch (e) {
        console.error("save page-config failed", e)
        return c.json({ success: false, message: "save failed" }, 500)
    }
})

// GET /api/page-configs/:id → { success, data }
route.get("/:id", async (c) => {
    try {
        const id = c.req.param("id")
        if (!id || /[^a-zA-Z0-9-]/.test(id)) {
            return c.json({ success: false, message: "invalid id" }, 400)
        }
        const dir = getStoreDir()
        const file = path.join(dir, `${id}.json`)
        const raw = await fs.readFile(file, "utf-8").catch(() => null)
        if (!raw) return c.json({ success: false, message: "not found" }, 404)
        const data = JSON.parse(raw)
        return c.json({ success: true, data })
    } catch (e) {
        console.error("read page-config failed", e)
        return c.json({ success: false, message: "read failed" }, 500)
    }
})

export default route

// 下面为按 key 的持久化接口：
// PUT /api/page-configs/key/:key    Body: { payload: any } 或 直接 JSON
// GET /api/page-configs/key/:key    → { success, data }
route.put("/key/:key", async (c) => {
    try {
        const rawKey = c.req.param("key")
        if (!rawKey) return c.json({ success: false, message: "invalid key" }, 400)
        const key = sanitizeKey(rawKey)
        const body = await c.req.json().catch(() => null)
        const data = body && typeof body === 'object' && 'payload' in body ? (body as any).payload : body
        if (data == null || typeof data !== 'object') {
            return c.json({ success: false, message: "invalid json" }, 400)
        }
        const dir = getKeyStoreDir()
        await fs.mkdir(dir, { recursive: true })
        const file = path.join(dir, `${key}.json`)
        await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8")
        return c.json({ success: true })
    } catch (e) {
        console.error("save page-config by key failed", e)
        return c.json({ success: false, message: "save failed" }, 500)
    }
})

route.get("/key/:key", async (c) => {
    try {
        const rawKey = c.req.param("key")
        if (!rawKey) return c.json({ success: false, message: "invalid key" }, 400)
        const key = sanitizeKey(rawKey)
        const dir = getKeyStoreDir()
        const file = path.join(dir, `${key}.json`)
        const raw = await fs.readFile(file, "utf-8").catch(() => null)
        if (!raw) return c.json({ success: false, message: "not found" }, 404)
        const data = JSON.parse(raw)
        return c.json({ success: true, data })
    } catch (e) {
        console.error("read page-config by key failed", e)
        return c.json({ success: false, message: "read failed" }, 500)
    }
})


