/* No magic numbers */
const SECOND = 1000
const MINUTE = SECOND * 60

class App {
  constructor(parent) {
    this.parent = parent

    this.canvas = document.createElement('canvas')
    this.canvas.style.background = 'lightgray'
    this.onResize(null)

    this.ctx = this.canvas.getContext('2d')

    // Animated text
    this.textDotCounter = 3
    this.animateText()
    this.textIntervalId = setInterval(this.animateText.bind(this), 1*SECOND)

    // Draw progress bar
    this.progressStart = new Date('2021-01-01 00:00:00').getTime()
    this.progressCurrent = Date.now()
    this.progressEnd = new Date('2022-01-01 00:00:00').getTime()

    this.drawProgress()
    this.progressIntervalId = setInterval(this.drawProgress.bind(this), 1*SECOND)

    // Update state every seconds
    this.updaterIntervalId = setInterval(() => {
      if (this.progressEnd < this.progressCurrent) {
        [
          this.progressIntervalId,
          this.textIntervalId,
          this.updaterIntervalId
        ].forEach(id => clearInterval(id))

        return this.onDone()
      }
      this.progressCurrent = Date.now()
    }, 1*SECOND)

    this.parent.appendChild(this.canvas)

    // Add event listeners
    window.onresize = this.onResize.bind(this)
  }

  animateText() {
    this.fontSize = 48
    this.ctx.font = `${this.fontSize}px sans-serif`
    const msg = 'Loading 2022' + '.'.repeat(this.textDotCounter)
    const text = this.ctx.measureText(msg)
    const textTopMargin = -50

    const [x, y] = [
      this.canvas.width/2 - text.width/2,
      this.canvas.height/2 - this.fontSize/2 + textTopMargin
    ]
    const extra = 50
    this.ctx.clearRect(x - extra, y - this.fontSize,
      text.width + extra*2, this.fontSize + extra)
    this.ctx.fillText(msg, x, y)

    // Next iteration
    this.textDotCounter = this.textDotCounter % 3 + 1
  }

  onDone() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.fontSize = 48
    this.ctx.font = `${this.fontSize}px sans-serif`
    const msg = 'Happy new year! :)'
    const text = this.ctx.measureText(msg)

    this.ctx.fillText(msg,
      this.canvas.width/2 - text.width/2, this.canvas.height/2 - this.fontSize/2)
  }

  drawProgress() {
    const [width, height] = [600, 30]
    const [x, y] = [
      this.canvas.width/2 - width/2,
      this.canvas.height/2 - height/2
    ]
    // Clear previous progress
    this.ctx.clearRect(x, y, width, height)

    // Draw base rect
    this.ctx.fillRect(x, y, width, height)

    // Draw progress bar by subtracting
    const calcPercentage = (value, all) => {
      return value / all * 100
    }
    const borderWidth = 5
    const percent = calcPercentage(
      this.progressCurrent - this.progressStart,
      this.progressEnd - this.progressStart)
    const [progressBarWidth, progressBarHeight] = [
      width * (percent/100),
      height
    ]

    console.log(`Current: ${percent.toString().substring(0, 8)}%`)

    this.ctx.clearRect(
      x + borderWidth + progressBarWidth,
      y + borderWidth,
      (() => {
        let x = width - progressBarWidth - borderWidth*2
        return x < 0 ? 0 : x
      })(),
      progressBarHeight - borderWidth*2)
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }
}

new App(document.body)
