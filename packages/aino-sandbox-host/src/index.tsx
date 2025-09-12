import React, { useEffect, useMemo, useRef } from 'react'

export type CodeSandboxProps = {
  code: string
  props?: any
  data?: any
  theme?: any
  ui?: any
  className?: string
  csp?: string
  timeoutMs?: number
  onError?: (e: any) => void
}

export const CodeSandbox: React.FC<CodeSandboxProps> = ({ code, props, data, theme, ui, className, csp, timeoutMs = 2000, onError }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const srcDoc = useMemo(() => `<!doctype html><html><head>${csp ? `<meta http-equiv="Content-Security-Policy" content="${csp}">` : ''}
  <meta charset="utf-8"/><style>html,body,#root{height:100%;margin:0}</style>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head><body><div id="root"></div>
  <script>
  const render = (payload)=>{
    try{
      const { code, props, data, theme, ui } = payload
      const compiled = Babel.transform(code, { presets: ['react'] }).code
      const exports = {}; const module = { exports }
      const req = ()=>({})
      const fn = new Function('exports','module','require','React','props','data','theme','ui', compiled + '; return module.exports || exports.default || exports')
      const Comp = fn(exports, module, req, window.React, props, data, theme, ui)
      const element = window.React.createElement((Comp && (Comp.default||Comp)) || (()=>null), { props, data, theme, ui })
      window.ReactDOM.createRoot(document.getElementById('root')).render(element)
    }catch(err){ try{ parent.postMessage({ type:'RUNTIME_ERROR', message: (err&&err.message)||String(err) }, '*') }catch{} }
  }
  let timer; window.addEventListener('message',(e)=>{ const m=e.data; if(!m) return; if(m.type==='RUN'){ clearTimeout(timer); timer=setTimeout(()=>{ render(m) }, 0) } })
  </script>
  </body></html>`, [csp])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !iframe.contentWindow) return
    const payload = { type: 'RUN', code, props, data, theme, ui, timeoutMs }
    try { iframe.contentWindow.postMessage(payload, '*') } catch (e) { onError?.(e) }
    const handler = (e) => { const m = e.data; if (m && m.type==='RUNTIME_ERROR') { onError?.(new Error(m.message)) } }
    window.addEventListener('message', handler as any)
    return () => window.removeEventListener('message', handler as any)
  }, [code, props, data, theme, ui, timeoutMs, onError])

  return <iframe ref={iframeRef} className={className} sandbox="allow-scripts" srcDoc={srcDoc} />
}

export default CodeSandbox


