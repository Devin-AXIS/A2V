import { Hono } from "hono"
import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

type ModuleConfigRecord = {
    id: string
    title: string
    description: string
    payload: string // JSON string provided by client
    createdAt: string
    updatedAt: string
}

const app = new Hono()

// Resolve runtime data directory: dist/src/modules/... -> dist/../uploads/module-configs
function getStoreDir(): string {
    const __filename = fileURLToPath(import.meta.url)
    const runtimeDir = path.dirname(__filename)
    return path.resolve(runtimeDir, "../../../uploads/module-configs")
}

async function ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true })
}

function isValidId(id: string): boolean {
    return /^[a-zA-Z0-9_-]{1,200}$/.test(id)
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

async function readRecord(filePath: string): Promise<ModuleConfigRecord | null> {
    const raw = await fs.readFile(filePath, "utf-8").catch(() => null)
    if (!raw) return null
    try {
        return JSON.parse(raw) as ModuleConfigRecord
    } catch {
        return null
    }
}

// Create
// POST /api/module-configs
// Body: { payload: string (json string), title: string, description: string }
app.post("/", async (c) => {
    try {
        const body = await c.req.json().catch(() => null) as Partial<ModuleConfigRecord> | null
        if (!body || typeof body !== "object") {
            return c.json({ success: false, message: "invalid json" }, 400)
        }
        const payload = body.payload
        const title = body.title
        const description = body.description ?? ""
        if (typeof payload !== "string" || !payload.trim()) {
            return c.json({ success: false, message: "payload must be a non-empty json string" }, 400)
        }
        if (typeof title !== "string" || !title.trim()) {
            return c.json({ success: false, message: "title is required" }, 400)
        }
        // Optional: validate that payload is valid JSON
        try { JSON.parse(payload) } catch {
            return c.json({ success: false, message: "payload is not valid JSON string" }, 400)
        }

        const dir = getStoreDir()
        await ensureDir(dir)
        const id = generateId()
        const now = new Date().toISOString()
        const record: ModuleConfigRecord = { id, title: title.trim(), description: String(description || ""), payload, createdAt: now, updatedAt: now }
        const file = path.join(dir, `${id}.json`)
        await fs.writeFile(file, JSON.stringify(record, null, 2), "utf-8")
        return c.json({ success: true, data: { id } })
    } catch (e) {
        console.error("create module-config failed", e)
        return c.json({ success: false, message: "create failed" }, 500)
    }
})

// Read by id
// GET /api/module-configs/:id
app.get("/:id", async (c) => {
    try {
        const id = c.req.param("id")
        if (!id || !isValidId(id)) {
            return c.json({ success: false, message: "invalid id" }, 400)
        }
        const dir = getStoreDir()
        const file = path.join(dir, `${id}.json`)
        const record = await readRecord(file)
        if (!record) return c.json({ success: false, message: "not found" }, 404)
        return c.json({ success: true, data: record })
    } catch (e) {
        console.error("read module-config failed", e)
        return c.json({ success: false, message: "read failed" }, 500)
    }
})

// Update by id
// PUT /api/module-configs/:id
// Body: { payload?: string, title?: string, description?: string }
app.put("/:id", async (c) => {
    try {
        const id = c.req.param("id")
        if (!id || !isValidId(id)) {
            return c.json({ success: false, message: "invalid id" }, 400)
        }
        const body = await c.req.json().catch(() => null) as Partial<ModuleConfigRecord> | null
        if (!body || typeof body !== "object") {
            return c.json({ success: false, message: "invalid json" }, 400)
        }
        const dir = getStoreDir()
        const file = path.join(dir, `${id}.json`)
        const current = await readRecord(file)
        if (!current) return c.json({ success: false, message: "not found" }, 404)

        const updated: ModuleConfigRecord = {
            ...current,
            title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : current.title,
            description: typeof body.description === "string" ? body.description : current.description,
            payload: typeof body.payload === "string" && body.payload.trim() ? body.payload : current.payload,
            updatedAt: new Date().toISOString(),
        }

        // Validate payload if changed
        if (updated.payload !== current.payload) {
            try { JSON.parse(updated.payload) } catch {
                return c.json({ success: false, message: "payload is not valid JSON string" }, 400)
            }
        }

        await fs.writeFile(file, JSON.stringify(updated, null, 2), "utf-8")
        return c.json({ success: true, data: updated })
    } catch (e) {
        console.error("update module-config failed", e)
        return c.json({ success: false, message: "update failed" }, 500)
    }
})

// Delete by id
// DELETE /api/module-configs/:id
app.delete("/:id", async (c) => {
    try {
        const id = c.req.param("id")
        if (!id || !isValidId(id)) {
            return c.json({ success: false, message: "invalid id" }, 400)
        }
        const dir = getStoreDir()
        const file = path.join(dir, `${id}.json`)
        const stat = await fs.stat(file).catch(() => null as any)
        if (!stat) return c.json({ success: false, message: "not found" }, 404)
        await fs.unlink(file)
        return c.json({ success: true })
    } catch (e) {
        console.error("delete module-config failed", e)
        return c.json({ success: false, message: "delete failed" }, 500)
    }
})

// List with simple pagination and sort by updatedAt desc
// GET /api/module-configs?offset=0&limit=20&q=keyword
app.get("/", async (c) => {
    try {
        const offset = Math.max(0, parseInt(c.req.query("offset") || "0", 10) || 0)
        const limitRaw = parseInt(c.req.query("limit") || "20", 10)
        const limit = Math.min(100, Math.max(1, limitRaw || 20))
        const q = (c.req.query("q") || "").toLowerCase()

        const dir = getStoreDir()
        await ensureDir(dir)
        const files = await fs.readdir(dir).catch(() => [])
        const records: ModuleConfigRecord[] = []
        for (const name of files) {
            if (!name.endsWith(".json")) continue
            const rec = await readRecord(path.join(dir, name))
            if (rec) records.push(rec)
        }
        // Filter by keyword in title or description
        const filtered = q
            ? records.filter(r => r.title.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q))
            : records
        // Sort
        filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        const total = filtered.length
        const items = filtered.slice(offset, offset + limit)
        return c.json({ success: true, data: { items, total, offset, limit } })
    } catch (e) {
        console.error("list module-config failed", e)
        return c.json({ success: false, message: "list failed" }, 500)
    }
})

export default app


