class App {
  static PAUSED = 0
  static PLAYING = 1

  constructor(parent) {
    this.playStatus = App.PAUSED
    this.totalFrames = 100
    this.currentFrame = 1
    this.framePerSecond = 60
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

    this.animationStyle = document.createElement('style')
    this.container.appendChild(this.animationStyle)

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
    this.box.id = 'box'
    this.box.setAttribute('tabindex', 0)
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
      flex-direction: column;
      row-gap: 10px;
      width: ${this.stageWidth}px;
    `

    this.timeline = document.createElement('div')
    this.timeline.style.cssText = `
      display: flex;
      column-gap: 5px;
      width: 100%;
    `

    this.frameView = document.createElement('input')
    this.frameView.setAttribute('readonly', 'readonly')
    this.frameView.type = 'text'
    this.frameView.value = `${this.currentFrame}/${this.totalFrames}`
    this.timeline.appendChild(this.frameView)

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
    this.timeline.appendChild(this.slider)

    this.controls.appendChild(this.timeline)

    const tickmarks = document.createElement('datalist')
    tickmarks.id = 'tickmarks'
    Array(this.totalFrames).fill().forEach((_, i) => {
      const option = document.createElement('option')
      option.setAttribute('value', i+1)

      tickmarks.appendChild(option)
    })
    this.slider.setAttribute('list', tickmarks.id)
    this.controls.appendChild(tickmarks)

    this.buttons = document.createElement('div')
    this.buttons.style.cssText = `
      display: flex;
      column-gap: 5px;
      width: 100%;
    `

    this.playButton = document.createElement('button')
    this.playButton.style.width = '100px'
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
    this.buttons.appendChild(this.playButton)
    this.controls.appendChild(this.buttons)

    // this.stopButton = document.createElement('button')
    // this.stopButton.textContent = 'stop'
    // this.stopButton.addEventListener('click', (evt) => {
    //   this.stop()
    // })
    // this.controls.appendChild(this.stopButton)

    this.prevButton = document.createElement('button')
    this.prevButton.style.width = '100px'
    this.prevButton.textContent = 'prev'
    this.prevButton.addEventListener('click', () => {
      const keyframe = this.findPrevKeyFrame(this.currentFrame-1)
      if (!keyframe) return

      this.onChangeFrame(keyframe.index)
    }, false)

    this.buttons.appendChild(this.prevButton)

    this.nextButton = document.createElement('button')
    this.nextButton.style.width = '100px'
    this.nextButton.textContent = 'next'
    this.nextButton.addEventListener('click', () => {
      const keyframe = this.findNextKeyFrame(this.currentFrame+1)
      if (!keyframe) return

      this.onChangeFrame(keyframe.index)
    }, false)

    this.buttons.appendChild(this.nextButton)


    this.container.appendChild(this.controls)

    parent.appendChild(this.container)
  }

  createAnimation(name, from, to) {
    const startFrame = this.getFrame(from)
    const endFrame = this.getFrame(to)

    console.assert(startFrame !== null && endFrame !== null)

    const [startX, startY] = startFrame
    const [endX, endY] = endFrame

    return `
      @keyframes ${name} {
        from {
          transform: translate3D(${startX}px, ${startY}px, 0);
        }
        to {
          transform: translate3D(${endX}px, ${endY}px, 0);
        }
      }
    `
  }

  play() {
    console.log('playing')
    this.playStatus = App.PLAYING
    // TODO: Change with rFA
    this.interval = window.setInterval(() => {
      this.onChangeFrame((this.currentFrame % this.totalFrames) + 1)
    }, 1000 / this.framePerSecond)
  }

  pause() {
    this.playStatus = App.PAUSED
    window.clearInterval(this.interval)
  }

  stop() {
    this.pause()
    this.onChangeFrame(1)
  }

  onInput(event) {
    const frameNumber = parseInt(event.target.value)
    console.log('input:', frameNumber)
    this.onChangeFrame(frameNumber)
  }

  onChangeFrame(frameNumber) {
    if (this.slider.value !== frameNumber.toString()) {
      this.slider.value = frameNumber
    }
    this.currentFrame = frameNumber
    this.frameView.value = `${this.currentFrame}/${this.totalFrames}`

    const prevKeyFrame = this.findPrevKeyFrame(this.currentFrame)
    const nextKeyFrame = this.findNextKeyFrame(this.currentFrame) || prevKeyFrame

    const singleFrameSecond = 1000 / this.framePerSecond
    const frameDistance = frameNumber - prevKeyFrame.index
    console.log('distance:', frameDistance,
      ', second:', frameDistance * singleFrameSecond)
    console.log('prevIndex:', prevKeyFrame.index, ', nextIndex:', nextKeyFrame.index)

    const animation = this.createAnimation(
      'movement', prevKeyFrame.index, nextKeyFrame.index)
    this.animationStyle.textContent = animation

    // FIXME: hardcoded
    // this.box.style.transform = ``
    this.box.style.animationName = 'movement'
    this.box.style.animationPlayState = 'paused'
    this.box.style.animationDuration =
      `${Math.round((nextKeyFrame.index - prevKeyFrame.index) * singleFrameSecond)}ms`
    this.box.style.animationFillMode = 'both'
    this.box.style.animationIterationCount = `infinite`
    this.box.style.animationDelay = `-${Math.round(frameDistance * singleFrameSecond)}ms`
  }

  onMouseDown(event) {
    if (this.playStatus !== App.PAUSED) return

    this.mouseMoveHandler = this.onMouseMove.bind(this)
    this.stage.addEventListener('mousemove', this.mouseMoveHandler, false)
    this.box.style.animationName = 'none'
  }

  onMouseMove(event) {
    // FIXME: Hardcoded
    if (document.activeElement !== this.box) return
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

    const found = prevFrames.find(frame => frame !== null)
    if (!found) {
      return null
    }

    return {
      index: prevFrames.length - prevFrames.findIndex(frame => frame !== null),
      frame: found,
    }
  }

  findNextKeyFrame(frameNumber) {
    const nextFrames = this.frames.slice(frameNumber)

    const found = nextFrames.find(frame => frame !== null)
    if (!found) {
      return null
    }

    return {
      index: frameNumber + 1 + nextFrames.findIndex(frame => frame !== null),
      frame: found,
    }
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
