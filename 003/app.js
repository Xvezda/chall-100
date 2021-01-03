class App {
  constructor(parent) {
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
  }

  // FIXME: Performance issue
  onPointerMove(event) {
    const brushSize = (() => {
      const defaultSize = 20
      switch (event.pointerType) {
        case 'mouse':
          return defaultSize
        case 'pen':
        default:
          return defaultSize * event.pressure
      }
    })()

    this.ctx.beginPath()
    this.ctx.arc(event.x - brushSize/2, event.y - brushSize/2, brushSize, 0, 2*Math.PI)
    this.ctx.fill()
    this.ctx.closePath()
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }
}


new App(document.body)
