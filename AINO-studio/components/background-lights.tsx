"use client"

export function BackgroundLights() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(1200px_400px_at_-10%_-20%,black,transparent)] bg-white/40" />
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(900px_360px_at_120%_120%,black,transparent)] bg-white/30" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-100/50 to-transparent" />
    </>
  )
}
