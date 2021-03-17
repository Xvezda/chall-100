/*!
 * Copyright (c) 2021 Xvezda <xvezda@naver.com
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game.js'

class App {
  constructor(parent) {
    const game = document.createElement('yacht-game')
    parent.appendChild(game)
  }
}


customElements.define('yacht-game', Game)
window.onload = (evt) => new App(document.body)

