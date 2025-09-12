// Lightweight postMessage bridge for iframe embedding
// All comments are in English per project conventions

type BridgeTarget = {
    postMessage: (message: unknown, targetOrigin: string) => void
}

export type BridgeEventType =
    | "aino:ready"
    | "aino:height"
    | "aino:navigate"
    | "aino:error"
    | "aino:data"
    | "aino:manifest"
    | "aino:custom";

export interface BridgeMessage<TPayload = unknown> {
    type: BridgeEventType
    payload?: TPayload
    // Optional correlation id for request/response style
    correlationId?: string
    // Optional channel for namespacing if multiple iframes exist
    channel?: string
}

export interface BridgeOptions {
    // Restrict which origins can receive messages. Use "*" only for development.
    targetOrigin?: string
    // Channel name to include in each message
    channel?: string
}

const DEFAULT_ORIGIN = "*"; // consider tightening in production

export class IframeBridge {
    private target: BridgeTarget | null
    private targetOrigin: string
    private channel?: string

    constructor(target?: BridgeTarget | null, options?: BridgeOptions) {
        this.target = target ?? (typeof window !== "undefined" ? window.parent : null)
        this.targetOrigin = options?.targetOrigin ?? DEFAULT_ORIGIN
        this.channel = options?.channel
    }

    public setTarget(target: BridgeTarget) {
        this.target = target
    }

    public setTargetOrigin(origin: string) {
        this.targetOrigin = origin
    }

    public setChannel(channel: string) {
        this.channel = channel
    }

    public post<TPayload = unknown>(type: BridgeEventType, payload?: TPayload, correlationId?: string) {
        if (!this.target) return
        const message: BridgeMessage<TPayload> = { type, payload, correlationId, channel: this.channel }
        try {
            this.target.postMessage(message, this.targetOrigin)
        } catch (err) {
            // no-op: avoid throwing across app
        }
    }
}

// Utility: observe and report height changes to parent
export function startAutoHeightReporting(bridge: IframeBridge, rootSelector?: string) {
    if (typeof window === "undefined") return () => { }

    const doc = document
    const root = rootSelector ? (doc.querySelector(rootSelector) as HTMLElement | null) : doc.body
    if (!root) return () => { }

    let lastHeight = 0
    const send = () => {
        const height = Math.max(root.scrollHeight, root.offsetHeight, root.clientHeight)
        if (height !== lastHeight) {
            lastHeight = height
            bridge.post("aino:height", { height })
        }
    }

    // Initial
    send()

    // ResizeObserver for layout changes
    const ro = new ResizeObserver(() => send())
    ro.observe(root)

    // Also listen for viewport resize and font loading
    const onResize = () => send()
    window.addEventListener("resize", onResize)
    if (document.fonts && document.fonts.addEventListener) {
        document.fonts.addEventListener("loadingdone", send as EventListener)
    }

    // MutationObserver to catch dynamic content
    const mo = new MutationObserver(() => send())
    mo.observe(root, { subtree: true, childList: true, attributes: true, characterData: true })

    return () => {
        try { ro.disconnect() } catch { }
        try { mo.disconnect() } catch { }
        window.removeEventListener("resize", onResize)
    }
}

// Singleton helper for convenience
let singleton: IframeBridge | null = null
export function getIframeBridge(options?: BridgeOptions) {
    if (!singleton) {
        singleton = new IframeBridge(undefined, options)
    } else {
        if (options?.targetOrigin) singleton.setTargetOrigin(options.targetOrigin)
        if (options?.channel) singleton.setChannel(options.channel)
    }
    return singleton
}


