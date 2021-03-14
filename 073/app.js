function contextManager(ctx, exec) {
  ctx.save()
  try {
    exec()
  } catch (e) {
    console.error(e)
  } finally {
    ctx.restore()
  }
}


class App {
  constructor(props) {
    const {
      parent,
      theme='red'
    } = props

    this.options = {
      theme,
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    this.ctx = ctx
    this.canvas = canvas
    parent.appendChild(canvas)

    this.onResize()
    window.addEventListener('resize', this.onResize.bind(this), false)

    canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false)

    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), false)
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), false)
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this), false)

    this.initState()
    this.animationId = window.requestAnimationFrame(this.nextFrame.bind(this))
  }

  drawStart(x, y) {
    this.isDrawing = true
    this.setPosition(x, y)
  }

  drawMove(x, y) {
    this.points.forEach((point, i) => {
      // By pythagorean theorem:
      // a^2 + b^2 = c^2
      const a = Math.abs(x - point.x)
      const b = Math.abs(y - point.y)
      const c = Math.sqrt(a**2 + b**2)

      // True if c is less or equal to r
      point.hover = c <= point.r

      if (!point.active && point.hover && this.isDrawing) {
        point.active = true
        this.actives.push(i)
      }
    })
    this.setPosition(x, y)
  }

  drawEnd(x, y) {
    if (this.isDrawing) {
      this.initState()
    }
    this.setPosition(x, y)
  }

  onMouseDown(event) {
    event.preventDefault()
    this.drawStart(event.pageX, event.pageY)
  }

  onMouseMove(event) {
    event.preventDefault()
    this.drawMove(event.pageX, event.pageY)
  }

  onMouseUp(event) {
    event.preventDefault()
    this.drawEnd(event.pageX, event.pageY)
  }

  onTouchStart(event) {
    // Prevent mouse event
    event.preventDefault()

    // Accept only first touch
    const touch = event.touches[0]

    this.touchStartId = touch.identifier
    this.drawStart(touch.pageX, touch.pageY)
  }

  onTouchMove(event) {
    event.preventDefault()

    const touch = Array.prototype.find
      .call(event.touches, e => e.identifier === this.touchStartId)
    if (!touch) return

    this.drawMove(touch.pageX, touch.pageY)
  }

  onTouchEnd(event) {
    event.preventDefault()

    const touch = Array.prototype.find
      .call(event.changedTouches, e => e.identifier === this.touchStartId)
    if (!touch) return

    this.drawEnd(touch.pageX, touch.pageY)
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  initState() {
    this.actives = []
    this.isDrawing = false
    this.x = this.y = -1

    this.initPoints()
  }

  initPoints() {
    this.points = []

    const pointStyle = {
      unit: 75,
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
          this.ctx.strokeStyle = this.options.theme
          this.ctx.lineWidth = 3
          this.ctx.beginPath()
          this.ctx.arc(point.x, point.y, point.r, 0, Math.PI*2, true)
          this.ctx.stroke()
        }
      })
    })
    this.drawConnection()
  }

  drawConnection() {
    const isFirstIndex = (arr, i) => !i
    const isLastIndex = (arr, i) => i === arr.length-1

    // Draw connected line
    this.actives.forEach((v, i, a) => {
      contextManager(this.ctx, () => {
        this.ctx.strokeStyle = this.options.theme
        this.ctx.lineWidth = 5
        this.ctx.lineCap = this.ctx.lineJoin = 'round'

        const point = this.points[v]
        const {x, y} = point

        if (isFirstIndex(a, i)) {
          this.ctx.beginPath()
          this.ctx.moveTo(x, y)
        } else {
          this.ctx.lineTo(x, y)
        }

        if (isLastIndex(a, i)) {
          if (!isLastIndex(this.points, i) &&
              this.isDrawing && !point.hover) {
            this.ctx.lineTo(this.x, this.y)
          }
          this.ctx.stroke()
        }
      })
    })
  }

  setPosition(x, y) {
    this.x = x
    this.y = y
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

new App({parent: document.body})
