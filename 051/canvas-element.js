import Util from './util.js'
import {CanvasElementStyle} from './common.js'


class AbstractCanvasElement extends EventTarget {
  constructor() {
    super()
  }
}


export default class CanvasElement extends AbstractCanvasElement {
  constructor(props) {
    super()

    /* @protected */
    this.$isHover = false
    this.$isFocus = false

    /* @public */
    this.parent = null
    this.parentContext = null

    // Create offscreen canvas
    this.style = new CanvasElementStyle('div')

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    const {x = 0, y = 0} = props
    this.x = x
    this.y = y

    this.props = props
  }

  appendTo(parent) {
    this.parent = parent
    this.parentContext = this.parent.getContext('2d')

    this.bindedHandlers = {}

    const prefix = 'on'
    const prefixLength = prefix.length

    // Find method names by climbing through parent classes
    let methodNames = []
    let proto = Object.getPrototypeOf(this)
    while (proto.constructor !== AbstractCanvasElement) {
      methodNames = [...methodNames, ...Object.getOwnPropertyNames(proto)]
      proto = Object.getPrototypeOf(proto)
    }

    const handlerNames = methodNames.filter(name => {
      return name.startsWith(prefix) && Util.isUpperCase(name[prefixLength])
    })

    handlerNames.forEach(v => {
      const binded = this[v].bind(this)

      this.parent.addEventListener(
        v.substring(prefixLength).toLowerCase(), binded, false)
      // Save it
      this.bindedHandlers[v] = binded
    })
    this.mount()
  }

  draw() {
    // TODO: Match context style to border
    // this.style.border = `${this.ctx.lineWidth}px solid ${this.ctx.strokeStyle}`

    this.update()
    this.render()
  }

  hide() {
    this.style.visibility = 'hidden'
  }

  show() {
    this.style.visibility = 'visible'
  }

  hitTest(mouseX, mouseY) {
    return (this.x <= mouseX && mouseX <= this.x + this.width
      && this.y <= mouseY && mouseY <= this.y + this.height)
  }

  get isMounted() {
    return this.parent && this.parentContext
  }

  #updateHoverTo(value) {
    this.$isHover = value
  }

  get isHover() {
    return this.isVisible && this.$isHover
  }

  #updateFocusTo(value) {
    const changed = value !== this.$isFocus

    this.$isFocus = value
  }

  get isFocus() {
    return this.isVisible && this.$isFocus
  }

  onUpdate(event) {
    this.draw()
  }

  onMouseMove(event) {
    const {clientX, clientY} = event

    const prevHover = this.isHover
    this.#updateHoverTo(this.hitTest(clientX, clientY))

    if (prevHover !== this.isHover) {
      if (this.isHover) this.onMouseEnter(event)
      else this.onMouseLeave(event)
    }
  }

  onMouseEnter(event) {
    this.render()
  }

  onMouseLeave(event) {
    this.render()
  }

  onMouseDown(event) {
    const {clientX, clientY} = event
    if (this.hitTest(clientX, clientY)) {
      this.#updateFocusTo(true)
    }
    this.render()
  }

  onMouseUp(event) {
    if (this.isHover && this.isFocus) {
      this.dispatchEvent(new Event('click'))
    }
    this.#updateFocusTo(false)
    this.render()
  }

  get isVisible() {
    return (this.isMounted
      && this.style.display !== 'none' && this.style.visibility !== 'hidden')
  }

  get font() {
    return [this.style.fontSize, this.style.fontFamily].join(' ')
  }

  set width(value) {
    this.style.width = value
    this.canvas.width = this.width
  }

  get width() {
    return parseInt(this.style.width)
  }

  set height(value) {
    this.style.height = value
    this.canvas.height = this.height
  }

  get height() {
    return parseInt(this.style.height)
  }

  get x() {
    const x = parseInt(this.style.left)
    return isNaN(x) ? 0 : x
  }

  set x(value) {
    this.style.left = `${value}px`
  }

  get y() {
    const y = parseInt(this.style.top)
    return isNaN(y) ? 0 : y
  }

  set y(value) {
    this.style.top = `${value}px`
  }
}
