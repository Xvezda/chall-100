class App {
  constructor(props) {
    const { parent, options } = props

    this.options = {
      brushSize: 20,
      maxHistories: 50,
      ...options
    }
    this.previousEvent = null
    this.histories = []
    this.historyStash = null
    this.redoStack = []

    this.canvas = document.createElement('canvas')
    this.onResize()
    this._saveHistory()

    this.ctx = this.canvas.getContext('2d')

    this.canvas.onpointerup = this.onPointerUp.bind(this)
    this.canvas.onpointerdown = this.onPointerDown.bind(this)

    // Add event handlers
    window.onkeydown = this.onKeyDown.bind(this)
    window.onresize = this.onResize.bind(this)

    parent.appendChild(this.canvas)
  }

  _saveHistory() {
    // Save canvas state when brush released
    const capture = this.canvas.toDataURL('image/png', 1.0)

    // If histories which include stash over the max histories option
    while (this.options.maxHistories <= this.histories.length - 1) {
      this.histories.shift()
    }

    if (this.historyStash) {
      this.histories.push(this.historyStash)
    }
    this.historyStash = capture
  }

  onKeyDown(event) {
    event.preventDefault()

    const shortcutKey =
      navigator.platform.startsWith('Win') ? 'Control' : 'Meta'

    switch (event.key) {
      case 'z':
        // If keydown event is combination of shortcut
        if (event[`${shortcutKey.toLowerCase()}Key`]) {
          if (event.shiftKey) {
            this._redo()
          } else {
            this._undo()
          }
        }
        break;
      default:
        console.debug('keypress:', event)
        break;
    }
  }

  _replaceCanvasWithImage(image) {
    this.clearCanvas()
    this.ctx.drawImage(image, 0, 0, image.width, image.height)

    this._saveHistory()
  }

  async _replaceCanvasWithImageUrl(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this._replaceCanvasWithImage(img)
        resolve()
      }
      img.onerror = reject
      img.src = url
    })
  }

  async _undo() {
    // Pass if no history left
    if (!this.histories.length) return

    if (this.historyStash) {
      this.redoStack.push(this.historyStash)
    }
    this.historyStash = null

    const latestHistory = this.histories.pop()
    await this._replaceCanvasWithImageUrl(latestHistory)
  }

  async _redo() {
    await this._replaceCanvasWithImageUrl(this.redoStack.pop())
  }

  onPointerDown(event) {
    console.debug('event:', event)

    this.onPointerMove(event)
    this.canvas.onpointermove = this.onPointerMove.bind(this)
  }

  onPointerUp(event) {
    console.debug('event:', event)

    this.canvas.onpointermove = null
    this.previousEvent = null

    if (this.redoStack.length) {
      this.redoStack = []
    }
    this._saveHistory()
  }

  onPointerMove(event) {
    // FIXME: Brush grews to the top-left not the center of brush
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

    if (this.previousEvent) {
      // Emulate middle points
      const { x: prevX, y: prevY, brushSize: prevBrushSize } = this.previousEvent

      const count = 100
      const [xs, ys, sizes] = [
        interpolation({ from: prevX, to: x, count: count }),
        interpolation({ from: prevY, to: y, count: count }),
        interpolation({ from: prevBrushSize, to: brushSize, count: count })
      ]
      // console.log(xs, ys, sizes)
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

    this.previousEvent = captureObject
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}


new App({ parent: document.body })
