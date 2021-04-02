class App {
  constructor(parent) {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    // this.ctx = this.canvas.getContext('2d', {alpha: false})

    this.records = []

    parent.appendChild(this.canvas)

    this.setFullSize(this.canvas)
    window.addEventListener('resize', this.onResize.bind(this), false)

    this.nextTick(null)
  }

  onResize(event) {
    this.setFullSize(this.canvas)
  }

  setFullSize(elem) {
    if ('width' in elem) {
      elem.width = window.innerWidth
      elem.height = window.innerHeight
      return
    }
    elem.style.width = `${window.innerWidth}px`
    elem.style.height = `${window.innerHeight}px`
  }

  nextTick(timestamp) {
    const currentSecond = Math.floor(timestamp / 1000)
    if (typeof this.records[currentSecond] === 'undefined') {
      this.records[currentSecond] = 0
    }
    ++this.records[currentSecond]

    this.clear()

    const record = this.records[currentSecond-1] || 0
    this.drawAtCenter(record)
    return window.requestAnimationFrame(this.nextTick.bind(this))
  }

  drawAtCenter(text) {
    const fontSize = parseInt(this.ctx.font)
    this.ctx.save()
    this.ctx.font = `42px "Keania One"`
    this.ctx.textAlign = 'center'
    this.ctx.fillText(text.toString(),
      Math.floor(this.canvas.width/2),
      Math.floor(this.canvas.height/2 - fontSize/2))
    this.ctx.restore()
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    /*
    this.ctx.save()
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.restore()
    */
  }
}


function windowPromise() {
  return new Promise((resolve, reject) => {
    window.onload = resolve
  })
}

function fontPromise() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.onload = resolve

    link.setAttribute('rel', 'stylesheet')
    link.setAttribute(
      'href', `https://fonts.googleapis.com/css?family=Keania+One`)

    document.head.appendChild(link)
  })
}

Promise.all([windowPromise(), fontPromise()])
  .then(() => {
    new App(document.body)
  }).catch((err) => {
    console.error(err)
  })

