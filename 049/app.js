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

    const preventDragDrop = (evt) => (evt.preventDefault())
    this.container.ondragover = preventDragDrop
    this.container.ondrop = preventDragDrop

    this.canvas = document.createElement('canvas')
    this.canvas.width = 800
    this.canvas.height = 600
    this.canvas.style.display = 'block'
    this.canvas.style.border = '1px solid lightgray'

    this.canvas.addEventListener('dragenter', this.onDragEnter.bind(this), false)
    this.canvas.addEventListener('dragover', this.onDragOver.bind(this), false)
    this.canvas.addEventListener('drop', this.onDrop.bind(this), false)
    this.canvas.addEventListener('dragleave', this.onDragLeave.bind(this), false)

    this.ctx = this.canvas.getContext('2d')

    this.container.appendChild(this.canvas)

    this.controlContainer = document.createElement('div')
    this.controlContainer.style.display = 'flex'
    this.controlContainer.style.columnGap = '50px'

    this.fileInput = document.createElement('input')
    this.fileInput.type = 'file'
    this.fileInput.onchange = this.onFileChange.bind(this)
    this.controlContainer.appendChild(this.fileInput)

    this.rangeInput = document.createElement('input')
    this.rangeInput.type = 'range'
    this.rangeInput.min = 1
    this.rangeInput.max = 100
    this.rangeInput.value = 1

    this.controlContainer.appendChild(this.rangeInput)

    this.rangelabel = document.createElement('label')
    const updateLabel = (evt) => {
      this.rangelabel.textContent =
        `value: ${evt?.target?.value ?? this.rangeInput.value}`
    }
    this.rangeInput.oninput = updateLabel
    updateLabel()

    this.rangeInput.addEventListener('input', this.onSliderMove.bind(this), false)

    this.controlContainer.appendChild(this.rangelabel)
    this.container.appendChild(this.controlContainer)

    parent.appendChild(this.container)
  }

  onDragEnter(event) {
    console.log('dragenter:', event)
    this.backupCanvas = document.createElement('canvas')
    this.backupCanvas.width = this.canvas.width
    this.backupCanvas.height = this.canvas.height

    const backupCtx = this.backupCanvas.getContext('2d')
    backupCtx.drawImage(this.canvas, 0, 0)

    this.ctx.save()
    this.ctx.fillStyle = 'rgba(0, 0, 0, .35)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const message = 'Drop image'
    const fontSize = 64

    this.ctx.fillStyle = 'white'
    this.ctx.font = `${fontSize}px sans`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    this.ctx.fillText(message,
      Math.floor(this.canvas.width/2),
      Math.floor(this.canvas.height/2))

    this.ctx.restore()
  }

  onDragOver(event) {
    event.preventDefault()
  }

  onDrop(event) {
    console.log('drop:', event)
    event.preventDefault()

    this.endDragDrop()

    const files = event.dataTransfer.files
    this.fileInput.files = files
    this.loadImage(files[0])
  }

  onDragLeave(event) {
    console.log('dragleave:', event)

    this.endDragDrop()
  }

  endDragDrop() {
    this.clearCanvas()
    this.ctx.drawImage(this.backupCanvas, 0, 0)
  }

  onFileChange(event) {
    console.log(event)
    const files = event.target.files
    this.loadImage(files[0])
  }

  loadImage(file) {
    this.loadedImage = new Image()
    this.loadedImage.onload = this.drawImage.bind(this)
    this.loadedImage.src = URL.createObjectURL(file)
  }

  onSliderMove(event) {
    const debounce = 300

    clearTimeout(this?.sliderTimeout)

    this.sliderTimeout = setTimeout(() => {
      this.drawImage()
    }, debounce)
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawImage() {
    const img = this.loadedImage

    if (!img) return

    this?.worker?.terminate()
    this.worker = new Worker('worker.js')

    const {naturalWidth: width, naturalHeight: height} = img
    const [imgX, imgY] = [
      this.canvas.width/2 - width/2,
      this.canvas.height/2 - height/2
    ].map(v => Math.floor(v))

    const drawImageAtCenter = (img) => {
      this.ctx.drawImage(img, imgX, imgY)
    }

    const imageCanvas = document.createElement('canvas')
    imageCanvas.width = width
    imageCanvas.height = height

    const imageContext = imageCanvas.getContext('2d')
    imageContext.drawImage(img, 0, 0)

    this.worker.onmessage = (evt) => {
      console.log('from worker:', evt)
      const {rgbs, pixelSize} = evt.data
      const mosaicCanvas = document.createElement('canvas')
      mosaicCanvas.width = width
      mosaicCanvas.height = height

      const mosaicContext = mosaicCanvas.getContext('2d')

      let i = 0
      for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
          const [r, g, b] = rgbs[i++]
          mosaicContext.fillStyle = `rgb(${r}, ${g}, ${b})`
          mosaicContext.fillRect(x, y, pixelSize, pixelSize)
        }
      }
      this.clearCanvas()
      drawImageAtCenter(mosaicCanvas)
    }
    const pixelSize = parseInt(this.rangeInput.value)

    if (pixelSize === 1) {
      this.clearCanvas()
      drawImageAtCenter(imageCanvas)
      return
    }

    this.worker.postMessage({
      imageData: imageContext.getImageData(0, 0, width, height),
      pixelSize,
    })
  }
}

new App(document.body)
