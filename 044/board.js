import {Rectangle} from './objects/rectangle.js'

export class Board {
  constructor(parent) {
    parent.style.background = 'grey'

    this.unitSize = 20
    this.positions = []
    this.objects = []

    // Create components
    this.canvas = document.createElement('canvas')
    // TODO: Add modes
    this.canvas.style.cursor = 'cell'
    this.ctx = this.canvas.getContext('2d')

    // Bind event listeners
    this.onResize()
    window.onresize = this.onResize.bind(this)

    this.canvas.onmousemove = this.onMouseMove.bind(this)
    this.canvas.onmousedown = this.onMouseDown.bind(this)
    this.canvas.onmouseup = this.onMouseUp.bind(this)
    this.canvas.oncontextmenu = this.onContextMenu.bind(this)

    // Draw user interfaces
    this.resetCanvas()

    // Mount components
    parent.appendChild(this.canvas)
  }

  _saveMousePosition(x, y) {
    this.positions.push({x, y})
  }

  _clearMousePositions() {
    this.positions = []
  }

  _getFirstPosition() {
    return this.positions[0]
  }

  _getLastPosition() {
    return this.positions[this.positions.length-1]
  }

  _drawSelection() {
    this.resetCanvas()

    this.context(() => {
      this.ctx.strokeStyle = 'red'

      const {x, y, width: w, height: h} = this._calcSelection()
      this.ctx.strokeRect(x, y, w, h)
    })
  }

  _calcSelection() {
    const startPoint = this._getFirstPosition()
    const endPoint = this._getLastPosition()

    // Calculate each four points of rectangle
    // Top left
    const tl = {
      x: Math.min(startPoint.x, endPoint.x),
      y: Math.min(startPoint.y, endPoint.y)
    }
    // Top right
    const tr = {
      x: Math.max(startPoint.x, endPoint.x),
      y: tl.y
    }
    // Bottom left
    const bl = {
      x: tl.x,
      y: Math.max(startPoint.y, endPoint.y)
    }
    // Bottom right
    const br = {
      x: tr.x,
      y: bl.y
    }
    console.debug(`tl: ${JSON.stringify(tl)}, tr: ${JSON.stringify(tr)}`)
    console.debug(`bl: ${JSON.stringify(bl)}, br: ${JSON.stringify(br)}`)

    const [w, h] = [
      this.unitSize + Math.abs(br.x - bl.x),
      this.unitSize + Math.abs(br.y - tr.y)
    ]
    return {x: tl.x, y: tl.y, width: w, height: h}
  }

  divByUnitSize(value) {
    return Math.floor(value / this.unitSize)
  }

  context(execute) {
    // Use save() and restore() to prevent side effects
    this.ctx.save()
    execute()  // May causes side effects
    this.ctx.restore()  // Recovery
  }

  resetCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawGrid()
    this.drawObjects()
  }

  commitObject() {
    const {x, y, width, height} = this._calcSelection()
    this.objects.push(new Rectangle(x, y, width, height))
  }

  drawObjects() {
    this.context(() => {
      this.ctx.strokeStyle = 'black'
      this.objects.forEach(obj => {
        this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)
        // console.log('Object:', obj)
      })
    })
  }

  drawGrid() {
    this.context(() => {
      this.ctx.strokeStyle = 'darkgrey'
      // Draw horizontal lines
      // TODO: Optimize calculation (e.g. Pattern)
      for (var i = this.unitSize; i < this.canvas.height; i += this.unitSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(0, i)
        this.ctx.lineTo(this.canvas.width, i)
        this.ctx.closePath()
        this.ctx.stroke()
      }
      // Draw vertical lines
      for (var i = this.unitSize; i < this.canvas.width; i += this.unitSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(i, 0)
        this.ctx.lineTo(i, this.canvas.height)
        this.ctx.closePath()
        this.ctx.stroke()
      }
    })
  }

  calcSnappedPosition(x, y) {
    const calcSnap = (p) => {
      return this.divByUnitSize(p) * this.unitSize
    }
    const [snapX, snapY] = [calcSnap(x), calcSnap(y)]
    return {
      x: snapX,
      y: snapY
    }
  }

  onMouseMove(event) {
    const startPoint = this._getFirstPosition()
    if (startPoint) {
      const {clientX, clientY} = event
      const {x: snapX, y: snapY} = this.calcSnappedPosition(clientX, clientY)

      const endPoint = this._getLastPosition()

      // If calculated (snapped) position is same as previous point,
      // do not save current position.
      if (endPoint.x === snapX && endPoint.y === snapY) return

      console.debug(`x: ${snapX}, y: ${snapY}`)

      this._saveMousePosition(snapX, snapY)
      this._drawSelection()
    }
  }

  onMouseDown(event) {
    if (event.button !== 0) return
    console.log('onMouseDown:', event)

    const {clientX, clientY} = event
    const {x: snapX, y: snapY} = this.calcSnappedPosition(clientX, clientY)
    this._saveMousePosition(snapX, snapY)
    this._drawSelection()
  }

  onMouseUp(event) {
    if (event.button !== 0) return
    console.log('onMouseUp:', this.positions)

    this.commitObject()
    this._clearMousePositions()
    this.resetCanvas()
  }

  onContextMenu(event) {
    event.preventDefault()

    this.resetCanvas()
    console.log(event)
  }

  onResize(event) {
    this.canvas.height = window.innerHeight
    this.canvas.width = window.innerWidth

    this.resetCanvas()
  }
}

