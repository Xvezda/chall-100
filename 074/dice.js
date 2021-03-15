export default class Dice extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({mode: 'open'})

    this.initDice()
    this.initAnimate()
  }

  initDice() {
    const root = this.shadowRoot

    const dice = document.createElement('div')
    dice.style.cssText = `
      position: relative;
      width: 100px;
      height: 100px;
      border: 3px solid darkgray;
      border-radius: 15px;
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

    this.number = 1
    dice.appendChild(this.sides[this.number-1])

    root.appendChild(dice)
  }

  initAnimate() {
    const root = this.shadowRoot

    this.animationDuration = `300ms`

    const animateStyle = document.createElement('style')
    animateStyle.textContent = `
      .rollout {
        animation-timing-function: ease;
        animation-duration: ${this.animationDuration};
        animation-name: roll;
        animation-fill-mode: both;
      }

      .rollin {
        animation-timing-function: ease;
        animation-delay: 100ms;
        animation-duration: ${this.animationDuration};
        animation-name: roll;
      }

      @keyframes roll {
        from {
          transform: translateY(0%);
        }
        to {
          transform: translateY(-100%);
        }
      }
    `
    root.appendChild(animateStyle)
  }

  roll() {
    if ('isRolling' in this && this.isRolling) return

    this.isRolling = true
    let nextNumber
    do {
      nextNumber = Math.floor(Math.random()*this.sides.length + 1)
    } while (this.number === nextNumber)

    this.setUpside(nextNumber)
    this.number = nextNumber

    this.dispatchEvent(new CustomEvent('roll', {detail: {number: this.number}}))
  }

  stop() {
    this.isRolling = false
    this.dispatchEvent(new CustomEvent('stop'))
  }

  setUpside(number) {
    if (this.number === number) {
      this.stop()
      return
    }

    this.dispatchEvent(new AnimationEvent('animationstart'))

    const prevSide = this.dice.querySelector('.side')
    const nextSide = this.sides[number-1]
    this.dice.appendChild(nextSide)

    nextSide.addEventListener('animationend', () => {
      prevSide.classList.remove('rollout')
      this.dice.removeChild(prevSide)

      nextSide.classList.remove('rollin')

      this.dispatchEvent(new AnimationEvent('animationend'))

      if (this.isRolling) {
        this.stop()
        this.roll()
      } else {
        this.stop()
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
}

