const DEBUG = 1

class App {
  constructor(parent) {
    parent.style.background = 'grey'

    this.unitSize = 20

    // Create components
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    // Bind event listeners
    this.onResize()
    window.onresize = this.onResize.bind(this)

    this.canvas.onmousemove = this.onMouseMove.bind(this)
    this.canvas.onmousedown = this.onMouseDown.bind(this)
    this.canvas.onmouseup = this.onMouseUp.bind(this)

    // Draw user interfaces
    this.resetCanvas()

    // Mount components
    parent.appendChild(this.canvas)
  }

  resetCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawGrid()
  }

  drawGrid() {
    this.ctx.save()
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
    this.ctx.restore()
  }

  calcSnappedPosition(x, y) {
    const [snapX, snapY] = [
      Math.floor(x / this.unitSize) * this.unitSize,
      Math.floor(y / this.unitSize) * this.unitSize,
    ]
    return {
      x: snapX,
      y: snapY
    }
  }

  onMouseMove(event) {
    // console.debug(event)
    if ('startPoint' in this && !!this.startPoint) {
      const {x, y} = event

      const {x: snapX, y: snapY} = this.calcSnappedPosition(x, y)

      if ('endPoint' in this && !!this.endPoint
          && this.endPoint.x === snapX && this.endPoint.y === snapY) {
        return
      }
      console.debug(`x: ${snapX}, y: ${snapY}`)

      this.endPoint = {
        x: snapX,
        y: snapY
      }

      this.resetCanvas()

      this.ctx.save()
      this.ctx.strokeStyle = 'red'

      // Calculate each four points of rectangle
      // TODO: Can be optimize calculation by referencing duplicated values
      const [tl, tr, bl, br] = [
        // Top left
        {
          x: Math.min(this.startPoint.x, this.endPoint.x),
          y: Math.min(this.startPoint.y, this.endPoint.y)
        },
        // Top right
        {
          x: Math.max(this.startPoint.x, this.endPoint.x),
          y: Math.min(this.startPoint.y, this.endPoint.y)
        },
        // Bottom left
        {
          x: Math.min(this.startPoint.x, this.endPoint.x),
          y: Math.max(this.startPoint.y, this.endPoint.y)
        },
        // Bottom right
        {
          x: Math.max(this.startPoint.x, this.endPoint.x),
          y: Math.max(this.startPoint.y, this.endPoint.y)
        }
      ]
      console.debug(`tl: ${JSON.stringify(tl)}, tr: ${JSON.stringify(tr)}`)
      console.debug(`bl: ${JSON.stringify(bl)}, br: ${JSON.stringify(br)}`)

      const [w, h] = [
        br.x - bl.x + this.unitSize,
        br.y - tr.y + this.unitSize
      ]
      this.ctx.strokeRect(tl.x, tl.y, w, h)

      this.ctx.restore()
    }
  }

  onMouseDown(event) {
    // TODO: Refactoring *DRY*
    this.resetCanvas()

    const {x, y} = event

    this.ctx.save()
    this.ctx.strokeStyle = 'red'

    const {x: snapX, y: snapY} = this.calcSnappedPosition(x, y)
    console.debug(`x: ${snapX}, y: ${snapY}`)

    this.startPoint = {
      x: snapX,
      y: snapY
    }

    this.ctx.strokeRect(snapX, snapY, this.unitSize, this.unitSize)
    this.ctx.restore()
  }

  onMouseUp(event) {
    this.startPoint = undefined
    this.endPoint = undefined
  }

  onResize(event) {
    this.canvas.height = window.innerHeight
    this.canvas.width = window.innerWidth
  }
}

new App(document.body)
