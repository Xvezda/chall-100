/*!
 * Copyright (c) 2021 Xvezda <xvezda@naver.com
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */


export const arraySizeOf = (n) => Array(n).fill(0)

export const snakeToCamel = (snake) => (
  snake.replace(/-([a-zA-Z])/, (_, m) => m.toUpperCase())
)

export const attributesToObject = (attributes) => {
  const entries = Object.values(attributes).map(a => [a.name, a.value])

  entries
    .forEach((entry, _, original) => {
      const [key, value] = entry
      if (key.includes('-')) {
        original.push([snakeToCamel(key), value])
      }
    })

  return Object.fromEntries(entries)
}

export const playAudioBySrc = (src, options) => {
  const audio = new Audio(src)

  audio.volume = options && options.volume || 1.0
  audio.play()

  return audio
}


export default {
  arraySizeOf,
  snakeToCamel,
  attributesToObject,
  playAudioBySrc,
}
