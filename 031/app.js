import {Board} from './board.js'
import {Command} from './command.js'


class App {
  constructor() {
    this.board = new Board(document.body)
    this.command = new Command(window)

    this.command.add('s', (event) => {
      console.log('saved objects:', this.board.objects)
      // TODO: Make multiple objects convertion possible
      // FIXME
      this.board.objects.forEach(obj => {
        const [w, h] = [
          this.board.vectorize(obj.width),
          this.board.vectorize(obj.height)
        ]
        console.log(`vectorized -> w: ${w}, h: ${h}`)
        // Create buffer
        const buffer = []
        for (let i = 0; i < h; ++i) {
          // Expect 2w == 1h
          // So, multiply 2
          const row = new Array(2*w).fill(' ')
          buffer.push(row)
        }
        // Draw sides
        for (let i = 0; i < buffer.length; ++i) {
          buffer[i][0] = '|'
          buffer[i][buffer[i].length-1] = '|'
        }
        // Draw top, bottom
        buffer[0].fill('-')
        buffer[buffer.length-1].fill('-')
        // Mark corners
        buffer[0][0] = '+'  // Left top
        buffer[0][2*w-1] = '+'  // Right top
        buffer[h-1][0] = '+'  // Left bottom
        buffer[h-1][2*w-1] = '+'  // Right bottom

        // Generate string from buffer
        const rows = []
        for (let i = 0; i < buffer.length; ++i) {
          rows.push(buffer[i].join(''))
        }
        // Print result
        console.log('object:', obj)
        console.log(rows.join('\n'))
      })
    })
  }
}

const app = new App()
