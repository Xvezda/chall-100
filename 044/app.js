import {Board} from './board.js'
import {Command} from './command.js'
import {TextCanvas} from './textcanvas.js'


class App {
  constructor() {
    this.board = new Board(document.body)
    this.command = new Command(window)

    this.command.add('x', this.commandRemove.bind(this))
    this.command.add('s', this.commandSave.bind(this))
  }

  commandRemove() {
    try {
      this.board.objects.pop()
      this.board.resetCanvas()
    } catch (e) {}
  }

  commandSave() {
    console.log('saved objects:', this.board.objects)
    const canvas = new TextCanvas()

    this.board.objects.forEach((obj, idx) => {
      const [w, h] = [
        this.board.divByUnitSize(obj.width) * 4 + 1,
        this.board.divByUnitSize(obj.height) * 2 + 1,
        // this.board.divByUnitSize(obj.width) * 2 + 1,
        // this.board.divByUnitSize(obj.height) + 1,
      ]
      const [x, y] = [
        this.board.divByUnitSize(obj.x) * 4 + 1,
        this.board.divByUnitSize(obj.y) * 2 + 1,
        // this.board.divByUnitSize(obj.x) * 2 + 1,
        // this.board.divByUnitSize(obj.y) + 1,
      ]
      console.log(`value -> w: ${w}, h: ${h}, x: ${x}, y: ${y}`)

      // canvas.width = x + w
      // canvas.height = y + h

      // Draw sides
      for (let i = 0; i < h; ++i) {
        canvas.drawText('|', 0 + x, i + y)
        canvas.drawText('|', w-1 + x, i + y)
      }

      // Draw top, bottom
      for (let i = 0; i < w; ++i) {
        canvas.drawText('-', i + x, 0 + y)
        canvas.drawText('-', i + x, h-1 + y)
      }

      // Mark corners
      canvas.drawText('+', 0 + x, 0 + y)
      canvas.drawText('+', w-1 + x, 0 + y)
      canvas.drawText('+', 0 + x, h-1 + y)
      canvas.drawText('+', w-1 + x, h-1 + y)

      // console.log(idx, canvas.toText())
    })

    const trimTextCanvas = (text) => {
      const rows = text.split('\n')

      // Get far left and top
      let x, y;
      outer: for (let i = 0; i < rows.length; ++i) {
        for (let j = 0; j < rows[i].length; ++j) {
          if (rows[i][j] !== ' ') {
            y = i
            break outer
          }
        }
      }

      // Scan vertical line first
      outer: for (let i = 0; i < rows[0].length; ++i) {
        for (let j = 0; j < rows.length; ++j) {
          if (rows[j][i] !== ' ') {
            x = i
            break outer
          }
        }
      }
      console.log(x, y)

      return rows.slice(y).map(r => r.slice(x).trimEnd()).join('\n')
    }

    const result = trimTextCanvas(canvas.toText())

    // FIXME(remove me): Save result as global for debugging purpose
    globalThis.$$_result = result

    console.log(result)
  }
}

const app = new App()
