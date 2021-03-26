export default class SVGBuilder {
  constructor() {
    this.svg = this.createElement('svg')

    // Follows the default behavior of canvas
    this.svg.setAttribute('width', 300)
    this.svg.setAttribute('height', 150)

    this.lineWidth = 1
    this.strokeStyle = 'black'
    this.fillStyle = 'black'
  }

  createElement(name) {
    // https://stackoverflow.com/a/17520712
    return document.createElementNS('http://www.w3.org/2000/svg', name)
  }

  getCanvas() {
    return this.svg
  }

  set width(value) {
    this.svg.setAttribute('width', value)
  }

  set height(value) {
    this.svg.setAttribute('height', value)
  }

  rect(x, y, width, height) {
    const rect = this.createElement('rect')

    rect.setAttribute('x', x)
    rect.setAttribute('y', y)
    rect.setAttribute('width', width)
    rect.setAttribute('height', height)

    return rect
  }

  strokeRect(x, y, w, h) {
    this.beginPath()

    const rect = this.rect(x, y, w, h)
    rect.setAttribute('fill', 'transparent')
    // TODO: Optimize (e.g. Do not set attribute when lineWidth is default)
    rect.setAttribute('stroke-width', this.lineWidth)
    rect.setAttribute('stroke', this.strokeStyle)

    this.shapes.push(rect)
    this.drawShapes()
  }

  fillRect(x, y, w, h) {
    this.beginPath()

    const rect = this.rect(x, y, w, h)
    rect.setAttribute('fill', this.fillStyle)

    this.shapes.push(rect)
    this.drawShapes()
  }

  beginPath() {
    this.paths = []
    this.shapes = []
  }

  moveTo(x, y) {
    this.paths.push({
      command: 'M',
      parameters: [x, y],
    })
  }

  lineTo(x, y) {
    this.paths.push({
      command: 'L',
      parameters: [x, y],
    })
  }

  closePath() {
    this.paths.push({
      command: 'Z',
    })
  }

  buildPath() {
    const d = this.paths.reduce((acc, v) => {
      return acc.concat([v.command].concat(v.parameters || []))
    }, []).join(' ')

    if (!d) return

    const path = this.createElement('path')

    path.setAttribute('d', d)
    this.shapes.push(path)
  }

  drawShapes() {
    while (this.shapes.length > 0) {
      this.svg.appendChild(this.shapes.shift())
    }
  }

  stroke() {
    this.buildPath()
    this.shapes.forEach(shape => {
      shape.setAttribute('stroke-width', this.lineWidth)
      shape.setAttribute('stroke', this.strokeStyle)
      shape.setAttribute('fill', 'transparent')
    })
    this.drawShapes()
  }

  fill() {
    this.buildPath()
    this.shapes.forEach(shape => {
      shape.setAttribute('fill', this.fillStyle)
    })
    this.drawShapes()
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.paths.push({
      command: 'C',
      parameters: [[cp1x, cp1y], [cp2x, cp2y], [x, y]],
    })
  }

  quadraticCurveTo(cpx, cpy, x, y) {
    this.paths.push({
      command: 'Q',
      parameters: [[cpx, cpy], [x, y]],
    })
  }

  ellipse(x, y, rx, ry, rotation, startAngle, endAngle, anticlockwise) {
    console.assert(rx > 0 && ry > 0)

    const startPoint = {
      x: rx*Math.cos(startAngle + rotation) + x,
      y: ry*Math.sin(startAngle + rotation) + y,
    }
    const endPoint = {
      x: rx*Math.cos(endAngle + rotation) + x,
      y: ry*Math.sin(endAngle + rotation) + y,
    }

    const rad = endAngle - startAngle
    const deg = (() => {
      const d = (360 + this.radianToDegree(rad)) % 360
      if (anticlockwise) {
        return 360 - d
      }
      return d
    })()

    if (rad === Math.PI*2) {
      if (rx === ry) {
        this.shapes.push(this.circle(x, y, rx))
      } else {
        // NOTE: Ellipse element cannot represent in tilted orientation.
        // TODO:
        // Add `transform` option to select one of transform attribute,
        // or the connected two arcs.

        const ellipse = this.createElement('ellipse')
        ellipse.setAttribute('cx', x)
        ellipse.setAttribute('cy', y)
        ellipse.setAttribute('rx', rx)
        ellipse.setAttribute('ry', ry)

        ellipse.setAttribute(
          'transform',
          `rotate(${this.radianToDegree(rotation)}, ${x}, ${y})`
        )
        this.shapes.push(ellipse)
      }
      return
    }

    const largeArcFlag = 180 <= deg
    const sweepFlag = !anticlockwise

    console.table({
      startAngle,
      endAngle,
      rad,
      deg,
      largeArcFlag,
      sweepFlag,
      startPoint,
      endPoint,
    })

    this.moveTo(startPoint.x, startPoint.y)

    const xAxisRotation = rotation

    this.paths.push({
      command: 'A',
      parameters: [
        [rx, ry],
        this.radianToDegree(xAxisRotation),
        +largeArcFlag, +sweepFlag,
        [endPoint.x, endPoint.y],
      ],
    })
  }

  arc(x, y, r, startAngle, endAngle, anticlockwise) {
    this.ellipse(x, y, r, r, 0, startAngle, endAngle, anticlockwise)
  }

  degreeToRadian(deg) {
    return Math.PI/180 * deg
  }

  radianToDegree(rad) {
    return 180/Math.PI * rad
  }

  circle(cx, cy, r) {
    const circle = this.createElement('circle')
    circle.setAttribute('cx', cx)
    circle.setAttribute('cy', cy)
    circle.setAttribute('r', r)

    return circle
  }
}
