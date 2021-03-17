/*!
 * Copyright (c) 2021 Xvezda <xvezda@naver.com
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
import Util from './util.js'
import Scoreboard from './scoreboard.js'
import Category from './category.js'
import Dice from './dice.js'


class SelectableDice extends Dice {
  constructor() {
    super()
  }

  connectedCallback() {
    super.connectedCallback()
    this.selected = false
  }

  get selected() {
    return this.$selected
  }

  set selected(value) {
    if (this.isRolling) return false

    if (!value) {
      this.dice.style.opacity = ``
    } else {
      this.dice.style.opacity = `0.5`
    }
    this.$selected = value

    return true
  }

  reset() {
    super.reset()
    this.selected = false
  }
}

customElements.define('game-scoreboard', Scoreboard)
customElements.define('game-category', Category)
customElements.define('game-dice', SelectableDice)


export default class Game extends HTMLElement {
  static READY = 0
  static ROLLING = 1
  static STANDBY = 2
  static FINISH = 3

  constructor() {
    super()

    this.attachShadow({mode: 'open'})
    this.init()
  }

  init() {
    this.initState()
    this.initInterface()
    this.initHandler()
  }

  initState() {
    this.status = Game.READY
    this.rolled = 1
    this.eachTurn = 3
    this.playerNumbers = 2
    this.diceCount = 5

    this.resetState()
  }

  resetState() {
    if ('dices' in this) {
      this.dices.forEach(dice => dice.reset())
    }
  }

  initInterface() {
    const style = document.createElement('style')
    this.shadowRoot.appendChild(style)
    this.inlineStyle = style

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
    board.id = 'board'
    this.inlineStyle.textContent += `
      @media screen and (min-width: 1024px) {
        #board {
          display: flex;
          gap: 20px;
        }
      }
    `

    const scoreboard = document.createElement('game-scoreboard')
    scoreboard.setAttribute('player-numbers', this.playerNumbers)
    board.appendChild(scoreboard)
    this.scoreboard = scoreboard

    const category = document.createElement('game-category')
    category.setAttribute('name-table', JSON.stringify({
      ones: 'Ones',
      twos: 'Twos',
      threes: 'Threes',
      fours: 'Fours',
      fives: 'Fives',
      sixes: 'Sixes',
      choice: 'Choice',
      fourOfAKind: 'Four-Of-A-Kind',
      fullHouse: 'Full House',
      littleStraight: 'Little Straight',
      bigStraight: 'Big Straight',
      yacht: 'Yacht',
    }))

    board.appendChild(category)
    this.category = category

    const dicePanel = document.createElement('div')
    dicePanel.style.cssText = `
      display: flex;
      gap: 15px;
      flex-direction: column;
    `

    const diceHolder = document.createElement('div')
    diceHolder.style.cssText = `
      display: flex;
      gap: 5px;
    `
    this.dices = this.createDices(this.diceCount)
    this.dices.forEach((dice) => diceHolder.appendChild(dice))
    dicePanel.appendChild(diceHolder)

    this.button = this.createButton()

    dicePanel.appendChild(this.button)
    board.appendChild(dicePanel)

    container.appendChild(board)
    this.shadowRoot.appendChild(container)
  }

  createDices(number) {
    const dices = Util.arraySizeOf(number).map(() => {
      const dice = document.createElement('game-dice')
      dice.setAttribute('size', 40)
      dice.setAttribute('animation-duration', `150ms`)

      return dice
    })
    return dices
  }

  createButton() {
    const button = document.createElement('button')
    this.inlineStyle.textContent += `
      #rollbtn {
        transition: filter 0.35s, transform 0.35s;
      }

      #rollbtn:hover {
        filter: drop-shadow(2px 5px 6px lightgray);
        transform: translateY(-5px);
      }

      #rollbtn:focus, #rollbtn[disabled] {
        filter: drop-shadow(0px 0px 0px lightgray);
        transform: translateY(0);
      }
    `
    button.id = 'rollbtn'
    button.style.cssText = `
      font-family: "Century Gothic", Futura, sans-serif;
      padding: 10px 20px;
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
        this.dispatchEvent(new CustomEvent('diceroll'))
        this.button.setAttribute('disabled', 'disabled')

        this.dices
          .filter((dice, i) => !dice.selected)
          .forEach((dice, i) => {
          setTimeout(() => {
            dice.roll()
            setTimeout(() => {
              dice.stop()
            }, 1000)
          }, i * 300)
        })

        const dicePromises = this.dices
          .map((dice, i) => (
            new Promise((resolve, reject) => {
              if (dice.selected) {
                resolve({number: dice.number})
              } else {
                dice.addEventListener('stop', (evt) => {
                  this.dispatchEvent(
                    new CustomEvent('dicestop', {
                      detail: {index: i}
                    })
                  )
                  resolve(evt.detail)
                }, {capture: false, once: true})
              }
            })
          ))

        Promise.all(dicePromises)
          .then((results) => {
            const numbers = results.map(result => result.number)
            const scores = Game.calculateScore(numbers)

            this.category.showScores(scores)
            this.emitEventByScore(scores)

            // TODO: Refactoring
            if (this.rolled % this.eachTurn === 0) {
              const args = {
                player: 'player' +
                  (Math.round(this.rolled / this.eachTurn + 1) %
                  this.playerNumbers + 1),
                round: Math.round(this.rolled /
                  (this.eachTurn * this.playerNumbers)),
                // TODO: Implement CPU player
                score: Math.max.apply(null, Object.values(scores)),
              }
              this.scoreboard.setScoreOf(args)

              const isLastPlayer =
                this.rolled % (this.eachTurn * this.playerNumbers) === 0

              const customEvent = new CustomEvent('turnover', {
                detail: {
                  roundOver: isLastPlayer,
                  rolled: this.rolled,
                }
              })
              this.dispatchEvent(customEvent)
            }
            ++this.rolled

            addButtonHandler()
            this.button.removeAttribute('disabled')

            this.status = Game.STANDBY
          })

      }, {capture: false, once: true})
    }
    addButtonHandler()

    this.dices.forEach((dice, i) => {
      dice.style.cursor = 'pointer'
      dice.addEventListener('click', this.onDiceClick.bind(this), false)
    })

    this.addEventListener('turnover', this.onTurnOver.bind(this), false)
    this.addEventListener('diceroll', this.onDiceRoll.bind(this), false)
    this.addEventListener('dicestop', this.onDiceStop.bind(this), false)
    this.addEventListener('yacht', this.onYacht.bind(this), false)

    this.scoreboard
      .addEventListener('updatescore', this.onUpdateScore.bind(this), false)
    this.category
      .addEventListener('selectcategory', this.onSelectCategory.bind(this), false)
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
      choice: sum(numbers),
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

  nextTurn() {
    if (this.status !== Game.READY) {
      this.resetState()
    }
  }

  nextRound() {
    this.resetState()
  }

  onDiceRoll(event) {
    this.status = Game.ROLLING

    // https://freesound.org/people/AbdrTar/sounds/519419/
    Util.playAudioBySrc('assets/519419__abdrtar__dice-sound.mp3')
  }

  onDiceClick(event) {
    const dice = event.target
    if (this.rolled % this.eachTurn === 1 ||
      this.status === Game.ROLLING) return

    if (dice.selected) {
      dice.selected = false
    } else if (this.dices.filter(dice => dice.selected).length < 4) {
      dice.selected = true
      Util.playAudioBySrc('assets/sfx_lock.wav', {volume: 0.4})
    }
  }

  onDiceStop(event) {
    Util.playAudioBySrc('assets/513481__budek__click.wav', {volume: 0.4})
  }

  onTurnOver(event) {
    console.log('onTurnOver:', event)

    this.status = Game.STANDBY
    this.resetState()
  }

  onYacht(event) {
    // https://freesound.org/people/nickrave/sounds/245639/
    Util.playAudioBySrc('assets/245639__nickrave__moreclaps.wav', {
      volume: 0.6,
    })
  }

  onUpdateScore(event) {
    Util.playAudioBySrc('assets/sfx_writing.wav')
  }

  onSelectCategory(event) {
    console.log('category:', event)
  }
}
