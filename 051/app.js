import CanvasButtonElement from './canvas-button.js'


class App {
  constructor(parent) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.canvasButton = new CanvasButtonElement({ text: 'test'})

    /* Place center of canvas */
    this.canvasButton.x = Math.floor(
      this.canvas.width/2 - this.canvasButton.width/2
    )
    this.canvasButton.y = Math.floor(
      this.canvas.height/2 - this.canvasButton.height/2
    )

    let counter = 1
    this.canvasButton.addEventListener('click', (evt) => {
      console.log(`${counter++}: :)`)
    })

    this.canvasButton.appendTo(this.canvas)
    parent.appendChild(this.canvas)
  }
}


window.onload = (event) => new App(document.body)
