class App {
  static PAUSED = 0
  static PLAYING = 1

  constructor(parent) {
    this.playStatus = App.PAUSED
    this.totalFrames = 10
    this.currentFrame = 1
    this.frames = Array(this.totalFrames).fill(null)

    this.container = document.createElement('div')
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100vw;
      height: 100vh;
      row-gap: 10px;
    `

    this.stage = document.createElement('div')
    this.stageWidth = 800
    this.stageHeight = 600

    this.stage.style.cssText = `
      width: ${this.stageWidth}px;
      height: ${this.stageHeight}px;
      border: 1px solid gray;
      overflow: hidden;
    `
    this.stage.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    this.stage.addEventListener('mouseup', this.onMouseUp.bind(this), false)
    this.container.appendChild(this.stage)

    this.boxX = 100
    this.boxY = 100
    this.addKeyFrame([this.boxX, this.boxY])

    this.box = document.createElement('div')
    this.box.style.cssText = `
      width: 100px;
      height: 100px;
      background-color: crimson;
      transform: translate3D(${this.boxX}px, ${this.boxY}px, 0)
    `
    this.stage.appendChild(this.box)

    this.controls = document.createElement('div')
    this.controls.style.cssText = `
      display: flex;
      column-gap: 5px;
      width: ${this.stageWidth}px;
    `

    this.frameView = document.createElement('input')
    this.frameView.type = 'text'
    this.frameView.value = `${this.currentFrame}/${this.totalFrames}`
    this.controls.appendChild(this.frameView)

    this.slider = document.createElement('input')
    this.slider.type = 'range'
    this.slider.max = this.totalFrames
    this.slider.min = 1
    this.slider.step = 1
    this.slider.value = this.currentFrame
    this.slider.style.cssText = `
      width: 800px;
    `
    this.slider.addEventListener('input', this.onInput.bind(this), false)
    this.controls.appendChild(this.slider)

    this.playButton = document.createElement('button')
    const playButtonInit = () => {
      this.playButton.textContent = 'play'
      this.playButton.addEventListener('click', (evt) => {
        this.play()
        this.playButton.textContent = 'pause'

        this.playButton.addEventListener('click', (evt) => {
          this.pause()
          playButtonInit()
        }, {capture: false, once: true})
      }, {capture: false, once: true})
    }
    playButtonInit()
    this.controls.appendChild(this.playButton)

    this.stopButton = document.createElement('button')
    this.stopButton.textContent = 'stop'
    this.stopButton.addEventListener('click', (evt) => {
      this.playStatus = App.PAUSED
    })
    this.controls.appendChild(this.stopButton)

    this.container.appendChild(this.controls)

    parent.appendChild(this.container)
  }

  play() {
    console.log('playing')
    this.playStatus = App.PLAYING
    // TODO: Change with rFA
    this.interval = window.setInterval(() => {
      this.onChangeFrame((this.currentFrame % this.totalFrames) + 1)
    }, 500)
  }

  pause() {
    this.playStatus = App.PAUSED
    window.clearInterval(this.interval)
  }

  stop() {
    this.playStatus = App.PAUSED
    this.onChangeFrame(1)
  }

  onInput(event) {
    const frameNumber = event.target.value
    this.onChangeFrame(frameNumber)
  }

  onChangeFrame(frameNumber) {
    this.slider.value = frameNumber
    this.currentFrame = frameNumber
    this.frameView.value = `${this.currentFrame}/${this.totalFrames}`

    const currentFrame = this.getFrame(this.currentFrame)
    if (currentFrame === null) {
      const keyframe = this.findPrevKeyFrame(this.currentFrame)
      if (!keyframe) return

      const [x, y] = keyframe
      this.moveObject(this.box, [x, y])
    } else {
      // FIXME: Hardcoded
      const [x, y] = currentFrame
      this.moveObject(this.box, [x, y])
    }
  }

  onMouseDown(event) {
    this.mouseMoveHandler = this.onMouseMove.bind(this)
    this.stage.addEventListener('mousemove', this.mouseMoveHandler, false)
  }

  onMouseMove(event) {
    window.requestAnimationFrame(() => {
      const offsetX = event.pageX - this.box.offsetLeft
      const offsetY = event.pageY - this.box.offsetTop

      // FIXME: Hardcoded
      this.moveObject(this.box, [offsetX, offsetY])
    })
  }

  onMouseUp(event) {
    this.stage.removeEventListener('mousemove', this.mouseMoveHandler)

    const offsetX = event.pageX - this.box.offsetLeft
    const offsetY = event.pageY - this.box.offsetTop

    this.addKeyFrame([offsetX, offsetY])
  }

  findPrevKeyFrame(frameNumber) {
    const prevFrames = this.frames.slice(0, frameNumber)
    prevFrames.reverse()

    return prevFrames.find(frame => frame !== null)
  }

  addKeyFrame(frame) {
    console.log(`${this.currentFrame}: ${frame}`)
    this.setFrame(this.currentFrame, frame)
  }

  getFrame(frameNumber) {
    return this.frames[frameNumber-1]
  }

  setFrame(frameNumber, frame) {
    this.frames[frameNumber-1] = frame
  }

  getKeyFrames() {
    return this.frames.filter(frame => frame !== null)
  }

  moveObject(object, position) {
    // TODO: Frames can contain more information than x, y positions.
    const [x, y] = position
    object.style.transform = `translate3D(${x}px, ${y}px, 0)`
  }
}

window.onload = (evt) => new App(document.body)
