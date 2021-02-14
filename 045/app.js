// Context helper
function context(ctx, exec, err) {
  ctx.save()

  try {
    exec()
  } catch (e) {
    if (err) {
      err(e)
    }
  }
  ctx.restore()
}

// Virtual canvas button
class CanvasButton {
  constructor(canvas, text, x = 0, y = 0) {
    this.text = text

    this.x = x
    this.y = y

    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')

    this.render()

    this.canvas.addEventListener('mousemove',
      this.onMouseMove.bind(this), false)
  }

  render() {
    context(this.ctx, () => {
      this.ctx.clearRect(this.x, this.y, this.width, this.height)

      console.debug(`font: ${this.ctx.font}, parsed: ${parseInt(this.ctx.font)}`)

      // TODO: Modifiable styles
      const [
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight
      ] = [10, 10, 20, 20]

      this.ctx.font = '24px sans-serif'  // FIXME: Remove me
      const fontSize = parseInt(this.ctx.font)
      const metrics = this.ctx.measureText(this.text)

      this.height = paddingTop + fontSize + paddingBottom
      this.width = paddingLeft + metrics.width + paddingRight

      if (this.hover) this.drawHover()
      this.drawBorder()
      // TODO: Split into method
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(this.text,
        this.x + paddingLeft, this.y + paddingTop + fontSize/2)
    })
  }

  drawBorder() {
    this.ctx.strokeRect(this.x, this.y, this.width, this.height)
  }

  drawHover() {
    context(this.ctx, () => {
      this.ctx.fillStyle = 'lightgray'
      this.ctx.fillRect(this.x, this.y, this.width, this.height)
    })
  }

  onMouseMove(event) {
    const {clientX, clientY} = event
    if (this.hitTest(clientX, clientY)) {
      this.hover = true
      return
    }
    this.hover = false
  }

  hitTest(mouseX, mouseY) {
    if (this.x <= mouseX && mouseX <= this.x + this.width
        && this.y <= mouseY && mouseY <= this.y + this.height) {
      return true
    }
    return false
  }

  set hover(value) {
    const changed = (() => {
      if ('_isHover' in this && value !== this._isHover) {
        return true
      }
      return false
    })()

    this._isHover = value

    if (changed) {
      if (value) this.onMouseEnter()
      else this.onMouseLeave()
    }
  }

  get hover() {
    return this._isHover
  }

  set width(value) {
    this._width = value
  }

  get width() {
    return this._width
  }

  set height(value) {
    this._height = value
  }

  get height() {
    return this._height
  }

  onMouseEnter(event) {
    this.canvas.style.cursor = 'pointer'
    this.render()
  }

  onMouseLeave(event) {
    this.canvas.style.cursor = 'default'
    this.render()
  }

  // TODO: Support addEventListener
  set onclick(value) {
    this._onclick = value

    // Add canvas click event listener
    this.canvas.addEventListener('click', this.onClick.bind(this), false)
  }

  onClick(event) {
    if (this.hover) {
      this._onclick(event)
    }
  }
}


class App {
  constructor(parent) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.canvasButton = new CanvasButton(this.canvas, 'test',
      // Place center of canvas
      this.canvas.width / 2, this.canvas.height / 2)

    let counter = 1
    this.canvasButton.onclick = (evt) => {
      console.log(`${counter++}: :)`)
    }

    parent.appendChild(this.canvas)
  }
}

new App(document.body)
