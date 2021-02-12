class App {
  constructor(parent) {
    this.container = document.createElement('div')
    this.container.style.display = 'flex'
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'
    this.container.style.justifyContent = 'center'
    this.container.style.alignItems = 'center'

    this.subcontainer = document.createElement('div')
    this.canvas = document.createElement('canvas')
    this.canvas.width = 800
    this.canvas.height = 600
    this.canvas.style.display = 'block'
    this.canvas.style.background = 'white'
    this.canvas.style.border = '1px solid lightgray'
    this.canvas.style.marginBottom = '10px'

    this.ctx = this.canvas.getContext('2d')

    this.subcontainer.appendChild(this.canvas)

    this.input = document.createElement('input')
    this.input.type = 'file'
    this.input.onchange = this.onChange.bind(this)
    this.subcontainer.appendChild(this.input)

    this.container.appendChild(this.subcontainer)
    parent.appendChild(this.container)
  }

  onChange(event) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const files = event.target.files
    const img = new Image()
    img.onload = () => {
      const {naturalWidth, naturalHeight} = img
      const {width, height} = (() => {
        let ratio = 1
        let [width, height] = [naturalWidth, naturalHeight]
        while (width > this.canvas.width || height > this.canvas.height) {
          if (width * ratio > this.canvas.width) ratio = this.canvas.width / width
          if (height * ratio > this.canvas.height) ratio = this.canvas.height / height
          width *= ratio
          height *= ratio
        }
        return {width, height}
      })()
      const [dx, dy, dWidth, dHeight] = [
        this.canvas.width/2 - width/2, this.canvas.height/2 - height/2,
        width, height
      ]
      this.ctx.drawImage(img,
        0, 0, naturalWidth, naturalHeight,
        dx, dy, dWidth, dHeight)

      const rgbs = []
      for (let i = 0; i < dHeight; ++i) {
        for (let j = 0; j < dWidth; ++j) {
          const pixel = this.ctx.getImageData(dx + j, dy + i, 1, 1)
          const {data} = pixel
          const rgb = (data[0] << 16) | (data[1] << 8) | data[2]

          if (rgb === 0xffffff || rgb === 0x000000) continue

          rgbs.push(rgb)
        }
      }
      const sum = rgbs.reduce((a, b) => a + b)
      const average = Math.floor(sum / rgbs.length).toString(16)

      console.log(`average: ${average}`)
      document.body.style.background = `#${average}`
    }
    img.src = URL.createObjectURL(files[0])
  }
}

new App(document.body)
