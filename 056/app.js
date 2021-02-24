import {jshtm} from './util.js'
import HighlightText, {lorem} from './elements/highlight.js'
import Game from './elements/game.js'

customElements.define('highlight-text', HighlightText, {extends: 'div'})


document.body.append(
  ...jshtm`
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
      ${[1, 2, 3].map(v => jshtm`<li>${v ** 2}</li>`)}
    </ul>
    <hr>
    <${Game} />
  `
)


// Test result
console.assert(
  document.getElementById('highlight').textContent.trim()
  === lorem.trim()
)
