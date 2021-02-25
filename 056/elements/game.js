/**
 * Implement tic tac toe game from react.js tutorial
 * https://ko.reactjs.org/tutorial/tutorial.html#what-are-we-building
 */

import Util, {html} from '../util.js'


class Square extends Util.CustomElement {
  constructor() {
    super()

    this.updateState({
      value: this.getAttribute('value')
    })
  }

  render() {
    const button = html`
        <button class="square">
          ${this.state.value}
        </button>
      `
      .firstChild
      .on('click', this.onClick.bind(this))

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
    console.debug('Square:', button)
    return [button]
  }

  onClick(event) {
    console.debug('onClick:', event, this)

    this.updateState({
      value: 'X'
    })
  }
}


class Board extends Util.CustomElement {
  render() {
    const status = 'Next player: X'
    return html`
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
    `
  }

  renderSquare(i) {
    console.debug('renderSquare:',
      typeof Square, Square.prototype instanceof HTMLElement)
    console.dir(Square.prototype)

    return html`<${Square} value="${i}" />`
  }
}


export default class Game extends Util.CustomElement {
  render() {
    return html`
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
    `
  }
}
