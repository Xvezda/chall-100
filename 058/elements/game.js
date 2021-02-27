/**
 * Implement tic tac toe game from react.js tutorial
 * https://ko.reactjs.org/tutorial/tutorial.html#what-are-we-building
 */

import Util, {html, css} from '../util.js'


export function Square(attrs) {
  return html`
    <button
      ${{style: css({
        background: '#fff',
        border: '1px solid #999',
        float: 'left',
        fontSize: '24px',
        fontWeight: 'bold',
        lineHeight: '34px',
        height: '34px',
        marginRight: '-1px',
        marginTop: '-1px',
        padding: '0',
        textAlign: 'center',
        width: '34px'
      })}}
      class="square"
    >
      ${attrs.getNamedItem('value').value}
    </button>
  `
}


class Board extends Util.CustomElement {
  onConnect() {
    Object.entries(this.selectAllHashed()).forEach(([k, v]) => {
      v.addEventListener('click', (event) => {
        this.dispatchEvent(new CustomEvent('check', {
          detail: {
            value: k
          },
        }))
      })
    })
  }

  renderSquare(i) {
    const squares = JSON.parse(this.attrs.getNamedItem('squares').value)
    return html`
      <${Square}
        ${this.hash(i)}
        value="${squares[i]}"
      />
    `
  }

  render(attrs) {
    this.shadowStyle = `
      .status {
        margin-bottom: 10px;
      }
      .board-row:after {
        clear: both;
        content: "";
        display: table;
      }
    `

    return html`
      <div>
        ${[0, 1, 2]
          .map(v => v*3)
          .map(v =>
            html`
              <div class="board-row">
                ${this.renderSquare(v)}
                ${this.renderSquare(v + 1)}
                ${this.renderSquare(v + 2)}
              </div>
            `
          )
        }
      </div>
    `
  }
}


export default class Game extends Util.CustomElement {
  constructor() {
    super()

    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    }
  }

  nextPlayer() {
    return this.state.xIsNext ? 'X' : 'O'
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1)
    const current = history[history.length - 1]
    const squares = current.squares.slice()
    if (calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = this.nextPlayer()
    this.updateState({
      history: history.concat([{
        squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }

  jumpTo(step) {
    this.updateState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  onConnect() {
    this.selectHashed('board').addEventListener('check', (event) => {
      this.handleClick(parseInt(event.detail.value))
    })
    Object.entries(this.selectAllHashed())
      .filter(([k]) => k.startsWith('history-'))
      .forEach(([k, v]) => {
        v.addEventListener('click', () => {
          this.jumpTo(parseInt(k.split('-').pop()))
        })
      })
  }

  render() {
    const history = this.state.history
    const current = history[this.state.stepNumber]
    const winner = calculateWinner(current.squares)

    const moves = history.map((step, move) => {
      const desc = move ?
        `Go to move #${move}` :
        `Go to game start`
      return html`
        <li>
          <button ${this.hash(`history-${move}`)}>${desc}</button>
        </li>
      `
    })

    let status
    if (winner) {
      status = `Winner: ${winner}`
    } else {
      status = `Next player: ${this.nextPlayer()}`
    }

    this.shadowStyle = `
      .game {
        display: flex;
        flex-direction: row;
      }
      .game-info {
        margin-left: 20px;
      }
    `
    return html`
      <div class="game">
        <div class="game-board">
          <${Board}
            ${this.hash('board')}
            squares="${JSON.stringify(current.squares)}"
          />
        </div>
        <div class="game-info">
          <div>${status}</div>
          <ol>${moves}</ol>
        </div>
      </div>
    `
  }
}


/* https://reactjs.org/tutorial/tutorial.html#declaring-a-winner */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}
