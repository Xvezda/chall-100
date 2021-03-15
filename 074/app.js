import Dice from './dice.js'

class App {
  constructor(parent) {
    const container = document.createElement('div')
    container.style.cssText = `
      display: flex;
      width: 100vw;
      height: 100vh;
      flex-direction: column;
      gap: 15px;
      justify-content: center;
      align-items: center;
    `

    customElements.define('game-dice', Dice)
    const dice = document.createElement('game-dice')

    dice.addEventListener('roll', (evt) => {
      console.log('dice:', evt.detail.number)

      const audio = new Audio('assets/348959__agaxly__sticks.wav')
      audio.play()
    })
    container.appendChild(dice)

    const controls = document.createElement('div')
    const start = document.createElement('button')
    const stop = document.createElement('button')

    start.textContent = 'start'
    stop.textContent = 'stop'

    const buttonStyle = `
      font-size: 1rem;
      padding: 10px;
    `
    start.style.cssText = stop.style.cssText = buttonStyle

    start.addEventListener('click', () => dice.roll())
    stop.addEventListener('click', () => dice.stop())

    controls.appendChild(start)
    controls.appendChild(stop)

    container.appendChild(controls)
    parent.appendChild(container)
  }
}


window.onload = (evt) => new App(document.body)

