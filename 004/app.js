class App {
  #layers = []

  constructor(parent) {
    this.container = document.createElement('div')
    this.container.style.display = 'flex'
    this.container.style.padding = '15px'

    const options = {
      ui: {
        height: 500,
        width: 800,
        borderColor: `gray`,
        borderWidth: 1,
        menuWidth: 150,
        buttonHeight: 30
      }
    }
    this.options = options

    // Items
    this.layers = new Proxy(this.#layers, {
      get: this.onGetLayer.bind(this),
      set: this.onSetLayer.bind(this)
    })
    this.buttons = []

    const borderStyle =
      `${options.ui.borderWidth}px solid ${options.ui.borderColor}`

    this.canvas = document.createElement('canvas')
    this.canvas.width = options.ui.width - options.ui.menuWidth
    this.canvas.height = options.ui.height
    this.canvas.style.border = borderStyle

    this.ctx = this.canvas.getContext('2d')

    this.menu = document.createElement('div')
    this.menu.style.width = `${options.ui.menuWidth}px`
    this.menu.style.height = `${options.ui.height}px`
    this.menu.style.border = borderStyle
    this.menu.style.borderLeft = '0'

    this.buttonsContainer = document.createElement('div')
    this.buttonsContainer.style.display = 'flex'
    this.buttonsContainer.style.height = `${options.ui.buttonHeight}px`
    this.buttonsContainer.style.borderBottom = borderStyle
    this.menu.appendChild(this.buttonsContainer)

    const applyButtonStyles = (button) => {
      button.style.flexGrow = '1'
    }
    this.addLayerButton = document.createElement('button')
    this.addLayerButton.textContent = '+'
    this.addLayerButton.onclick = this.onClickAddLayer.bind(this)
    this.buttons.push(this.addLayerButton)

    /*
    this.delLayerButton = document.createElement('button')
    this.delLayerButton.textContent = '-'
    this.delLayerButton.onclick = this.onClickDelLayer.bind(this)
    this.buttons.push(this.delLayerButton)
    */

    this.buttons.forEach(b => {
      applyButtonStyles(b)
      this.buttonsContainer.appendChild(b)
    })

    this.layersContainer = document.createElement('div')
    this.layersContainer.style.block = 'flex'
    this.layersContainer.style.flexDirection = 'column'
    this.layersContainer.style.height =
      `${options.ui.height - options.ui.buttonHeight}px`
    this.layersContainer.style.overflowY = 'auto'

    this.menu.appendChild(this.layersContainer)

    this.container.appendChild(this.canvas)
    this.container.appendChild(this.menu)

    parent.appendChild(this.container)
  }

  onClickAddLayer(event) {
    console.log('add layer clicked')
    const newLayer = document.createElement('canvas')
    newLayer.width = this.canvas.width
    newLayer.height = this.canvas.height
    newLayer.style.width = '100%'
    newLayer.style.height = 'auto'
    newLayer.style.borderBottom = '1px solid lightgray'

    const ctx = newLayer.getContext('2d')

    const [r, g, b] = [0, 0, 0].map(_ => Math.floor(Math.random() * 256))
    console.log(r, g, b)

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

    const [w, h] = [0, 0].map(_ => Math.floor(Math.random() * 291 + 10))
    const [x, y] = [w, h].map(v => {
      const shortest = Math.min(
        this.options.ui.width - this.options.ui.menuWidth,
        this.options.ui.height
      )
      return Math.floor(Math.random() * (shortest - v))
    })

    ctx.fillRect(x, y, w, h)
    this.layers.push(newLayer)
  }

  onClickDelLayer(event) {
    console.log('del layer clicked')
  }

  onSetLayer(object, property, value) {
    // console.log('onSetLayers:', object, property, value)

    if (!/\d/.test(property)) return true

    // Update value
    this.#layers[property] = value

    this.layersContainer.childNodes.forEach(child => {
      this.layersContainer.removeChild(child)
    })
    this.#layers.reverse().forEach(layer => {
      this.layersContainer.appendChild(layer)
    })

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.#layers.reverse().forEach(layer => {
      this.ctx.drawImage(layer, 0, 0)
    })

    return true
  }

  onGetLayer(target, property, receiver) {
    // console.log('onGetLayers:', target, property, receiver)
    return this.#layers[property]
  }
}


new App(document.body)
