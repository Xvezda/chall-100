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
  constructor(type, opts) {
    // Event dispatchable
    this.$listeners = {}

    // Use original element to programmatically generate setters and getters
    this.virtualElement = document.createElement(type)
    // Alias to style
    const vStyle = this.virtualElement.style

    const toHypenCase = (name) => {
      return name.replace(/(.)([A-Z])/g, (match, p1, p2) => {
        return [p1, '-', p2.toLowerCase()].join('')
      })
    }

    const defaultGetter = (obj, name) => {
      const value = obj.getPropertyValue(name)
      console.assert(name !== undefined)
      return value
    }

    const defaultSetter = (obj, name, value) => {
      console.assert(name !== undefined && value !== undefined)
      obj.setProperty(name, value)
    }

    const getter = opts?.get ?? defaultGetter
    const getterWrapper = name => {
      return () => {
        return getter(vStyle, toHypenCase(name))
      }
    }

    const setter = opts?.set ?? defaultSetter
    const setterWrapper = name => {
      return (value) => {
        const hypenName = toHypenCase(name)
        const prev = getter(vStyle, hypenName)

        setter(vStyle, hypenName, value)

        if (prev !== value) {
          const evt = new CustomEvent('update', {
            detail: {
              name,
              hypenName,
              newValue: value,
              oldValue: prev,
            }
          })
          this.dispatchEvent(evt)
        }
      }
    }

    const props = {}
    const styleNames = Object.getOwnPropertyNames(vStyle)
    styleNames.forEach(name => {
      props[name] = {
        get: getterWrapper(name),
        set: setterWrapper(name),
      }
    })
    Object.defineProperties(this, props)
  }

  /**
   * EventTarget interfaces
   **/
  addEventListener(type, listener /*, useCapture | option */) {
    // TODO: Support useCapture or option
    if (!this.$listeners[type]) {
      this.$listeners[type] = []
    }

    this.$listeners[type].push(listener)
  }

  removeEventListener() {
    throw new Error('Not implemented')
  }

  dispatchEvent(event) {
    this.$listeners[event.type]?.forEach(listener => {
      listener.call(this, event)
    })
  }
  /* End of EventTarget interfaces */
}

// Virtual canvas button
class CanvasButton {
  constructor(text, x = 0, y = 0) {
    // TODO: Use dedicated canvas for element to pre-caculate styles.
    // Also, separate mounting point (parent)
    this.canvas = null

    this.$isHover = false
    this.$isFocus = false

    this.text = text

    this.style = new CanvasElementStyle('button')

    this.style.fontSize = '24px'
    this.style.fontFamily = 'sans-serif'

    this.style.padding = '10px 20px'

    this.x = x
    this.y = y

    this.style.addEventListener('update', this.onUpdate.bind(this))
  }

  appendTo(parent) {
    this.canvas = parent

    this.#mount()
  }

  #mount() {
    this.ctx = this.canvas.getContext('2d')
    console.debug('ctx:', this.ctx)

    // TODO: Match context style to border
    // this.style.border = `${this.ctx.lineWidth}px solid ${this.ctx.strokeStyle}`

    this.bindedHandlers = {}
    const isUpperCase = c => /[A-Z]/.test(c)

    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
    const handlerNames = methodNames.filter(name => {
      return name.startsWith('on') && isUpperCase(name[2])
    })

    handlerNames.forEach(v => {
      const binded = this[v].bind(this)

      this.canvas.addEventListener(
        v.substring('on'.length).toLowerCase(), binded, false)
      // Save it
      this.bindedHandlers[v] = binded
    })
    this.update()
    this.render()
  }

  render() {
    if (!this.ctx || this.style.display === 'none') return

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
    return [this.style.fontSize, this.style.fontFamily].join(' ')
  }

  drawText() {
    context(this.ctx, () => {
      this.ctx.font = this.font
      this.ctx.textBaseline = 'middle'

      const x = this.x + parseInt(this.style.paddingLeft)
      const y = (this.y +
        parseInt(this.style.paddingTop) + parseInt(this.style.fontSize)/2)

      this.ctx.fillText(this.text, x, y)
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

  get x() {
    return parseInt(this.style.left)
  }

  set x(value) {
    this.style.left = `${value}px`
  }

  get y() {
    return parseInt(this.style.top)
  }

  set y(value) {
    this.style.top = `${value}px`
  }

  hitTest(mouseX, mouseY) {
    const isHit = (this.x <= mouseX && mouseX <= this.x + this.width
      && this.y <= mouseY && mouseY <= this.y + this.height)
    if (isHit && !this.isHover) {
      this.#updateHover(true)
    }
    return isHit
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

  onUpdate(event) {
    this.update()
    this.render()
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

  update() {
    if (!this.ctx) return

    context(this.ctx, () => {
      this.ctx.font = this.font
      const metrics = this.ctx.measureText(this.text)

      const sumToPixel = (lengths) => {
        // console.debug('sumToPixel:', lengths)
        const summed = lengths.map(x => parseInt(x)).reduce((a, b) => a + b)
        console.assert(!isNaN(summed), [summed, lengths])
        return `${summed}px`
      }

      // Synchronize to style
      this.style.height = sumToPixel([
        this.style.paddingTop, this.style.fontSize, this.style.paddingBottom
      ])
      this.style.width = sumToPixel([
        this.style.paddingLeft, metrics.width, this.style.paddingRight
      ])
    })
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

    this.canvasButton = new CanvasButton('test')

    let counter = 1
    this.canvasButton.onclick = (evt) => {
      console.log(`${counter++}: :)`)
    }
    // Prevent FOUC
    this.canvasButton.style.display = 'none'

    this.canvasButton.appendTo(this.canvas)

    // Place center of canvas
    this.canvasButton.x = Math.floor(
      this.canvas.width/2 - parseInt(this.canvasButton.style.width)/2
    )
    this.canvasButton.y = Math.floor(
      this.canvas.height/2 - parseInt(this.canvasButton.style.height)/2
    )
    this.canvasButton.style.display = 'block'

    parent.appendChild(this.canvas)
  }
}

new App(document.body)
