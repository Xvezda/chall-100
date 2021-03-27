function contextManager(ctx, exec) {
  ctx.save()
  try {
    exec(ctx)
  } catch (e) {
    console.error(e)
  } finally {
    ctx.restore()
  }
}


class App {
  constructor(parent) {
    this.canvas = document.createElement('canvas')
    this.onResize()
    window.onresize = this.onResize.bind(this)

    this.ctx = this.canvas.getContext('2d')

    this.prevBs = []
    this.animateLine(0)

    parent.appendChild(this.canvas)
  }

  animateLine(t) {
    contextManager(this.ctx, (ctx) => {
      const size = 300
      ctx.translate(
        Math.floor(this.canvas.width/2 - size/2),
        Math.floor(this.canvas.height/2 - size/2))

      ctx.clearRect(0, 0, size, size)

      contextManager(ctx, () => {
        ctx.setLineDash([1, 0, 1])
        ctx.strokeRect(0, 0, size, size)
      })

      ctx.font = '10px sans-serif'

      const drawDot = (x, y) => {
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI*2)
        ctx.fill()
      }

      const p0 = [30, 250]
      const p1 = [80, 50]
      const p2 = [250, 50]

      const points = [p0, p1, p2]

      contextManager(ctx, () => {
        ctx.fillStyle = 'gray'
        ctx.strokeStyle = 'gray'

        drawDot(...p0)

        ctx.textAlign = 'center'
        ctx.fillText('P0', p0[0], p0[1]+15)

        drawDot(...p1)
        ctx.fillText('P1', p1[0], p1[1]-5)

        ctx.beginPath()
        ctx.moveTo(...p0)
        ctx.lineTo(...p1)
        ctx.stroke()

        drawDot(...p2)
        ctx.textAlign = 'left'
        ctx.fillText('P2', p2[0]+5, p2[1])

        ctx.beginPath()
        ctx.moveTo(...p1)
        ctx.lineTo(...p2)
        ctx.stroke()
      })

      const drawMs = (points, offsets) => {
        const getLength = (v1, v2) => Math.abs(v1 - v2)
        const prevMs = []

        for (let i = 0; i < points.length-1; ++i) {
          const from = points[i]
          const to = points[i+1]

          const getXY = (from, to) => {
            const a = getLength(from[0], to[0])
            const b = getLength(from[1], to[1])
            const c = Math.sqrt(a**2 + b**2)
            // https://stackoverflow.com/a/15994225
            const rad = Math.atan2(b, a)

            const r = c * t
            const x = from[0] + r * Math.cos(rad)
            // Yaxis goes opposite
            const y = from[1] - r * Math.sin(rad)
            return [x, y]
          }
          const [x, y] = getXY(from, to)

          drawDot(x, y)
          if (!!prevMs[prevMs.length-1]) {
            const prevM = prevMs[prevMs.length-1]
            const [prevMx, prevMy] = prevM

            ctx.beginPath()
            ctx.moveTo(prevMx, prevMy)
            ctx.lineTo(x, y)
            ctx.stroke()

            if (this.prevBs.length > 0) {
              for (const prevB of this.prevBs) {
                ctx.fillStyle = 'red'
                ctx.fillRect(prevB[0], prevB[1], 1, 1)
                ctx.fillStyle = 'black'
              }
            }

            const [bx, by] = getXY(prevM, [x, y])
            drawDot(bx, by)
            ctx.textAlign = 'center'
            ctx.fillText('B', bx, by+15)

            this.prevBs.push([bx, by])
          }
          prevMs.push([x, y])

          const name = 'M'+i
          const offset = offsets && offsets[name] || [-5, 0]
          const [x2, y2, align] = offset
          ctx.textAlign = align || 'right'
          ctx.fillText(name, x+x2, y+y2)
        }

        ctx.textAlign = 'center'
        ctx.fillText(
          `t = ${(t >= 1 ?
            '1.00' : Math.round(t*100)/100).toString().padEnd(4, 0)}`,
          Math.round(size/2), size-15)
      }
      drawMs(points, {'M0': [-5, 0], 'M1': [0, -5, 'center']})
    })
    if (t >= 1) {
      return setTimeout(() => {
        // Restart
        this.prevBs = []
        this.animateLine(0)
      }, 1000)
    }
    return window.requestAnimationFrame(() => this.animateLine(t+0.01))
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }
}

window.onload = (evt) => new App(document.body)

