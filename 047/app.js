class App {
  constructor(parent) {
    this.container = document.createElement('div')
    this.container.style.display = 'flex'
    this.container.style.flexDirection = 'column'
    this.container.style.gridGap = '10px'
    this.container.style.justifyContent = 'center'
    this.container.style.alignItems = 'center'
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'

    this.canvas = document.createElement('canvas')
    this.canvas.width = 800
    this.canvas.height = 600
    this.canvas.style.display = 'block'
    this.canvas.style.border = '1px solid lightgray'

    this.ctx = this.canvas.getContext('2d')

    this.container.appendChild(this.canvas)

    this.controlContainer = document.createElement('div')
    this.controlContainer.style.display = 'flex'
    this.controlContainer.style.columnGap = '50px'

    this.fileinput = document.createElement('input')
    this.fileinput.type = 'file'
    this.fileinput.onchange = this.onFileChange.bind(this)
    this.controlContainer.appendChild(this.fileinput)

    this.rangeinput = document.createElement('input')
    this.rangeinput.type = 'range'
    this.rangeinput.min = 3
    this.rangeinput.max = 100
    this.rangeinput.value = 5

    this.controlContainer.appendChild(this.rangeinput)

    this.rangelabel = document.createElement('label')
    const updateLabel = (evt) => {
      this.rangelabel.textContent =
        `value: ${evt?.target?.value ?? this.rangeinput.value}`
    }
    this.rangeinput.oninput = updateLabel
    updateLabel()

    this.rangeinput.addEventListener('input', this.onSliderMove.bind(this), false)

    this.controlContainer.appendChild(this.rangelabel)
    this.container.appendChild(this.controlContainer)

    parent.appendChild(this.container)
  }

  onFileChange(event) {
    console.log(event)
    const file = event.target.files[0]
    this.loadedImage = new Image()
    this.loadedImage.onload = this.drawImage.bind(this)
    this.loadedImage.src = URL.createObjectURL(file)
  }

  onSliderMove(event) {
    this.drawImage()
  }

  drawImage() {
    const img = this.loadedImage

    if (!img) return

    const {naturalWidth: width, naturalHeight: height} = img
    const [imgX, imgY] = [
      this.canvas.width/2 - width/2,
      this.canvas.height/2 - height/2
    ].map(v => Math.floor(v))

    this.ctx.drawImage(img, imgX, imgY)

    const pixelSize = parseInt(this.rangeinput.value)

    const mosaicCanvas = document.createElement('canvas')
    mosaicCanvas.width = width
    mosaicCanvas.height = height

    const context = mosaicCanvas.getContext('2d')

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        const pixel = this.ctx.getImageData(imgX + x, imgY + y, 1, 1)
        const [r, g, b, _] = pixel.data
        const rgb = ((r << 16) | (g << 8) | b).toString(16)

        console.log(`x: ${x}, y: ${y} -> #${rgb}`)
        context.fillStyle = `#${rgb}`
        context.fillRect(x, y, pixelSize, pixelSize)
      }
    }
    this.ctx.drawImage(mosaicCanvas, imgX, imgY)
  }
}

new App(document.body)
