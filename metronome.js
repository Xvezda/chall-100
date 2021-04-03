export const MIN_IN_MS = 60 * 1000
export default class Metronome extends EventTarget {
  constructor(attrs) {
    super()

    this.attrs = {
      bpm: 120,
      ...attrs,
    }
    this.animationRunning = false
    this.latestIteration = 0.0

    this.canvas = this.createElement('svg')
    this.canvas.style.cssText = `max-width: 100%;`
    this.width = 600
    this.height = 600
    this.canvas.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`)
    this.canvas.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    this.defs = this.createElement('defs')
    this.canvas.appendChild(this.defs)

    const style = this.createElement('style')
    style.setAttribute('type', 'text/css')
    this.canvas.appendChild(style)

    this.style = style
    this.draw()
  }

  createElement(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name)
  }

  draw() {
    this.drawClipPath()
    this.drawBase()
    this.drawBackground()
    this.drawDetail()
  }

  drawClipPath() {
    const clipPath = this.createElement('clipPath')
    clipPath.setAttribute('id', 'metronomeClipPath')

    const center = Math.floor(this.width / 2)
    const path = this.createElement('path')
    path.setAttribute('d', `
      M ${center-70} 100
      Q ${center} 50, ${center+70} 100
      Q ${center+110} 400, ${center+100} 510
      L ${center-100} 510
      Q ${center-110} 400, ${center-70} 100
    `)
    clipPath.appendChild(path)
    this.defs.appendChild(clipPath)
  }

  drawBase() {
    this.base = this.createElement('g')
    this.base.setAttribute('clip-path', 'url(#metronomeClipPath)')

    this.canvas.appendChild(this.base)
  }

  drawBackground() {
    const rect = this.createElement('rect')
    rect.setAttribute('x', 0)
    rect.setAttribute('y', 0)
    rect.setAttribute('width', this.width)
    rect.setAttribute('height', this.height)

    rect.setAttribute('fill', '#333')

    this.base.appendChild(rect)
  }

  drawDetail() {
    const stickGroup = this.createElement('g')
    stickGroup.setAttribute('id', 'stickGroup')
    const stick = this.createElement('rect')

    const stickWidth = 10
    const stickHeight = this.height - 200
    stick.setAttribute('x', Math.floor(this.width/2 - stickWidth/2))
    stick.setAttribute('y', 100)
    stick.setAttribute('width', stickWidth)
    stick.setAttribute('height', stickHeight)
    stick.setAttribute('fill', 'darkgray')
    stickGroup.appendChild(stick)

    const weight = this.createElement('rect')
    const weightWidth = 50
    weight.setAttribute('x', Math.floor(this.width/2 - weightWidth/2))
    weight.setAttribute('y', 250)
    weight.setAttribute('width', weightWidth)
    weight.setAttribute('height', weightWidth)
    weight.setAttribute('fill', 'darkgray')
    stickGroup.appendChild(weight)

    // Using CSS3 animation
    const bpmMs = this.getBpmMs(this.attrs.bpm)
    this.style.textContent = `
      #stickGroup {
        transform-origin: center ${this.height - 100}px;
        animation-name: stick-move;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        animation-timing-function: ease-in-out;
        animation-fill-mode: both;

        animation-duration: ${bpmMs}ms;
        animation-delay: -${Math.floor(bpmMs/2)}ms;
        animation-play-state: paused;
      }

      @keyframes stick-move {
        from {
          transform: rotate(-30deg);
        }
        to {
          transform: rotate(30deg);
        }
      }
    `

    stickGroup.addEventListener(
      'animationstart', this.onAnimationStart.bind(this), false)
    stickGroup.addEventListener(
      'animationiteration', this.onAnimationIteration.bind(this), false)
    stickGroup.addEventListener(
      'animationend', this.onAnimationEnd.bind(this), false)

    this.canvas.appendChild(stickGroup)
    this.stick = stickGroup

    const cover = this.createElement('rect')
    cover.setAttribute('x', 0)
    cover.setAttribute('y', 350)
    cover.setAttribute('width', this.width)
    cover.setAttribute('height', Math.floor(this.height/2))
    cover.setAttribute('fill', '#222')
    cover.setAttribute('clip-path', 'url(#metronomeClipPath)')

    this.canvas.appendChild(cover)
  }

  onAnimationStart(event) {
    console.log('animation start:', event)
  }

  onAnimationIteration(event) {
    console.log('animation iteration:', event)

    this.animationRunning = true
    this.dispatchEvent(new CustomEvent('iteration'))
  }

  onAnimationEnd(event) {
    console.log('animation end:', event)

    this.animationRunning = false
    this.latestIteration = event.elapsedTime
  }

  start(event) {
    this.stick.style.animationPlayState = 'running'
  }

  stop(event) {
    this.stick.style.animationPlayState = 'paused'
    this.animationRunning = false
  }

  set bpm(value) {
    const bpmMs = this.getBpmMs(value)
    this.stick.style.animationDuration = `${bpmMs}ms`
  }

  getBpmMs(bpm) {
    return Math.floor(MIN_IN_MS / bpm)
  }

  appendTo(parent) {
    parent.appendChild(this.canvas)
  }

  set width(value) {
    this.canvas.setAttribute('width', value)
  }

  get width() {
    return parseInt(this.canvas.getAttribute('width'))
  }

  set height(value) {
    this.canvas.setAttribute('height', value)
  }

  get height() {
    return parseInt(this.canvas.getAttribute('height'))
  }
}


