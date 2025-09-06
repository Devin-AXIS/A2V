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
  const srcDoc = useMemo(() => `<!doctype html><html><head>${csp ? `<meta http-equiv="Content-Security-Policy" content="${csp}">` : ''}<style>html,body,#app{height:100%;margin:0}</style></head><body><div id="app"></div><script>window.addEventListener('message',function(e){try{const msg=e.data;if(msg&&msg.type==='RUN'){parent.postMessage({type:'ACK'},'*')}}catch{}})</script></body></html>`, [csp])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !iframe.contentWindow) return
    const payload = { type: 'RUN', code, props, data, theme, ui, timeoutMs }
    try { iframe.contentWindow.postMessage(payload, '*') } catch (e) { onError?.(e) }
  }, [code, props, data, theme, ui, timeoutMs, onError])

  return <iframe ref={iframeRef} className={className} sandbox="allow-scripts" srcDoc={srcDoc} />
}

export default CodeSandbox


