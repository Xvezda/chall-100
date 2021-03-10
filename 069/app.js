class Box {
  constructor(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }
}


class App {
  constructor(parent) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    this.canvas = canvas
    this.ctx = ctx

    parent.appendChild(canvas)

    this.onResize()
    window.addEventListener('resize', this.onResize.bind(this), false)

    canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false)
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false)

    this.gravity = 0
    this.isMouseDown = false

    setInterval(() => {
      this.gravity += 1
    }, 100)

    this.box = new Box(
      Math.floor(this.canvas.width/2), Math.floor(this.canvas.height/2),
      10, 10)
    this.releaseBox()
  }

  releaseBox() {
    this.animationId = window.requestAnimationFrame(this.nextFrame.bind(this))
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  onMouseDown(event) {
    this.isMouseDown = true

    // Trigger move handler
    this.onMouseMove(event)
  }

  onMouseUp(event) {
    this.isMouseDown = false
    this.gravity = 0

    this.releaseBox()
  }

  onMouseMove(event) {
    if (!this.isMouseDown) return
    window.cancelAnimationFrame(this.animationId)

    this.ctx.clearRect(this.box.x, this.box.y, this.box.w, this.box.h)

    this.box.x = event.layerX
    this.box.y = event.layerY

    this.ctx.fillRect(this.box.x, this.box.y, this.box.w, this.box.h)
  }

  nextFrame(timestamp) {
    this.ctx.clearRect(this.box.x, this.box.y, this.box.w, this.box.h)

    this.box.y += this.gravity
    if (this.box.y + this.box.h >= this.canvas.height) {
      this.box.y = this.canvas.height - this.box.h
    }
    this.ctx.fillRect(this.box.x, this.box.y, this.box.w, this.box.h)

    this.animationId = window.requestAnimationFrame(this.nextFrame.bind(this))
  }
}


new App(document.body)
