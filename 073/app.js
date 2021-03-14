/**
 * Copyright (c) 2021 Xvezda <xvezda@naver.com>
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import PatternLock from './pattern-lock.js'
import SoundEffectPlayer from './sfx-player.js'

customElements.define('pattern-lock', PatternLock)


class App {
  constructor() {
    const container = document.createElement('div')
    container.style.display = 'flex'
    container.style.width = '100vw'
    container.style.height = '100vh'
    container.style.justifyContent = 'center'
    container.style.alignItems = 'center'

    const subContainer = document.createElement('div')
    subContainer.style.display = 'flex'

    const patternLock = document.createElement('pattern-lock')
    subContainer.appendChild(patternLock)

    const panel = document.createElement('div')
    panel.style.display = 'flex'
    panel.style.alignItems = 'center'

    const textView = document.createElement('textarea')
    textView.setAttribute('readonly', 'readonly')
    textView.style.width = '100%'
    textView.style.height = '100%'
    textView.style.resize = 'none'
    textView.style.padding = '10px'

    panel.appendChild(textView)
    subContainer.appendChild(panel)
    container.appendChild(subContainer)
    document.body.appendChild(container)

    const sfxPlayer = new SoundEffectPlayer(patternLock, {
      'patterninput': 'assets/sfx/146721__leszek-szary__menu-click.wav',
    })

    patternLock.addEventListener('patterninit', (evt) => {
      const actives = evt.detail.previous
      if (!actives) return

      textView.value += `[${actives.join(',')}]\n`

      // https://stackoverflow.com/a/9170709
      // Scroll to bottom
      textView.scrollTop = textView.scrollHeight

      // NOTE: Easter egg
      // Disable sfx when user draws 'S' shape pattern
      const sPattern = [2, 1, 0, 3, 4, 5, 8, 7, 6]
      if (sPattern.toString() === actives.toString()) {
        sfxPlayer.disconnect()
      }
    }, false)
  }
}

window.onload = (evt) => new App
