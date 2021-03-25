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

  createRect(x, y, width, height) {
    const rect = this.createElement('rect')

    rect.setAttribute('x', x)
    rect.setAttribute('y', y)
    rect.setAttribute('width', width)
    rect.setAttribute('height', height)

    return rect
  }

  strokeRect(x, y, w, h) {
    const rect = this.createRect(x, y, w, h)
    rect.setAttribute('fill', 'transparent')
    rect.setAttribute('stroke-width', this.lineWidth)
    rect.setAttribute('stroke', this.strokeStyle)

    this.svg.appendChild(rect)
  }

  fillRect(x, y, w, h) {
    const rect = this.createRect(x, y, w, h)

    this.svg.appendChild(rect)
  }

  beginPath() {
    this.paths = []
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
    return this.paths.reduce((acc, v) => {
      return acc.concat([v.command].concat(v.parameters || []))
    }, []).join(' ')
  }

  stroke() {
    const path = this.createElement('path')

    path.setAttribute('d', this.buildPath())

    path.setAttribute('stroke-width', this.lineWidth)
    path.setAttribute('stroke', this.strokeStyle)
    path.setAttribute('fill', 'transparent')

    this.svg.appendChild(path)
  }

  fill() {
    const path = this.createElement('path')

    path.setAttribute('d', this.buildPath())
    path.setAttribute('fill', this.fillStyle)

    this.svg.appendChild(path)
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.paths.push({
      command: 'C',
      parameters: [[cp1x, cp1y], [cp2x, cp2y], [x, y]],
    })
  }
}
