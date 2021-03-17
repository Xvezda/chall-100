/*!
 * Copyright (c) 2021 Xvezda <xvezda@naver.com
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
import Util from './util.js'


export default class Scoreboard extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    this.attrs = {
      rounds: 12,
      ...Util.attributesToObject(this.attributes),
    }
    this.init()
  }

  init() {
    const style = document.createElement('style')
    style.textContent = this.getAttribute('table-style') || `
      table {
        font-family: "Century Gothic", Futura, sans-serif;
        border-spacing: 0;
        table-layout: fixed;
      }

      thead th {
        padding: 10px 20px;
        background-color: lightgray;
      }

      tbody th {
        padding: 10px 20px;
      }

      tbody td {
        text-align: center;
      }

      table tr {
        background-color: white;
      }

      table tr:nth-child(even) {
        background-color: #eee;
      }

      th, td {
        transition: filter 1.5s, transform 1.5s;
      }

      .selected {
        filter: drop-shadow(3px 6px 8px gray);
        transform: translate3d(-3px, -5px, 0px);
      }
    `
    this.shadowRoot.appendChild(style)

    const playerNumbers = this.getAttribute('player-numbers') ?
      parseInt(this.getAttribute('player-numbers')) : 2

    this.rows = {}
    Util.arraySizeOf(playerNumbers).map((_, i) => {
      this.rows[`player${i+1}`] = []
    })

    const scoreboard = (() => {
      const table = document.createElement('table')

      const createHeader = () => {
        const thead = document.createElement('thead')
        const tr = document.createElement('tr')

        const playerHeaders = Util.arraySizeOf(playerNumbers)
          .map((_, i) => `Player ${i+1}`)

        ;['Rounds']
          .concat(playerHeaders)
          .forEach((v) => {
            const th = document.createElement('th')

            th.textContent = v
            tr.appendChild(th)
          })

        thead.appendChild(tr)
        table.appendChild(thead)
      }
      createHeader()

      const createBody = () => {
        const tbody = document.createElement('tbody')
        Util.arraySizeOf(parseInt(this.attrs.rounds)).forEach((v, i) => {
          const tr = document.createElement('tr')
          const th = document.createElement('th')
          th.scope = 'row'

          th.textContent = `${i+1}`
          tr.appendChild(th)

          Util.arraySizeOf(playerNumbers)
            .forEach((_, j) => {
              const td = document.createElement('td')
              this.rows[`player${j+1}`][i] = td

              tr.appendChild(td)
            })

          tbody.appendChild(tr)
        })
        table.appendChild(tbody)
      }
      createBody()

      return table
    })()
    this.shadowRoot.appendChild(scoreboard)
  }

  setScoreOf({player, round, score}) {
    const cell = this.rows[player][round-1]

    const customEvent = new CustomEvent('updatescore', {
      detail: {
        player,
        round,
        score,
      }
    })
    this.dispatchEvent(customEvent)

    cell.textContent = score
  }
}
