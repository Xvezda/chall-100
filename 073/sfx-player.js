/**
 * Copyright (c) 2021 Xvezda <xvezda@naver.com>
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export default class SoundEffectPlayer {
  constructor(target, maps) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API#audio_context
    /*
    const AudioContext = window.AudioContext || window.webkitAudioContext
    this.audioContext = new AudioContext()
    */

    this.target = target

    // this.tracks = {}
    this.listeners = {}

    // Create audio tags by using srcs
    Object.entries(maps).forEach(([name, src]) => {
      // const {audioElement, track} = this.createAudioTag(src)
      // this.tracks[name] = track

      const listener = (evt) => {
        const {audioElement} = this.createAudioTag(src)
        audioElement.volume = 0.5
        // NOTE: On mobile devices, sfx will not play until
        // user completely off their finger from the screen once.
        // This is intended behavior of browser and not a bug.
        // See also:
        //   https://stackoverflow.com/a/53859756
        //   https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
        audioElement.play()
      }
      target.addEventListener(name, listener)
      this.listeners[name] = listener
    })
  }

  createAudioTag(src) {
    const audio = document.createElement('audio')
    audio.setAttribute('controls', 'controls')
    audio.setAttribute('preload', 'auto')
    audio.setAttribute('crossOrigin', 'anonymouse')

    const source = document.createElement('source')
    source.src = src

    audio.appendChild(source)

    return {
      audioElement: audio,
      // track: this.audioContext.createMediaElementSource(audio),
    }
  }

  disconnect() {
    Object.entries(this.listeners).forEach(([k, v]) => {
      this.target.removeEventListener(k, v)
    })
  }
}



