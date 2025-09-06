"use client"
import React, { useEffect, useMemo, useRef } from "react"

export type InlineSandboxProps = {
  code: string
  props?: any
  data?: any
  theme?: any
  ui?: any
  className?: string
}

export const InlineSandbox: React.FC<InlineSandboxProps> = ({ code, props, data, theme, ui, className }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const srcDoc = useMemo(() => `<!doctype html><html><head><meta charset="utf-8"><style>html,body,#root{height:100%;margin:0}</style>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head><body><div id="root"></div>
  <script>
  const render = (payload) => {
    try {
      const { code, props, data, theme, ui } = payload
      const transformed = Babel.transform(code, { presets: ['react'] }).code
      const exports = {}
      const module = { exports }
      const req = () => ({})
      const fn = new Function('exports','module','require','React','props','data','theme','ui', transformed + '; return module.exports || exports.default || exports')
      const Comp = fn(exports, module, req, window.React, props, data, theme, ui)
      const el = React.createElement(Comp.default || Comp, { props, data, theme, ui })
      ReactDOM.createRoot(document.getElementById('root')).render(el)
    } catch (e) {
      document.getElementById('root').innerText = 'Sandbox error: ' + (e && e.message ? e.message : e)
    }
  }
  window.addEventListener('message', (e)=>{ if (e.data && e.data.type==='RUN'){ render(e.data) } })
  </script>
  </body></html>`, [])

  useEffect(() => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage({ type: 'RUN', code, props, data, theme, ui }, '*')
  }, [code, props, data, theme, ui])

  return <iframe ref={iframeRef} className={className} sandbox="allow-scripts" srcDoc={srcDoc} />
}

export default InlineSandbox


