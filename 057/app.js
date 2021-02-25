import {html} from './util.js'
import Game from './elements/game.js'


document.head.appendChild(html`
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

document.body.appendChild(
  html`
    <${Game} />
  `
)

