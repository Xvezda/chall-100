/*!
 * Copyright (c) 2021 Xvezda <xvezda@naver.com
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Util from './util.js'


export default class Dice extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    this.attrs = {
      initNumber: 1,
      size: 100,
      animationDuration: `300ms`,
      ...Util.attributesToObject(this.attributes),
    }

    this.initDice()
    this.initAnimate()
  }

  initDice() {
    const root = this.shadowRoot

    this.number = parseInt(this.attrs.initNumber)

    const dice = document.createElement('div')
    dice.style.cssText = `
      position: relative;
      width: ${this.attrs.size}px;
      height: ${this.attrs.size}px;
      border: 3px solid darkgray;
      border-radius: 15%;
      overflow: hidden;
      background-color: white;
    `
    root.appendChild(dice)
    this.dice = dice

    const createSide = ({
      dotArray,
      dotStyle,
      layoutStyle,
      partitionStyle
    }) => {
      const side = document.createElement('div')
      side.classList.add('side')
      side.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
      `

      const layout = document.createElement('div')
      layout.style.cssText = layoutStyle

      dotArray.forEach((v) => {
        const partition = document.createElement('div')
        partition.style.cssText = partitionStyle
        if (v) {
          const dot = document.createElement('div')
          dot.style.cssText = dotStyle
          partition.appendChild(dot)
        }
        layout.appendChild(partition)
      })
      side.appendChild(layout)

      return side
    }

    this.sides = [
      createSide({
        dotArray: [1],
        dotStyle: `
          border-radius: 50%;
          width: 33%;
          height: 33%;
          background-color: crimson;
        `,
        layoutStyle: `
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          height: 100%;
        `,
        partitionStyle: `
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        `
      }),
      createSide({
        dotArray: [1, 0, 0, 1],
        dotStyle: `
          border-radius: 50%;
          width: 50%;
          height: 50%;
          background-color: black;
        `,
        layoutStyle: `
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          height: 100%;
        `,
        partitionStyle: `
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 50%;
          height: 50%;
        `
      }),
      createSide({
        dotArray: [1, 0, 0, 0, 1, 0, 0, 0, 1],
        dotStyle: `
          border-radius: 50%;
          width: 80%;
          height: 80%;
          background-color: black;
        `,
        layoutStyle: `
          display: flex;
          flex-wrap: wrap;
          width: 80%;
          height: 80%;
        `,
        partitionStyle: `
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 33%;
          height: 33%;
        `,
      }),
      createSide({
        dotArray: [1, 1, 1, 1],
        dotStyle: `
          border-radius: 50%;
          width: 50%;
          height: 50%;
          background-color: black;
        `,
        layoutStyle: `
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          height: 100%;
        `,
        partitionStyle: `
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 50%;
          height: 50%;
        `
      }),
      createSide({
        dotArray: [1, 0, 1, 0, 1, 0, 1, 0, 1],
        dotStyle: `
          border-radius: 50%;
          width: 80%;
          height: 80%;
          background-color: black;
        `,
        layoutStyle: `
          display: flex;
          flex-wrap: wrap;
          width: 80%;
          height: 80%;
        `,
        partitionStyle: `
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 33%;
          height: 33%;
        `,
      }),
      createSide({
        dotArray: [1, 1, 1, 1, 1, 1],
        dotStyle: `
          border-radius: 50%;
          width: 80%;
          height: 80%;
          background-color: black;
        `,
        layoutStyle: `
          display: flex;
          flex-wrap: wrap;
          width: 90%;
          height: 90%;
          transform: rotate(90deg);
        `,
        partitionStyle: `
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 33%;
          height: 33%;
          transform: translateY(25%);
        `,
      })
    ]
    dice.appendChild(this.sides[this.number-1])

    root.appendChild(dice)
  }

  initAnimate() {
    const root = this.shadowRoot

    const animateStyle = document.createElement('style')
    animateStyle.textContent = `
      .rollout {
        animation-name: roll-dice;
        animation-timing-function: ease;
        animation-duration: ${this.attrs.animationDuration};
        animation-fill-mode: both;
      }

      .rollin {
        animation-name: roll-dice;
        animation-timing-function: ease;
        animation-duration: ${this.attrs.animationDuration};
        animation-delay: 100ms;
      }

      @keyframes roll-dice {
        from {
          transform: translateY(0%);
        }
        to {
          transform: translateY(-100%);
        }
      }
    `
    /*
    animateStyle.textContent += `
      .threw {
        animation-name: throw-dice;
        animation-timing-function: ease;
        animation-duration: 800ms;
        animation-count-iteration: infinite;
      }

      @keyframes throw-dice {
        0% {
          filter: drop-shadow(0px 0px 0px gray);
          transform: translateY(0%);
        }
        30% {
          filter: drop-shadow(8px 12px 12px gray);
          transform: translateY(-50%);
        }
        60% {
          filter: drop-shadow(0px 0px 0px gray);
          transform: translateY(0%);
        }
        75% {
          filter: drop-shadow(6px 8px 10px gray);
          transform: translateY(-25%);
        }
        90% {
          filter: drop-shadow(0px 0px 0px gray);
          transform: translateY(0%);
        }
        95% {
          drop-shadow(4px 6px 8px gray);
          transform: translateY(-15%);
        }
        100% {
          filter: drop-shadow(0px 0px 0px gray);
          transform: translateY(0%);
        }
      }
    `
    */
    root.appendChild(animateStyle)
  }

  roll() {
    if ('isRolling' in this && this.isRolling) return

    /*
    this.dice.classList.add('threw')
    this.addEventListener('stop', () => {
      this.dice.classList.remove('threw')
    }, {capture: false, once: true})
    */

    this.isRolling = true
    const nextNumber = this.getNextNumber()

    this.dispatchEvent(new CustomEvent('roll', {detail: {number: this.number}}))
    this.setUpside(nextNumber)
  }

  stop() {
    if (!this.isRolling) {
      this.dispatchEvent(new CustomEvent('stop', {
        detail: {
          number: this.number
        }
      }))
    } else {
      this.isRolling = false
    }
  }

  setUpside(number) {
    if (this.number === number) {
      this.stop()
      return
    }
    this.number = number

    this.dispatchEvent(new AnimationEvent('animationstart'))

    const prevSide = this.dice.querySelector('.side')
    const nextSide = this.sides[number-1]
    this.dice.appendChild(nextSide)

    nextSide.addEventListener('animationend', () => {
      prevSide.classList.remove('rollout')
      this.dice.removeChild(prevSide)

      nextSide.classList.remove('rollin')

      this.dispatchEvent(new AnimationEvent('animationend'))

      if (!this.isRolling) {
        this.stop()
      } else {
        this.isRolling = false
        this.roll()
      }
    }, {capture: false, once: true})

    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Tips#javascript_content
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        prevSide.classList.add('rollout')
      })
    })
    nextSide.classList.add('rollin')
  }

  getNextNumber() {
    let nextNumber
    do {
      nextNumber = Math.floor(Math.random()*this.sides.length + 1)
    } while (this.number === nextNumber)
    return nextNumber
  }

  reset() {
    this.setUpside(this.attrs.initNumber)
  }
}

