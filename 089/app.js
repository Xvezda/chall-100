class App {
  constructor() {
    const parent = document.body

    this.commands = {
      'M': {title: 'Move to'},
      'L': {title: 'Line to'},
    }

    this.pathTextArea = document.createElement('textarea')
    this.pathTextArea.rows = 25
    this.pathTextArea.cols = 80
    this.pathTextArea.value = `M 50 0 L 0 100 L 100 100 L 50 0`

    // TODO: Replace with layout
    this.pathTextArea.style.display = 'block'

    this.stepSliderLabel = document.createElement('label')

    this.stepSlider = document.createElement('input')
    this.stepSlider.type = 'range'
    this.stepSlider.value = 0

    // TODO: Replace with layout
    this.stepSlider.style.marginTop = '10px'
    this.stepSlider.style.marginRight = '10px'

    this.canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    // TODO: Replace with layout
    this.canvas.style.margin = '20px'

    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.path.setAttribute('stroke', 'black')
    this.path.setAttribute('stroke-width', 1)
    this.path.setAttribute('fill', 'transparent')

    this.canvas.appendChild(this.path)

    this.onChange()
    this.pathTextArea.addEventListener('change', this.onChange.bind(this), false)

    this.stepSlider.addEventListener('input', this.onSlide.bind(this), false)

    parent.appendChild(this.pathTextArea)

    parent.appendChild(this.stepSlider)
    parent.appendChild(this.stepSliderLabel)

    parent.appendChild(this.canvas)
  }

  getCommand(c) {
    console.assert(/[A-Z]/i.test(c))
    return this.commands[c.toUpperCase()]
  }

  onChange(event) {
    const target = event && event.target || this.pathTextArea

    const path = target.value
    const tokens = path.match(/[A-Za-z](?:([\s,])*(-?[0-9.]+)\1+)+/g) || []
    const steps = tokens.length

    this.stepSlider.max = steps - 1
    this.setStep(tokens[0])
    this.path.setAttribute('d', tokens[0])

    this.steps = tokens
  }

  onSlide(event) {
    this.setStep(this.steps[this.stepSlider.value])

    this.path.setAttribute(
      'd', this.steps.slice(0, +this.stepSlider.value + 1).join(' '))
  }

  setStep(text) {
    this.stepSliderLabel.textContent = text
  }
}

window.onload = (evt) => new App()
