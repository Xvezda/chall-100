/**
 * Implement tic tac toe game from react.js tutorial
 * https://ko.reactjs.org/tutorial/tutorial.html#what-are-we-building
 */

import {jshtm} from '../util.js'


class Square extends HTMLElement {
  constructor() {
    super()

    const [button] = jshtm`
      <button class="square" ${{onclick: this.onClick.bind(this)}}>
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
    const shadow = this.attachShadow({mode: 'open'})

    console.log('Square:', button)

    shadow.append(button)
  }

  onClick(event) {
    alert('click')
  }
}


class Board extends HTMLElement {
  constructor() {
    super()

    const status = 'Next player: X'
    const shadow = this.attachShadow({mode: 'open'})
    shadow.append(...jshtm`
      <style>
        .status {
          margin-bottom: 10px;
        }
        .board-row:after {
          clear: both;
          content: "";
          display: table;
        }
      </style>
      <div>
        <div class="status">${status}</div>
        <div class="board-row">
          ${this.renderSquare(0)}
          ${this.renderSquare(1)}
          ${this.renderSquare(2)}
        </div>
        <div class="board-row">
          ${this.renderSquare(3)}
          ${this.renderSquare(4)}
          ${this.renderSquare(5)}
        </div>
        <div class="board-row">
          ${this.renderSquare(6)}
          ${this.renderSquare(7)}
          ${this.renderSquare(8)}
        </div>
      </div>
    `)
  }

  renderSquare(i) {
    console.debug('renderSquare:',
      typeof Square, Square.prototype instanceof HTMLElement)
    console.dir(Square.prototype)

    return jshtm`<${Square} value="${i}" />`
  }
}


export default class Game extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({mode: 'open'})
    shadow.append(...jshtm`
      <style>
        .game {
          display: flex;
          flex-direction: row;
        }
        .game-info {
          margin-left: 20px;
        }
      </style>
      <div class="game">
        <div class="game-board">
          <${Board} />
        </div>
      </div>
    `)
  }
}
