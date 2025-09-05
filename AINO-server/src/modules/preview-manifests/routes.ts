import { Hono } from "hono"
import { z } from "zod"
import { cors } from "hono/cors"
import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const runtimeDir = path.dirname(fileURLToPath(import.meta.url))
const previewsDir = path.resolve(runtimeDir, "../../previews")

async function ensureDir(dir: string) {
	try {
		await fs.mkdir(dir, { recursive: true })
	} catch {}
}

const CreateSchema = z.object({
	manifest: z.any(),
})

const route = new Hono()

route.use("*", cors())

route.post("/", async (c) => {
	try {
		const body = await c.req.json()
		const parsed = CreateSchema.safeParse(body)
		if (!parsed.success) {
			return c.json({ success: false, message: "invalid manifest" }, 400)
		}

		await ensureDir(previewsDir)
		const id = (globalThis as any).crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
		const payload = { id, manifest: parsed.data.manifest, createdAt: new Date().toISOString() }
		const file = path.join(previewsDir, `${id}.json`)
		await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8")
		return c.json({ success: true, data: { id } })
	} catch (e) {
		console.error("create preview manifest error", e)
		return c.json({ success: false, message: "server error" }, 500)
	}
})

route.get("/:id", async (c) => {
	try {
		const id = c.req.param("id")
		if (!id) return c.json({ success: false, message: "id required" }, 400)
		const file = path.join(previewsDir, `${id}.json`)
		try {
			const raw = await fs.readFile(file, "utf8")
			const obj = JSON.parse(raw)
			return c.json({ success: true, data: { id: obj.id, manifest: obj.manifest } })
		} catch {
			return c.json({ success: false, message: "Not Found" }, 404)
		}
	} catch (e) {
		console.error("get preview manifest error", e)
		return c.json({ success: false, message: "server error" }, 500)
	}
})

export default route
