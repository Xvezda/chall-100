/**
 * Implement tic tac toe game from react.js tutorial
 * https://ko.reactjs.org/tutorial/tutorial.html#what-are-we-building
 */

import {html, chain} from '../util.js'


class Square extends HTMLElement {
  constructor() {
    super()

    this.state = {
      value: this.getAttribute('value')
    }
    this.render()
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

    try {
      const shadow = this.attachShadow({mode: 'open'})
      shadow.append(button)
    } catch (e) {
      this.shadowRoot.replaceChild(button, this.button)
    } finally {
      this.button = button
    }
  }

  onClick(event) {
    console.debug('onClick:', event, this)
    // alert('click')

    this.state.value = 'X'
    this.render()
  }
}


class Board extends HTMLElement {
  constructor() {
    super()

    const status = 'Next player: X'
    const shadow = this.attachShadow({mode: 'open'})
    shadow.append(...html`
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

    return html`<${Square} value="${i}" />`
  }
}


export default class Game extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({mode: 'open'})
    shadow.append(...html`
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
