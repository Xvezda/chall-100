class App {
  constructor(props) {
    const { parent, options } = props

    this.options = {
      brushSize: 20,
      ...options
    }
    this.prevEvent = null

    this.canvas = document.createElement('canvas')
    this.onResize()

    this.ctx = this.canvas.getContext('2d')

    this.canvas.onpointerup = this.onPointerUp.bind(this)
    this.canvas.onpointerdown = this.onPointerDown.bind(this)

    window.onresize = this.onResize.bind(this)

    parent.appendChild(this.canvas)
  }

  onPointerDown(event) {
    this.onPointerMove(event)
    this.canvas.onpointermove = this.onPointerMove.bind(this)
  }

  onPointerUp(event) {
    this.canvas.onpointermove = null
    this.prevEvent = null
  }

  onPointerMove(event) {
    const getBrushSize = (pointerType, pressure) => {
      const defaultSize = this.options.brushSize
      switch (pointerType) {
        case 'mouse':
          return defaultSize
        case 'pen':
        default:
          return defaultSize * pressure
      }
    }
    const brushSize = getBrushSize(event.pointerType, event.pressure)
    const { x, y } = event

    // TODO: Try non-linear interpolation
    const interpolation = ({ from, to, count = 10 }) => {
      const distance = to - from
      const step = distance / (count+1)
      return [
        from,
        ...(Array(count).fill(0).map((v, i) => (i+1) * step + from)),
        to
      ]
    }

    const drawDot = (x, y, size) => {
      this.ctx.beginPath()
      this.ctx.arc(x - size/2, y - size/2, size, 0, 2*Math.PI)
      this.ctx.fill()
      this.ctx.closePath()
    }

    if (this.prevEvent) {
      // Emulate middle points
      const { x: prevX, y: prevY, brushSize: prevBrushSize } = this.prevEvent

      const count = 100
      const [xs, ys, sizes] = [
        interpolation({ from: prevX, to: x, count: count }),
        interpolation({ from: prevY, to: y, count: count }),
        interpolation({ from: prevBrushSize, to: brushSize, count: count })
      ]
      console.log(xs, ys, sizes)
      // Draw only middle points
      for (let i = 1; i <= count; ++i) {
        drawDot(xs[i], ys[i], sizes[i])
      }
    }
    // Draw at current position
    drawDot(x, y, brushSize)

    // Capture event
    const captureProps = [
      'pressure', 'pointerType', 'x', 'y'
    ]
    const captureObject = {}
    captureProps.forEach(prop => captureObject[prop] = event[prop])

    // Save brush size
    captureObject.brushSize = brushSize

    this.prevEvent = captureObject
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }
}


new App({ parent: document.body })
