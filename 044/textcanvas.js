export class TextCanvas {
  constructor() {
    this.canvas = [[' ',],]
  }

  set width(value) {
    console.log(`setting canvas width to ${value}`)
    for (let i = 0; i < this.canvas.length; ++i) {
      // Update widths
      this.canvas[i].length = value
    }
  }

  get width() {
    return this.canvas[0].length
  }

  set height(value) {
    console.log(`setting canvas height to ${value}`)
    const width = this.canvas[0].length
    for (let i = this.canvas.length; i < value; ++i) {
      // Assign new row
      this.canvas[i] = []
      // Match width
      this.canvas[i].length = width
    }
  }

  get height() {
    return this.canvas.length
  }

  getImageData(left, top, width, height) {
    // TODO: Support width, height
    // NOTE: Hardcoded value 1
    width = 1
    height = 1

    const text = this.toText()

    return {
      data: [...text[top][left]],
      width: width,
      height: height
    }
  }

  drawText(text, x, y) {
    // console.log(`text: ${text}, x: ${x}, y: ${y}`)
    // console.log(`width: ${this.width}, height: ${this.height}`)

    const chars = text.split('')

    if (y >= this.height) {
      this.height = y + 1
    }

    if (x + chars.length >= this.width) {
      this.width = x + chars.length + 1
    }

    for (let i = 0; i < chars.length; ++i) {
      this.canvas[y][x + i] = chars[i]
    }
  }

  toText() {
    const rows = []
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        if (this.canvas[y][x] === undefined) {
          // Fill empty elements
          this.canvas[y][x] = ' '
        }
      }
      rows.push(this.canvas[y].join(''))
    }
    return rows.join('\n')
  }
}
