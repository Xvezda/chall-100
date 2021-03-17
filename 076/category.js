/*!
 * Copyright (c) 2021 Xvezda <xvezda@naver.com
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
export default class Category extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    this.init()
  }

  init() {
    const style = document.createElement('style')
    style.textContent = this.getAttribute('table-style') || `
      table {
        font-family: "Century Gothic", Futura, sans-serif;
        width: 100%;
        border-spacing: 0;
      }

      thead th {
        background-color: lightgray;
        padding: 10px 20px;
      }

      tbody th, tbody td {
        padding: 10px 20px;
      }

      tbody th {
        text-align: left;
      }

      tbody td {
        text-align: center;
      }

      tbody tr {
        cursor: pointer;
        transition: filter 0.07s ease-out, transform 0.1s ease-out;
      }

      tbody tr:hover {
        filter: drop-shadow(2px 3px 5px darkgray);
        transform: translateY(-3px);
      }

      tbody tr {
        background-color: white;
      }

      tbody tr:nth-child(even) {
        background-color: #eee;
      }

      .numcol {
        width: 80px;
      }
    `
    this.shadowRoot.appendChild(style)

    const table = document.createElement('table')
    const colgroup = document.createElement('colgroup')
    ;[
      {
        className: 'catcol',
      },
      {
        className: 'numcol',
      }
    ].forEach(attr => {
      const col = document.createElement('col')

      if (attr.className) {
        col.className = attr.className
      }

      if (attr.span) {
        col.setAttribute('span', attr.span)
      }
      colgroup.appendChild(col)
    })
    table.appendChild(colgroup)

    const thead = document.createElement('thead')

    ;['Categories'].forEach(name => {
      const th = document.createElement('th')
      th.setAttribute('colspan', 2)
      th.textContent = name
      thead.appendChild(th)
    })
    table.appendChild(thead)

    const tbody = document.createElement('tbody')

    this.rows = {}

    const nameTableAttr = this.getAttribute('name-table')
    this.nameTable = nameTableAttr ? JSON.parse(nameTableAttr) : {}

    Object.entries(this.nameTable).forEach(([key, value]) => {
      const tr = document.createElement('tr')

      const th = document.createElement('th')
      th.textContent = value
      th.setAttribute('scope', 'row')

      tr.appendChild(th)

      const td = document.createElement('td')
      // Place holder
      td.textContent = `0`

      // Click handler
      tr.addEventListener('click', (evt) => {
        const score = parseInt(td.textContent.trim())
        const customEvent = new CustomEvent('selectcategory', {
          detail: {
            name: key,
            title: value,
            score: score,
          }
        })
        this.dispatchEvent(customEvent)
      })

      tr.appendChild(td)

      tbody.appendChild(tr)

      this.rows[key] = td
    })

    table.appendChild(tbody)

    this.table = table
    this.shadowRoot.appendChild(table)
  }

  setNameTable(table) {
    this.nameTable = table
  }

  setScores(scores) {
    this.scores = scores
  }

  showScores(scores) {
    this.setScores(scores)

    Object.entries(scores).forEach(([k, v]) => {
      if (!this.rows[k]) {
        console.warn(`row name ${k} does not exists`)
        return
      }
      this.rows[k].textContent = v
    })
  }
}
