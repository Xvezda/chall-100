/**
 * Implement tic tac toe game from react.js tutorial
 * https://ko.reactjs.org/tutorial/tutorial.html#what-are-we-building
 */

import Util, {html, css} from '../util.js'


class Square extends Util.CustomElement {
  render() {
    const button = html`
        <button ${this.hash('button')} class="square">
          ${this.getAttribute('value')}
        </button>
      `

    button.style.cssText = `
      background: #fff;
      border: 1px solid #999;
      float: left;
      font-size: 24px;
      font-weight: bold;
      line-height: 34px;
      height: 34px;
      margin-right: -1px;
      margin-top: -1px;
      padding: 0;
      text-align: center;
      width: 34px;
    `
    return button
  }

  onConnect() {
    this.hashed['button'].addEventListener('click', this.onClick.bind(this))
  }

  onClick(event) {
    this.dispatchEvent(new Event('click'))
  }
}


class Board extends Util.CustomElement {
  constructor() {
    super()

    this.state = {
      squares: Array(9).fill(null),
      xIsNext: true,
    }
  }

  render() {
    const winner = calculateWinner(this.state.squares)
    let status
    if (winner) {
      status = `Winner: ${winner}`
    } else {
      status = `Next player: ${this.nextPlayer()}`
    }

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
        <div class="status">${status}</div>
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

  renderSquare(i) {
    return html`
      <${Square}
        ${this.hash(i)}
        value="${this.state.squares[i]}"
      />
    `
  }

  onConnect() {
    Object.entries(this.hashed).forEach(([k, v]) => {
      v.addEventListener('click', (event) => {
        this.handleClick(parseInt(k))
      })
    })
  }

  handleClick(i) {
    const squares = this.state.squares.slice()
    if (calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = this.nextPlayer()
    this.updateState({
      squares,
      xIsNext: !this.state.xIsNext,
    })
  }

  nextPlayer() {
    return this.state.xIsNext ? 'X' : 'O'
  }
}


export default class Game extends Util.CustomElement {
  render() {
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
          <${Board} />
        </div>
      </div>
    `
  }
}


/*
export default function Game() {
  return html`
    <div ${{style: css({display: 'flex', flexDirection: 'row'})}}>
      <div>
        <${Board} />
      </div>
    </div>
  `
}
*/


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
