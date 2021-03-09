class App {
  constructor(parent) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false)
    canvas.addEventListener('contextmenu', this.onContextMenu.bind(this), false)

    this.ctx = ctx
    this.canvas = canvas

    this.initState()

    parent.appendChild(canvas)
  }

  initState() {
    this.itemWidth = this.itemHeight = 10
    this.isMouseDown = false
    this.isAnimating = false
    this.paths = []
  }

  onMouseDown(evt) {
    if (this.isAnimating) return

    // Ignore secondary button
    if (evt.button === 2) return

    this.isMouseDown = true
  }

  onMouseMove(evt) {
    if (!this.isMouseDown) return

    if (this.paths.length > 0) {
      const [prevX, prevY] = this.paths[this.paths.length-1]
      this.ctx.clearRect(prevX, prevY, this.itemWidth, this.itemHeight)
    }

    const {layerX, layerY} = evt
    this.paths.push([layerX, layerY])

    this.ctx.fillRect(layerX, layerY, this.itemWidth, this.itemHeight)
  }

  onMouseUp(evt) {
    if (this.isAnimating) return

    this.isMouseDown = false

    // Not enough paths
    if (this.paths.length < 2) return

    const [latestX, latestY] = this.paths[this.paths.length-1]
    const [prevX, prevY] = this.paths[this.paths.length-2]

    console.log('momentum:', latestX - prevX, latestY - prevY)

    const momentum = {x: latestX - prevX, y: latestY - prevY}

    let start = null
    let x = latestX, y = latestY;
    const step = (timestamp) => {
      if (!start) {
        start = timestamp
      } else if (!this.isAnimating) {
        // User canceled animation
        return
      }
      this.isAnimating = true

      this.ctx.clearRect(x, y, this.itemWidth, this.itemHeight)

      x += momentum.x
      y += momentum.y

      if ((x < -this.itemWidth || window.innerWidth + this.itemWidth < x) ||
          (y < -this.itemHeight || window.innerHeight + this.itemHeight < y)) {
        this.initState()
        return
      }

      this.ctx.fillRect(x, y, this.itemWidth, this.itemHeight)
      window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }

  onContextMenu(evt) {
    evt.preventDefault()
    // Cancel animation
    this.isAnimating = false
    this.clearCanvas()
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.initState()
  }
}

window.onload = (evt) => new App(document.body)
