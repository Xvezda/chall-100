const DURATION = 5 /* In seconds */
const SECOND = 1000 /* In milliseconds */

class App {
  constructor(parent) {
    this.parent = parent

    this.onLoad()
  }

  onLoad() {
    console.log('load')

    // Paths of mouse records
    this.records = []

    // Setup cursor
    this.cursorCanvas = document.createElement('canvas')
    this.cursorWidth = 50
    this.cursorHeight = 70

    // Draw cursor
    const ctx = this.cursorCanvas.getContext('2d')
    // ctx.translate(10, 10)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(this.cursorWidth, 50)
    ctx.lineTo(25, 50)
    ctx.lineTo(40, this.cursorHeight)
    ctx.lineTo(30, this.cursorHeight)
    ctx.lineTo(15, 50)
    ctx.lineTo(0, 60)
    ctx.lineTo(0, 0)
    ctx.fill()

    // Setup canvas
    this.canvas = document.createElement('canvas')
    this.canvas.width = 500
    this.canvas.height = this.canvas.width
    this.canvas.style.border = '1px solid gray'
    this.canvas.style.margin = '15px'

    this.ctx = this.canvas.getContext('2d')

    // Draw start screen
    this.ctx.fillStyle = 'lightgray'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.fillStyle = 'black'
    this.fontSize = 32
    this.ctx.font = `${this.fontSize}px sans-serif`

    const msg = 'Click to record'
    const text = this.ctx.measureText(msg)

    this.ctx.fillText(msg,
      this.canvas.width/2 - text.width/2,
      this.canvas.height/2 - this.fontSize/2)

    this.canvas.onclick = this.onStart.bind(this)

    this.parent.appendChild(this.canvas)
  }

  onStart() {
    console.log('start')
    this.canvas.onclick = null

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.canvas.onmousemove = (event) => {
      // console.log(App.getMousePosition(this.canvas, event))
      const {x, y} = App.getMousePosition(this.canvas, event)
      if (this.records.length > 0) {
        const {x: prevX, y: prevY} = this.records[this.records.length-1]
        // Pass if current position same as previous
        if (x === prevX && y === prevY) return
      }
      // console.log(x, y)
      this.records.push({x, y, timestamp: Date.now()})
    }

    // Record for `DURATION` seconds
    setTimeout(() => {
      // Finish record
      this.canvas.onmousemove = null

      this.onPlay()
    }, DURATION*SECOND)
  }

  onPlay() {
    const startTime = Date.now()
    console.log('play:', startTime)

    const firstRecord = this.records.shift()
    this.previousRecord = {x: firstRecord.x, y: firstRecord.y}

    const fps = 60
    console.log(this.records)

    const getRenderedCursorSize = () => {
      const scale = 0.25
      return {
        w: this.cursorWidth * scale,
        h: this.cursorHeight * scale
      }
    }

    const drawCursor = (x, y) => {
      const {w, h} = getRenderedCursorSize()
      this.ctx.drawImage(this.cursorCanvas,
        0, 0, this.cursorWidth, this.cursorHeight,
        x, y, w, h)
    }
    drawCursor(firstRecord.x, firstRecord.y)

    // Start replay
    this.animaterId = setInterval(() => {
      const passed = Date.now() - startTime
      let record
      for (record = this.records.shift();
        record && record.timestamp < firstRecord.timestamp + passed;
        record = this.records.shift());
      if (!record) return this.onEnd()

      // Remove previous cursor
      const {x, y} = this.previousRecord
      const {w, h} = getRenderedCursorSize()
      this.ctx.clearRect(x, y, w, h)

      this.previousRecord = {x: record.x, y: record.y}
      drawCursor(record.x, record.y)
    }, SECOND/fps)

    this.timeoutId = setTimeout(() => {
      this.onEnd()
    }, DURATION*SECOND)
  }

  onEnd() {
    clearInterval(this.animaterId)
    this.animatorId = null
    clearTimeout(this.timeoutId)
    this.timeoutId = null

    const endTime = Date.now()
    console.log('end:', endTime)

    this.canvas.onclick = (event) => {
      this.parent.removeChild(this.canvas)
      this.onLoad()
    }
  }

  // https://stackoverflow.com/a/17130415
  static getMousePosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
}

new App(document.body)
