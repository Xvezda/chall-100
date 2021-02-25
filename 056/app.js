import {html} from './util.js'
import Game from './elements/game.js'


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
  html`
    <${Game} />
  `.firstChild
)

