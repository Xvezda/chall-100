/*!
 * Copyright (c) 2021 Xvezda <xvezda@naver.com
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
import Util from './util.js'
import Dice from './dice.js'


// TODO: Implement CPU player
export default class Game extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({mode: 'open'})
    this.init()
  }

  init() {
    this.rolled = 1

    this.initInterface()
    this.initHandler()
  }

  initInterface() {
    const container = document.createElement('div')
    container.style.cssText = `
      display: flex;
      width: 100vw;
      height: 100vh;
      flex-direction: column;
      gap: 20px;
      justify-content: center;
      align-items: center;
    `
    const board = document.createElement('div')
    board.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 20px;
    `

    this.dices = this.createDices()
    const diceHolder = document.createElement('div')
    diceHolder.style.cssText = `
      display: flex;
      gap: 5px;
    `
    this.dices.forEach((dice) => diceHolder.appendChild(dice))
    board.appendChild(diceHolder)

    this.button = this.createButton()

    board.appendChild(this.button)

    container.appendChild(board)
    this.shadowRoot.appendChild(container)
  }

  createScoreboard() {
    // TODO: Rewrite scoreboard with custom element
    const scoreboard = (() => {
      const table = document.createElement('table')

      const createHeader = () => {
        const thead = document.createElement('thead')
        const tr = document.createElement('tr')

        ;['rounds', 'bar', 'baz'].forEach((v) => {
          const th = document.createElement('th')
          th.style.cssText = `
            padding: 10px 20px;
            background-color: lightgray;
          `
          th.textContent = v
          tr.appendChild(th)
        })

        thead.appendChild(tr)
        table.appendChild(thead)
      }
      createHeader()

      const createBody = () => {
        // Total 12 rounds
        const tbody = document.createElement('tbody')
        Util.arraySizeOf(12).forEach((v, i) => {
          const tr = document.createElement('tr')
          tr.style.cssText = `
            border-bottom: 1px solid darkgray;
          `
          const th = document.createElement('th')
          th.scope = 'row'
          th.style.cssText = `
            padding: 10px 20px;
          `

          th.textContent = i
          tr.appendChild(th)
          tbody.appendChild(tr)
        })
        table.appendChild(tbody)
      }
      createBody()

      return table
    })()
    return scoreboard
  }

  createDices() {
    customElements.define('game-dice', Dice)

    const dices = Util.arraySizeOf(5).map(() => {
      const dice = document.createElement('game-dice')
      dice.setAttribute('size', 60)
      dice.setAttribute('animation-duration', `150ms`)

      return dice
    })
    return dices
  }

  createButton() {
    const button = document.createElement('button')
    button.style.cssText = `
      padding: 15px 20px;
      border-radius: 10px;
      border-width: 0;
      font-size: 24px;
      background-color: lightblue;
    `
    button.textContent = 'Roll'
    this.rollButton = button

    return button

  }

  initHandler() {
    const addButtonHandler = () => {
      this.button.addEventListener('click', (evt) => {
        this.dispatchEvent(new CustomEvent('rolled'))
        this.button.setAttribute('disabled', 'disabled')

        this.dices
          .filter(dice => dice.dataset.hold !== `true`)
          .forEach((dice, i) => {
          setTimeout(() => {
            dice.roll()
            setTimeout(() => {
              dice.stop()
            }, 1000)
          }, i * 300)
        })

        const dicePromises = this.dices
          .map((dice) => (
            new Promise((resolve, reject) => {
              if (dice.dataset.hold === `true`) {
                resolve({number: dice.number})
              } else {
                dice.addEventListener('stop', (evt) => {
                  resolve(evt.detail)
                }, {capture: false, once: true})
              }
            })
          ))

        Promise.all(dicePromises)
          .then((results) => {
            const numbers = results.map(result => result.number)
            const scores = Game.calculateScore(numbers)

            this.emitEventByScore(scores)

            ++this.rolled

            addButtonHandler()
            this.button.removeAttribute('disabled')
          })

      }, {capture: false, once: true})
    }
    addButtonHandler()

    const hold = (dice) => {
      dice.dataset.hold = `true`
      dice.style.opacity = `0.5`
    }

    const release = (dice) => {
      dice.dataset.hold = `false`
      dice.style.opacity = ``
    }

    this.dices.forEach(dice => {
      dice.dataset.hold = `false`
      dice.addEventListener('click', (evt) => {
        if (this.rolled === 1) return

        const isHold = dice.dataset.hold === `true`
        if (isHold) {
          release(dice)
        } else {
          hold(dice)
        }
      }, false)
    })

    this.addEventListener('rolled', () => {
      // https://freesound.org/people/AbdrTar/sounds/519419/
      Util.playAudioBySrc('assets/519419__abdrtar__dice-sound.mp3')
    })

    this.addEventListener('yacht', () => {
      // https://freesound.org/people/nickrave/sounds/245639/
      Util.playAudioBySrc('assets/245639__nickrave__moreclaps.wav', {
        volume: 0.6,
      })
    })
  }

  emitEventByScore(score) {
    console.log(`rolled: ${this.rolled}`)
    console.table(score)

    if (score.yacht > 0) {
      this.dispatchEvent(new CustomEvent('yacht'))
    }
  }

  static calculateScore(numbers) {
    const sum = (array) => array.reduce((a, b) => a + b, 0)
    const count = (array, i) => array.filter(v => v === i).length
    const possibles = [1, 2, 3, 4, 5, 6]

    // NOTE: https://en.wikipedia.org/wiki/Yacht_(dice_game)#Scoring
    const scores = {
      ones: sum(numbers.filter(v => v === 1)),
      twos: sum(numbers.filter(v => v === 2)),
      threes: sum(numbers.filter(v => v === 3)),
      fours: sum(numbers.filter(v => v === 4)),
      fives: sum(numbers.filter(v => v === 5)),
      sixes: sum(numbers.filter(v => v === 6)),
      choies: sum(numbers),
      fourOfAKind: (() => {
        const found = possibles.find(n => count(numbers, n) === 4)
        return found ? found * 4 : 0
      })(),
      fullHouse: (() => {
        const counts = possibles.map(n => count(numbers, n))
        return counts.find(n => n === 2) && counts.find(n => n === 3) ?
          sum(numbers) : 0
      })(),
      littleStraight: possibles.slice(0, -1)
        .every(n => numbers.includes(n)) ?
        30 : 0,
      bigStraight: possibles.slice(1)
        .every(n => numbers.includes(n)) ?
        30 : 0,
      yacht: possibles
        .some(n => count(numbers, n) === numbers.length) ?
        50 : 0,
    }
    return scores
  }
}
