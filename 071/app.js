function contextManager(ctx, exec) {
  ctx.save()
  try {
    exec()
  } catch (e) {

  } finally {
    ctx.restore()
  }
}


function lazyLogger(unit) {
  let i = 0
  return function (...args) {
    ++i
    if (i % unit === 0) {
      console.log(...args)
    }
  }
}


class App {
  constructor(parent) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    this.ctx = ctx
    this.canvas = canvas
    parent.appendChild(canvas)

    this.onResize()
    window.addEventListener('resize', this.onResize.bind(this), false)
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false)

    this.log = lazyLogger(10)

    this.initState()
    this.animationId = window.requestAnimationFrame(this.nextFrame.bind(this))
  }

  onMouseMove(event) {
    this.log(event, this.points)

    this.points.forEach((point, i) => {
      const distX = event.layerX - point.x
      const distY = event.layerY - point.y

      const distFromCenter = Math.sqrt(distX**2 + distY**2)

      point.hover = distFromCenter <= point.r

      if (!point.active && point.hover && this.isMouseDown) {
        point.active = true

        this.actives.push(i)
        console.log('actives:', this.actives)
      }
    })
  }

  onMouseDown(event) {
    this.isMouseDown = true
  }

  onMouseUp(event) {
    this.initState()
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  initState() {
    this.actives = []
    this.isMouseDown = false

    this.initPoints()
  }

  initPoints() {
    this.points = []

    const pointStyle = {
      unit: 50,
      radius: 20,

    }

    for (let unit = pointStyle.unit, y = unit; y <= unit * 3; y += unit) {
      for (let x = unit; x <= unit * 3; x += unit) {
        this.points.push({
          x: x,
          y: y,
          r: pointStyle.radius,
          hover: false,
          active: false,
        })
      }
    }
  }

  drawBackground() {
    // Draw each points
    this.points.forEach(point => {
      contextManager(this.ctx, () => {
        this.ctx.fillStyle = 'lightgray'

        this.ctx.beginPath()
        this.ctx.arc(point.x, point.y, point.r, 0, Math.PI*2, true)
        this.ctx.fill()

        // Draw inner point
        this.ctx.fillStyle = 'gray'
        this.ctx.beginPath()
        this.ctx.arc(point.x, point.y, point.r-10, 0, Math.PI*2, true)
        this.ctx.fill()

        // Draw hover outline indicator
        if (point.hover || point.active) {
          this.ctx.strokeStyle = 'red'
          this.ctx.lineWidth = 3
          this.ctx.beginPath()
          this.ctx.arc(point.x, point.y, point.r, 0, Math.PI*2, true)
          this.ctx.stroke()
        }
      })
    })

    // Draw connected line
    this.actives.forEach((v, i) => {
      contextManager(this.ctx, () => {
        this.ctx.strokeStyle = 'red'
        this.ctx.lineWidth = 5

        const {x, y} = this.points[v]

        if (!i) {
          this.ctx.beginPath()
          this.ctx.moveTo(x, y)
        } else {
          this.ctx.lineTo(x, y)
        }

        if (i === this.actives.length-1) {
          this.ctx.stroke()
        }
      })
    })
  }

  nextFrame(timestamp) {
    this.clearCanvas()
    this.drawBackground()

    this.animationId = window.requestAnimationFrame(this.nextFrame.bind(this))
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

new App(document.body)
