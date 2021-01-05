class App {
  constructor(parent) {
    this.container = document.createElement('div')
    this.container.style.padding = '15px'

    this.canvas = document.createElement('canvas')
    this.canvas.width = 600
    this.canvas.height = 400
    this.canvas.style.display = 'block'
    this.canvas.style.border = '1px solid gray'

    this.ctx = this.canvas.getContext('2d')

    this.controlsContainer = document.createElement('div')
    this.controlsContainer.style.marginTop = '10px'

    this.inputStartLabel = document.createElement('label')
    this.inputStartLabel.style.marginRight = '10px'
    this.inputStart = document.createElement('input')
    this.inputStart.type = 'number'
    this.inputStartLabel.textContent = 'start: '
    this.inputStartLabel.appendChild(this.inputStart)

    this.inputEndLabel = document.createElement('label')
    this.inputEndLabel.style.marginRight = '10px'
    this.inputEnd = document.createElement('input')
    this.inputEnd.type = 'number'
    this.inputEndLabel.textContent = 'end: '
    this.inputEndLabel.appendChild(this.inputEnd)

    this.inputCountLabel = document.createElement('label')
    this.inputCount = document.createElement('input')
    this.inputCount.type = 'number'
    this.inputCountLabel.textContent = 'count: '
    this.inputCountLabel.appendChild(this.inputCount)

    this.inputs = [this.inputStart, this.inputEnd, this.inputCount]
    this.inputs.forEach(input => {
      input.oninput = this.onInput.bind(this)
    })

    ![this.inputStartLabel, this.inputEndLabel, this.inputCountLabel]
      .forEach(label => this.controlsContainer.appendChild(label))

    this.container.appendChild(this.canvas)
    this.container.appendChild(this.controlsContainer)

    parent.appendChild(this.container)
  }

  // Do a linear interpolation
  onInput(event) {
    if (this.inputs.some(input => !input.value)) return

    const [start, end, count] =
      this.inputs.map(input => Number.parseInt(input.value))
    // How far between start to end point
    const distance = end - start
    // How far between each keys
    const step = distance / (count + 1)

    const result = []
    for (let i = 0; i <= count + 1; ++i) {
      result.push(start + (step * i))
    }
    console.log(result)

    if (result.some(point => isNaN(point))) return

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const r = 25
    for (let i = 0; i < result.length; ++i) {
      const x = result[i]

      const hue = (360 / result.length) * i
      this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`

      this.ctx.beginPath()
      this.ctx.arc(x + r, this.canvas.height/2, r, 0, 2*Math.PI)
      this.ctx.fill()
      this.ctx.closePath()
    }
  }
}


new App(document.body)
