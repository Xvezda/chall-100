/**
 * Implement tic tac toe game from react.js tutorial
 * https://ko.reactjs.org/tutorial/tutorial.html#what-are-we-building
 */

import Util, {html, css} from '../util.js'


class Square extends Util.CustomElement {
  constructor() {
    super()

    this.updateState({
      value: this.getAttribute('value'),
      isChecked: false
    })
  }

  render() {
    const button = html`
        <button class="square">
          ${this.state.isChecked ? 'X' : null}
        </button>
      `
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
    return button
  }

  onClick(event) {
    this.updateState({
      isChecked: true
    })
  }
}


class Board extends Util.CustomElement {
  constructor() {
    super()
  }

  render() {
    const status = 'Next player: X'

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
                  ${this.renderSquare(v+1)}
                  ${this.renderSquare(v+2)}
                </div>
              `
            )
        }
      </div>
    `
  }

  renderSquare(i) {
    return html`<${Square} value="${i}" />`
  }

  onConnect() {
    this.addEventListener('stateupdate', this.onStateUpdate.bind(this))
  }

  onStateUpdate(event) {
    console.log(':)', event)
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

