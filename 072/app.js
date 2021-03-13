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

    canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false)

    this.log = lazyLogger(10)

    this.initState()
    this.animationId = window.requestAnimationFrame(this.nextFrame.bind(this))
  }

  onMouseMove(event) {
    event.preventDefault()
    this.log(event, this.points)

    this.points.forEach((point, i) => {
      const distX = event.pageX - point.x
      const distY = event.pageY - point.y

      const distFromCenter = Math.sqrt(distX**2 + distY**2)

      point.hover = distFromCenter <= point.r

      if (!point.active && point.hover && this.isMouseDown) {
        point.active = true

        this.actives.push(i)
        console.log('actives:', this.actives)
      }
    })
    this.setMousePosition(event.pageX, event.pageY)
  }

  onMouseDown(event) {
    event.preventDefault()

    this.isMouseDown = true
    this.setMousePosition(event.pageX, event.pageY)
  }

  onMouseUp(event) {
    event.preventDefault()

    if (this.isMouseDown) {
      this.initState()
    }
    this.setMousePosition(event.pageX, event.pageY)
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  initState() {
    this.actives = []
    this.isMouseDown = false
    this.mouseX = this.mouseY = -1

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
        this.ctx.lineCap = 'round'
        this.ctx.lineJoin = 'round'

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
              this.isMouseDown && !point.hover) {
            this.ctx.lineTo(this.mouseX, this.mouseY)
          }
          this.ctx.stroke()
        }
      })
    })
  }

  setMousePosition(x, y) {
    this.mouseX = x
    this.mouseY = y
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
