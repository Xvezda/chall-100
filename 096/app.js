class App {
  constructor(parent) {
    this.elems = []

    this.canvas = document.createElement('canvas')
    this.setFullSize(this.canvas)
    this.ctx = this.canvas.getContext('2d')

    this.ctx.font = `1.5rem sans-serif`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    this.fileBtn = document.createElement('input')
    this.fileBtn.type = 'file'

    this.fileBtn.addEventListener('change', this.onFileChange.bind(this), false)

    this.canvas.addEventListener('click', this.onClick.bind(this), false)
    parent.appendChild(this.canvas)

    window.addEventListener('resize', (evt) => {
      this.setFullSize(this.canvas)
      this.repaint()
    }, false)

    this.drawCallback = this.drawButton.bind(this)
    this.prevCallback = null
    this.nextTick()
  }

  drawButton() {
    this.ctx.fillText('Click to upload',
      Math.floor(this.canvas.width/2), Math.floor(this.canvas.height/2))
    /*
    const [btnWidth, btnHeight] = [100, 50]
    const [btnX, btnY] = [
      Math.floor(this.canvas.width/2 - btnWidth/2),
      Math.floor(this.canvas.height/2 - btnHeight/2),
    ]
    this.ctx.strokeRect(btnX, btnY, btnWidth, btnHeight)
    const btnText = 'upload'

    // FIXME: Beware of line width
    this.ctx.fillText(btnText,
      btnX + Math.floor(btnWidth/2),
      btnY + Math.floor(btnHeight/2))

    this.elems.push({
      x: btnX, y: btnY, width: btnWidth, height: btnHeight,
      handler: (evt) => {
        this.fileBtn.click()
      }
    })
    */
  }

  setFullSize(elem) {
    console.assert(typeof elem !== 'undefined')
    if (typeof elem.width !== 'undefined' && typeof elem.height !== 'undefined') {
      elem.width = window.innerWidth
      elem.height = window.innerHeight
      return
    }
    elem.style.width = '100vw'
    elem.style.height = '100vh'
  }

  onClick(event) {
    /*
    this.elems.forEach(elem => {
      if (elem.x <= event.pageX && event.pageX <= elem.x + elem.width &&
          elem.y <= event.pageY && event.pageY <= elem.y + elem.height) {
        elem.handler(event)
      }
    })
    */
    this.fileBtn.click()
  }

  onFileChange(event) {
    const file = event.target.files[0]

    this.drawFile(file)
  }

  drawFile(file) {
    if (!file) return

    const reader = new FileReader()
    new Promise((resolve, reject) => {
      reader.onload = resolve
      reader.onerror = reject

      reader.readAsArrayBuffer(file)
    })
      .then((progress) => {
        const array = new Uint8Array(progress.target.result)

        this.drawCallback = this.drawArray.bind(this, array)
      })
      .catch(err => {
        console.error(err)
      })
  }

  drawArray(array) {
    function gcd(a, b) {
      if (b === 0) return a
      return gcd(b, a%b)
    }

    const {width, height} = this.canvas
    const gcdPixelSize = gcd(width, height)
    const divByUnit = (x) => Math.floor(x / gcdPixelSize)
    for (let y = 0; y < height; y += gcdPixelSize) {
      for (let x = 0; x < width; x += gcdPixelSize) {
        const i = (divByUnit(y) * divByUnit(width)) + divByUnit(x)
        const r = array[i] || 0
        const g = array[i+1] || 0
        const b = array[i+2] || 0

        this.ctx.fillStyle = `#${
          [r, g, b].map(v => v.toString(16).padStart(2, 0)).join('')
        }`
        this.ctx.fillRect(x, y, gcdPixelSize, gcdPixelSize)
      }
    }
    // console.log(array, gcd(this.canvas.width, this.canvas.height))
  }

  nextTick(timestamp) {
    if (this.drawCallback !== this.prevCallback) {
      this.repaint()
    }
    window.requestAnimationFrame(this.nextTick.bind(this))
  }

  repaint() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawCallback()
    this.prevCallback = this.drawCallback
  }
}

window.onload = (evt) => new App(document.body)

