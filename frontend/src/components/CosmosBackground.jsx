import { useEffect, useRef } from 'react'

export default function CosmosBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 160 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 1.2 + 0.2,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.01
      stars.forEach(s => {
        const alpha = (Math.sin(t * s.speed * 60 + s.phase) + 1) / 2 * 0.6 + 0.1
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,220,200,${alpha})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />

      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,59,31,0.18) 0%, transparent 70%)', top:-200, left:-200, filter:'blur(110px)', animation:'nebula-drift 22s ease-in-out infinite alternate' }} />
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,122,31,0.14) 0%, transparent 70%)', bottom:-100, right:-100, filter:'blur(100px)', animation:'nebula-drift 28s ease-in-out infinite alternate-reverse' }} />
        <div style={{ position:'absolute', width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,59,31,0.08) 0%, transparent 70%)', top:'45%', left:'52%', transform:'translate(-50%,-50%)', filter:'blur(80px)', animation:'nebula-drift 16s ease-in-out infinite alternate' }} />
      </div>

      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:`linear-gradient(rgba(255,59,31,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,59,31,0.03) 1px, transparent 1px)`, backgroundSize:'68px 68px' }} />

      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(ellipse at center, transparent 35%, rgba(8,2,1,0.82) 100%)' }} />
    </>
  )
}