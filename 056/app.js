import {html} from './util.js'
import HighlightText, {lorem} from './elements/highlight.js'
import Game from './elements/game.js'

customElements.define('highlight-text', HighlightText, {extends: 'div'})


document.head.append(...html`
  <style>
  body {
    font: 14px "Century Gothic", Futura, sans-serif;
    margin: 20px;
  }
  ol, ul {
    padding-left: 30px;
  }
  </style>
`)
document.body.append(
  /*
  ...html`
    <!-- testing highlight element -->
    <div is="highlight-text" keyword="ipsum" id="highlight">
      ${lorem}
    </div>
    <hr>
    <!-- testing loop -->
    <style>
    body {
      margin: 25px;
    }
    ul {
      list-style-type: disc;
      margin-left: 25px;
    }
    </style>
    <ul>
      ${[1, 2, 3].map(v => html`<li>${v ** 2}</li>`)}
    </ul>
    <hr>
  `
  */

  html`
    <${Game} />
  `.firstChild
)


/*
// Test result
console.assert(
  document.getElementById('highlight').textContent.trim()
  === lorem.trim()
)
*/
