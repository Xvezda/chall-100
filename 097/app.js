const throttle = (callback) => {
  let ticking = false
  return (...args) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        ticking = false
        callback(...args)
      })
    }
    ticking = true
  }
}

const debounce = (callback, time) => {
  let id
  return (...args) => {
    clearTimeout(id)
    id = setTimeout(() => callback(...args), time)
  }
}

// TODO: Add spinner for resource loading
class App {
  constructor(parent) {
    const canRadius = 100
    const canHeight = canRadius * 4

    this.style = document.createElement('style')
    parent.appendChild(this.style)

    this.container = document.createElement('div')
    this.container.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;
    `

    this.subcontainer = document.createElement('div')
    this.subcontainer.style.cssText = `
      width: 100%;
      height: 100%;

      perspective: 500px;
    `
    this.container.appendChild(this.subcontainer)

    this.can = document.createElement('div')
    this.can.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;

      transform-style: preserve-3d;
      transition: transform 1s ease;
    `

    this.style.textContent += `
      @keyframes rotation {
        from {
          transform: rotateY(360deg);
        }
        to {
          transform: rotateY(0deg);
        }
      }
    `
    this.subcontainer.appendChild(this.can)

    const topDepth = 15
    const bottomDepth = 15
    const shrinkRadius = 20
    const bottomRadius = (canRadius*2 - shrinkRadius) / 2

    this.downside = document.createElement('div')
    this.downside.style.cssText = `
      position: absolute;
      width: ${bottomRadius*2}px;
      height: ${bottomRadius*2}px;
      background-color: dimgray;
      background-image: url(assets/bottom.svg);
      background-size: cover;
      background-position: center center;
      border-radius: 50%;
      transform:
        translateX(${-bottomRadius}px)
        translateY(${canHeight/2 - bottomRadius}px)
        rotateX(270deg);
      -webkit-backface-visibility: hidden;
    `
    this.can.appendChild(this.downside)

    const sidePlanesNumber = 24
    const totalWidth = 2*Math.PI * canRadius
    /* Add extra 1px to fill the gap */
    const extraPixel = 1
    const singleWidth = totalWidth / sidePlanesNumber + extraPixel

    console.log('totalWidth:', totalWidth, ', singleWidth:', singleWidth)

    Array(sidePlanesNumber).fill().forEach((_, i) => {
      const side = document.createElement('div')
      side.style.cssText = `
        position: relative;
      `

      const outside = document.createElement('div')
      const logoSize = 300
      outside.style.cssText = `
        position: absolute;
        width: ${singleWidth}px;
        height: ${canHeight - bottomDepth}px;
        background-color: yellowgreen;
        background-image: url(assets/logo.svg);
        background-size: ${logoSize}px ${logoSize}px;
        background-repeat: no-repeat;
        background-position: -${(singleWidth-extraPixel) * i}px center;
        transform:
          translateX(${-singleWidth/2}px)
          rotateY(${360/sidePlanesNumber * i}deg)
          translateZ(${canRadius}px)
          translateY(${-canHeight/2}px);
        z-index: 1;

        -webkit-backface-visibility: hidden;
        outline: 1px solid transparent;
      `
      side.appendChild(outside)

      const inside = document.createElement('div')
      inside.style.cssText = `
        position: absolute;
        width: ${singleWidth}px;
        height: ${canHeight - bottomDepth}px;
        /* background-color: darkgray; */
        background: linear-gradient(
          to top,
          lightgray,
          darkgray,
          lightgray,
          darkgray ${topDepth}px);
        transform:
          translateX(-${singleWidth/2}px)
          rotateY(${360/sidePlanesNumber * i}deg)
          translateZ(${canRadius}px)
          translateY(${-canHeight/2}px)
          rotateX(180deg);
        z-index: -1;

        -webkit-backface-visibility: hidden;
        outline: 1px solid transparent;
      `
      side.appendChild(inside)

      /* Calculate bevel planes */
      const a = canRadius - bottomRadius
      const b = bottomDepth
      const c = Math.sqrt(a**2 + b**2)
      const rad = Math.atan2(b, a)

      const bevelPlane = document.createElement('div')
      bevelPlane.style.cssText = `
        position: absolute;
        width: ${singleWidth}px;
        height: ${c}px;
        background-color: darkgray;
        background:
          linear-gradient(to bottom,
            gray 10%,
            darkgray 50%,
            gray 60%,
            darkgray);
        transform-origin: 50% 0;
        transform:
          translateX(${-singleWidth/2}px)
          translateY(${canHeight/2 - bottomDepth}px)
          rotateY(${360/sidePlanesNumber * i}deg)
          translateZ(${canRadius}px)
          rotateX(${180/Math.PI * rad + 270}deg);

        -webkit-backface-visibility: hidden;
        outline: 1px solid transparent;
      `
      side.appendChild(bevelPlane)

      this.can.appendChild(side)
    })
    this.upside = document.createElement('div')
    this.upside.style.cssText = `
      position: absolute;
      width: ${canRadius*2 - 2}px;
      height: ${canRadius*2 - 2}px;
      background-color: gray;
      background-image: url(assets/lid.svg);
      background-size: cover;
      background-position: center center;
      border-radius: 50%;
      transform:
        translateY(${-canHeight/2-1 - canRadius + topDepth}px)
        rotateX(90deg)
        translateX(${-canRadius + 1}px);
      -webkit-backface-visibility: hidden;
      outline: 1px solid transparent;
    `
    this.can.appendChild(this.upside)

    parent.appendChild(this.container)

    window.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    window.addEventListener('mouseup', this.onMouseUp.bind(this), false)
  }

  onMouseDown(event) {
    event.preventDefault()

    if (typeof this.prevAxis === 'undefined') {
      this.prevAxis = {
        y: 0,
        x: 0,
        z: 0,
      }
    }
    this.prevXY = {
      x: event.pageX,
      y: event.pageY,
    }

    return false
  }

  onMouseUp(event) {
    event.preventDefault()

    const {x: prevX, y: prevY} = this.prevXY
    const [deltaX, deltaY] = [prevX - event.pageX, prevY - event.pageY]

    const isReversed = (deg) => {
      const angle = Math.abs(deg) % 360
      return 90 < angle && angle <= 270
    }

    const newX = this.prevAxis.x + deltaY
    const newY = this.prevAxis.y + (isReversed(newX) ? deltaX : -deltaX)

    this.can.style.transform =
      `rotateX(${newX}deg) rotateY(${newY}deg)`

    this.prevAxis.y = newY
    this.prevAxis.x = newX

    return false
  }
}


window.onload = (evt) => new App(document.body)

