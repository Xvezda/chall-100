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

class CanvasElementStyle {
  #properties

  constructor() {
    this.#properties = {}
    // TODO: Define more properties
    this.defineCssProperty('width')
    this.defineCssProperty('height')

    !['top', 'left', 'right', 'bottom'].forEach(v => {
      const suffix = v[0].toUpperCase().concat(v.slice(1))
      this.defineCssProperty(`padding${suffix}`)
      this.defineCssProperty(`margin${suffix}`)
    })
  }

  defineCssProperty(name) {
    const getter = () => {
      return this.#properties[name]
    }
    const setter = (value) => {
      this.#properties[name] = isNaN(value) ? value : `${value}px`
    }
    this.defineProperty(name, { get: getter, set: setter })
  }

  defineProperty(prop, desc) {
    Object.defineProperty(this, prop, desc)
  }
}

// Virtual canvas button
class CanvasButton {
  constructor(text, x = 0, y = 0) {
    this.$isHover = false
    this.$isFocus = false

    this.text = text

    this.x = x
    this.y = y

    this.style = new CanvasElementStyle()
    this.style.font = '24px'
    this.style.fontFamily = 'sans-serif'

    this.style.paddingTop = 10
    this.style.paddingLeft = 20
    this.style.paddingRight = 20
    this.style.paddingBottom = 10
  }

  appendTo(parent) {
    this.canvas = parent

    this.#mount()
  }

  #mount() {
    this.ctx = this.canvas.getContext('2d')

    context(this.ctx, () => {
      this.ctx.font = this.font
      const metrics = this.ctx.measureText(this.text)

      const sumToPixel = (lengths) => {
        return `${lengths.map(x => parseInt(x)).reduce((a, b) => a + b)}px`
      }

      this.style.height = sumToPixel([
        this.style.paddingTop, this.style.font, this.style.paddingBottom
      ])
      this.style.width = sumToPixel([
        this.style.paddingLeft, metrics.width, this.style.paddingRight
      ])

    })
    this.render()

    this.bindedHandlers = {}
    const isUpperCase = c => /[A-Z]/.test(c)

    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
    const handlerNames = methodNames.filter(name => {
      return name.startsWith('on') && isUpperCase(name[2])
    })

    handlerNames.forEach(v => {
      const binded = this[v].bind(this)

      this.canvas.addEventListener(
        v.slice('on'.length).toLowerCase(), binded, false)
      // Save it
      this.bindedHandlers[v] = binded
    })
  }

  render() {
    context(this.ctx, () => {
      this.ctx.clearRect(this.x, this.y, this.width, this.height)

      // FIXME: Mouse out-in works, but in-out does not.
      if (this.isHover && !this.isFocus) this.drawHover()
      else if (this.isFocus) this.drawFocus()
      this.drawBorder()
      this.drawText()
    })
  }

  drawBorder() {
    this.ctx.strokeRect(this.x, this.y, this.width, this.height)
  }

  get font() {
    return [this.style.font, this.style.fontFamily].join(' ')
  }

  drawText() {
    context(this.ctx, () => {
      this.ctx.font = this.font
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(this.text,
        this.x + parseInt(this.style.paddingLeft),
        this.y + parseInt(this.style.paddingTop) + parseInt(this.style.font)/2)
    })
  }

  drawHover() {
    context(this.ctx, () => {
      this.ctx.fillStyle = 'lightgray'
      this.ctx.fillRect(this.x, this.y, this.width, this.height)
    })
  }

  drawFocus() {
    context(this.ctx, () => {
      this.ctx.fillStyle = 'darkgray'
      this.ctx.fillRect(this.x, this.y, this.width, this.height)
    })
  }

  onMouseMove(event) {
    const {clientX, clientY} = event
    this.#updateHover(this.hitTest(clientX, clientY))
  }

  hitTest(mouseX, mouseY) {
    return (this.x <= mouseX && mouseX <= this.x + this.width
      && this.y <= mouseY && mouseY <= this.y + this.height)
  }

  #updateHover(value) {
    const changed = value !== this.$isHover

    this.$isHover = value

    if (changed) {
      if (value) this.onMouseEnter()
      else this.onMouseLeave()
    }
  }

  get isHover() {
    return this.$isHover
  }

  #updateFocus(value) {
    const changed = value !== this.$isFocus

    this.$isFocus = value
  }

  get isFocus() {
    return this.$isFocus
  }

  set width(value) {
    this.style.width = value
  }

  get width() {
    return parseInt(this.style.width)
  }

  set height(value) {
    this.style.height = value
  }

  get height() {
    return parseInt(this.style.height)
  }

  onMouseEnter(event) {
    this.canvas.style.cursor = 'pointer'
    this.render()
  }

  onMouseLeave(event) {
    this.canvas.style.cursor = 'default'
    this.render()
  }

  onMouseDown(event) {
    const {clientX, clientY} = event
    if (this.hitTest(clientX, clientY)) {
      this.#updateFocus(true)
    }
    this.render()
  }

  onMouseUp(event) {
    this.#updateFocus(false)
    this.render()
  }

  // TODO: Support addEventListener
  set onclick(value) {
    this.$onclick = value
  }

  onClick(event) {
    if (this.isHover) {
      this.$onclick(event)
    }
  }
}


class App {
  constructor(parent) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.canvasButton = new CanvasButton('test',
      // Place center of canvas
      this.canvas.width / 2, this.canvas.height / 2)

    let counter = 1
    this.canvasButton.onclick = (evt) => {
      console.log(`${counter++}: :)`)
    }
    // console.debug(this.canvasButton.style.paddingTop)
    this.canvasButton.appendTo(this.canvas)

    parent.appendChild(this.canvas)
  }
}

new App(document.body)
