class App {
  constructor(parent) {
    this.parent = parent

    this.container = document.createElement('div')
    this.container.style.display = 'flex'
    this.container.style.justifyContent = 'center'
    this.container.style.alignItems = 'center'
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'

    const createbar = (value) => {
      const absRange = 100
      const bar = document.createElement('input')
      bar.type = 'range'
      bar.value = 0
      bar.min = -absRange
      bar.max = absRange
      bar.style.appearance = 'slider-vertical'
      bar.style.width = '25px'
      bar.setAttribute('disabled', 'disabled')

      let i = value
      setInterval(() => {
        bar.value = Math.sin(i / 50) * absRange
        ++i
      }, 10)

      return bar
    }

    ![0, 10, 20, 30, 40, 50, 60, 70, 80, 90].forEach(v => {
      this.container.appendChild(createbar(v))
    })
    this.parent.appendChild(this.container)
  }
}

new App(document.body)
