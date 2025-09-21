// minimal runtime stub – will evolve to compile JSX and render safely
window.addEventListener('message', async (e) => {
  try {
    const msg = e.data
    if (!msg || msg.type !== 'RUN') return
    const { code, props, data } = msg
    // For v0: evaluate as UMD that exports default function (no JSX yet)
    const fn = new Function('exports', 'module', 'require', 'props', 'data', `${code}; return module.exports || exports.default || exports;`)
    const module: any = { exports: {} }
    const comp = fn({}, module, () => ({}), props, data)
    const root = document.getElementById('app')
    root!.innerText = typeof comp === 'string' ? comp : JSON.stringify(comp)
  } catch (err) {
    try { parent.postMessage({ type: 'RUNTIME_ERROR', message: (err as any)?.message || String(err) }, '*') } catch {}
  }
})


