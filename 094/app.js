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
    `

    this.can = document.createElement('div')
    this.can.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;

      animation-name: rotate-xaxis;
      animation-duration: 10s;
      animation-iteration-count: infinite;

      transform-style: preserve-3d;
    `

    this.style.textContent += `
      @keyframes rotate-xaxis {
        from {
          transform:
            translateZ(1000px)
            rotateX(0deg)
            rotateY(-90deg)
            rotateZ(30deg)
            translateY(-${canHeight/2}px)
            ;
        }
        to {
          transform:
            translateZ(1000px)
            rotateX(360deg)
            rotateY(270deg)
            rotateZ(30deg)
            translateY(-${canHeight/2}px)
            ;
        }
      }
    `

    this.downside = document.createElement('div')
    this.downside.style.cssText = `
      position: absolute;
      width: ${canRadius*2}px;
      height: ${canRadius*2}px;
      background-color: dimgray;
      background-image: url(assets/1200.jpeg);
      background-size: cover;
      background-position: center center;
      border-radius: 50%;
      transform:
        translateY(${canHeight - canRadius}px)
        rotateX(90deg)
        translateX(-${canRadius}px);
    `
    this.can.appendChild(this.downside)

    const sidePlanesNumber = 64
    const totalWidth = 2*Math.PI * canRadius
    const singleWidth = totalWidth / sidePlanesNumber

    console.log('totalWidth:', totalWidth, ', singleWidth:', singleWidth)

    Array(sidePlanesNumber).fill().forEach((_, i) => {
      const plane = document.createElement('div')
      plane.style.cssText = `
        position: absolute;
        width: ${singleWidth}px;
        height: ${canHeight}px;
        background-color: darkgray;
        background-image: url(assets/1000.jpeg);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: -${300+singleWidth*i}px 50%;
        /* background-position: center; */
        transform:
          translateX(-${singleWidth/2}px)
          rotateY(${360/sidePlanesNumber * i}deg)
          translateZ(${canRadius}px);
        /* opacity: .5; */

        -webkit-backface-visibility: hidden;
        outline: 1px solid transparent;
      `
      console.log(i)
      this.can.appendChild(plane)
    })

    this.upside = document.createElement('div')
    this.upside.style.cssText = `
      position: absolute;
      width: ${canRadius*2}px;
      height: ${canRadius*2}px;
      background-color: gray;
      background-image: url(assets/600.jpeg);
      background-size: cover;
      background-position: center center;
      border-radius: 50%;
      transform:
        translateY(-${canRadius}px)
        rotateX(90deg)
        translateX(-${canRadius}px);
    `
    this.can.appendChild(this.upside)
    this.subcontainer.appendChild(this.can)
    this.container.appendChild(this.subcontainer)

    parent.appendChild(this.container)
  }
}

window.onload = (evt) => new App(document.body)

