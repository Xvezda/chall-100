import Util from './util.js'
import CanvasElement from './canvas-element.js'
import {CanvasElementStyle} from './common.js'


export default class CanvasButtonElement extends CanvasElement {
  constructor(props) {
    super(props)

    /* @public */
    this.style = new CanvasElementStyle('button')

    this.style.fontSize = '24px'
    this.style.fontFamily = 'sans-serif'

    this.style.padding = '10px 20px'

    /* Properties */
    const {text = ''} = props
    this.text = text

    this.style.addEventListener('update', this.onUpdate.bind(this))

    this.draw()
  }

  mount() {
    if (!this.isMounted || !this.isVisible) return

    this.parentContext.clearRect(this.x, this.y, this.width, this.height)
    this.parentContext.drawImage(this.canvas,
      this.x, this.y, this.width, this.height)
  }

  update() {
    Util.contextManager(this.ctx, () => {
      this.ctx.font = this.font
      const metrics = this.ctx.measureText(this.text)

      const sumToPixel = (lengths) => {
        const summed = lengths.map(x => parseInt(x)).reduce((a, b) => a + b, 0)
        console.assert(!isNaN(summed), [summed, lengths])
        return `${summed}px`
      }

      this.height = sumToPixel([
        this.style.paddingTop, this.style.fontSize, this.style.paddingBottom
      ])
      this.width = sumToPixel([
        this.style.paddingLeft, metrics.width, this.style.paddingRight
      ])
    })
  }

  render() {
    Util.contextManager(this.ctx, () => {
      this.ctx.clearRect(0, 0, this.width, this.height)

      if (this.isHover && !this.isFocus) this.drawHover()
      else if (this.isFocus) this.drawFocus()
      this.drawBorder()
      this.drawText()
    })
    this.mount()
  }

  drawBorder() {
    this.ctx.strokeRect(0, 0, this.width, this.height)
  }

  drawText() {
    Util.contextManager(this.ctx, () => {
      this.ctx.font = this.font
      this.ctx.textBaseline = 'middle'

      const x = Math.floor(parseInt(this.style.paddingLeft))
      const y = Math.floor(
        parseInt(this.style.paddingTop) + parseInt(this.style.fontSize)/2
      )

      this.ctx.fillStyle = this.style.color ?? 'black'
      this.ctx.fillText(this.text, x, y)
    })
  }

  drawHover() {
    Util.contextManager(this.ctx, () => {
      this.ctx.fillStyle = 'lightgray'
      this.ctx.fillRect(0, 0, this.width, this.height)
    })
  }

  drawFocus() {
    Util.contextManager(this.ctx, () => {
      this.ctx.fillStyle = 'darkgray'
      this.ctx.fillRect(0, 0, this.width, this.height)
    })
  }
}


