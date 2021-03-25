import SVGBuilder from './svgbuilder.js'


function drawShapes(ctx) {
  /* Draw boxes */
  ctx.strokeRect(10, 10, 100, 100)
  ctx.fillRect(120, 10, 100, 100)

  /* Draw triangles */
  ctx.beginPath()
  ctx.moveTo(10, 120)
  ctx.lineTo(110, 120)
  ctx.lineTo(110, 230)
  ctx.closePath()
  // ctx.closePath is equivalent to
  // ctx.lineTo(10, 120)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(10, 130)
  ctx.lineTo(10, 230)
  ctx.lineTo(100, 230)
  ctx.fill()

  /* Bezier curves */
  ctx.beginPath()
  ctx.moveTo(120, 120)
  ctx.bezierCurveTo(170, 120, 170, 220, 220, 220)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(10, 250)
  ctx.bezierCurveTo(50, 280, 70, 280, 110, 250)
  ctx.stroke()
}


class App {
  constructor(parent) {
    const builder = new SVGBuilder()

    builder.width = window.innerWidth / 2
    builder.height = window.innerHeight

    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth / 2
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')

    drawShapes(builder)
    drawShapes(ctx)

    parent.appendChild(builder.getCanvas())
    parent.appendChild(canvas)
  }
}


window.onload = (evt) => new App(document.body)

