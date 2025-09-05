import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const app = new Hono()

const runtimeDir = path.dirname(fileURLToPath(import.meta.url))
const manifestsRoot = path.resolve(runtimeDir, "../../app-manifests")

async function ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true })
}

async function readJSON(file: string) {
    const raw = await fs.readFile(file, "utf8").catch(() => "")
    return raw ? JSON.parse(raw) : null
}

const StateSchema = z.enum(["draft", "published"]).default("published")

// GET /api/apps/:appId/manifest?state=draft|published
app.get(
    "/:appId/manifest",
    zValidator("param", z.object({ appId: z.string().min(1) })),
    zValidator("query", z.object({ state: StateSchema }).partial()),
    async (c) => {
        try {
            const { appId } = c.req.valid("param")
            const { state } = (c.req.valid("query") as any) || {}
            const s = state || "published"
            const dir = path.join(manifestsRoot, appId)
            const file = path.join(dir, `${s}.json`)
            let data = await readJSON(file)
            if (!data && s === "draft") {
                await ensureDir(dir)
                const payload = {
                    id: appId,
                    state: "draft",
                    createdAt: new Date().toISOString(),
                    manifest: {
                        schemaVersion: "1.0",
                        app: {
                            appKey: appId,
                            locale: "zh-CN",
                            theme: "default",
                            bottomNav: [],
                        },
                    },
                }
                await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8")
                data = payload as any
            }
            if (!data) return c.json({ success: false, message: "Manifest not found" }, 404)
            return c.json({ success: true, data })
        } catch (e) {
            console.error("get app manifest error", e)
            return c.json({ success: false, message: "server error" }, 500)
        }
    }
)

// PUT /api/apps/:appId/manifest?state=draft|published  body: { manifest: any }
app.put(
    "/:appId/manifest",
    zValidator("param", z.object({ appId: z.string().min(1) })),
    zValidator("query", z.object({ state: StateSchema }).partial()),
    async (c) => {
        try {
            const { appId } = c.req.valid("param")
            const { state } = (c.req.valid("query") as any) || {}
            const s = state || "draft"
            const body = await c.req.json().catch(() => ({}))
            const parsed = z
                .object({ manifest: z.any() })
                .safeParse(body)
            if (!parsed.success) return c.json({ success: false, message: "invalid manifest" }, 400)
            const dir = path.join(manifestsRoot, appId)
            await ensureDir(dir)
            const file = path.join(dir, `${s}.json`)
            const payload = { id: appId, manifest: parsed.data.manifest, updatedAt: new Date().toISOString(), state: s }
            await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8")
            return c.json({ success: true })
        } catch (e) {
            console.error("put app manifest error", e)
            return c.json({ success: false, message: "server error" }, 500)
        }
    }
)

// POST /api/apps/:appId/manifest/publish  { from?: 'draft' }
app.post(
    "/:appId/manifest/publish",
    zValidator("param", z.object({ appId: z.string().min(1) })),
    async (c) => {
        try {
            const { appId } = c.req.valid("param")
            const body = await c.req.json().catch(() => ({}))
            const fromState = (body?.from || "draft") as "draft" | "published"
            const dir = path.join(manifestsRoot, appId)
            await ensureDir(dir)
            const fromFile = path.join(dir, `${fromState}.json`)
            const toFile = path.join(dir, `published.json`)
            const data = await readJSON(fromFile)
            if (!data) return c.json({ success: false, message: "source manifest not found" }, 404)
            const payload = { id: appId, manifest: data.manifest ?? data, publishedAt: new Date().toISOString(), state: "published" }
            await fs.writeFile(toFile, JSON.stringify(payload, null, 2), "utf8")
            return c.json({ success: true })
        } catch (e) {
            console.error("publish app manifest error", e)
            return c.json({ success: false, message: "server error" }, 500)
        }
    }
)

export default app


