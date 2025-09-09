import { Hono } from "hono"
import { promises as fs } from "fs"
import path from "path"

const route = new Hono()

// 将配置以 JSON 文件形式落盘，返回 cfgId；读取时通过 cfgId 获取
const getStoreDir = () => {
    // 运行时代码目录 dist/src/modules/... → 取 dist/../uploads/page-configs
    const runtimeDir = path.dirname(__filename)
    const uploadsDir = path.resolve(runtimeDir, "../../../uploads/page-configs")
    return uploadsDir
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


