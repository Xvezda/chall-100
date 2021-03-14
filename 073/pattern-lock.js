/**
 * Copyright (c) 2021 Xvezda <xvezda@naver.com>
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

function contextManager(ctx, exec) {
  ctx.save()
  try {
    exec()
  } catch (e) {
    console.error(e)
  } finally {
    ctx.restore()
  }
}


export default class PatternLock extends HTMLElement {
  constructor() {
    super()

    const defaultAttributes = {
      height: 300,
      width: 300,
      theme: 'red',
    }

    const objectFromAttributes = Object.fromEntries(
      Object.values(this.attributes)
        .map(v => [v.name, v.value])
    )

    this.attrs = {
      ...defaultAttributes,
      ...objectFromAttributes,
    }

    const parent = this.attachShadow({mode: 'open'})

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = this.attrs.width
    canvas.height = this.attrs.height

    this.ctx = ctx
    this.canvas = canvas
    parent.appendChild(canvas)

    canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false)

    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), false)
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), false)
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this), false)

    this.dispatchCustomEvent('patternload')

    this.initState()
    this.animationId = window.requestAnimationFrame(this.nextFrame.bind(this))
  }

  dispatchCustomEvent(name, detail) {
    const customEvent = new CustomEvent(name, {
      detail: detail || null,
    })
    this.dispatchEvent(customEvent)
  }

  drawStart(x, y) {
    this.isDrawing = true
    this.drawMove(x, y)
  }

  drawMove(x, y) {
    const isInCircle = (circleX, circleY, circleR, targetX, targetY) => {
      // By pythagorean theorem:
      // a^2 + b^2 = c^2
      const a = Math.abs(targetX - circleX)
      const b = Math.abs(targetY - circleY)
      const c = Math.sqrt(a**2 + b**2)

      // True if c is less or equal to r
      return c <= circleR
    }

    this.points.forEach((point, i) => {
      point.hover = isInCircle(point.x, point.y, point.r, x, y)

      if (!point.active && point.hover && this.isDrawing) {
        point.active = true
        this.actives.push(i)
      }
    })
    this.setPosition(x, y)
    this.draw()
  }

  drawEnd(x, y) {
    if (this.isDrawing) {
      this.initState()
    }
    this.setPosition(x, y)
  }

  onMouseDown(event) {
    event.preventDefault()

    this.drawStart(
      event.pageX - event.target.offsetLeft,
      event.pageY - event.target.offsetTop)
  }

  onMouseMove(event) {
    event.preventDefault()
    this.drawMove(
      event.pageX - event.target.offsetLeft,
      event.pageY - event.target.offsetTop)
  }

  onMouseUp(event) {
    event.preventDefault()
    this.drawEnd(
      event.pageX - event.target.offsetLeft,
      event.pageY - event.target.offsetTop)
  }

  onTouchStart(event) {
    // Prevent mouse event
    event.preventDefault()

    // Accept only first touch
    const touch = event.touches[0]

    this.touchStartId = touch.identifier
    this.drawStart(
      touch.pageX - event.target.offsetLeft,
      touch.pageY - event.target.offsetTop)
  }

  onTouchMove(event) {
    event.preventDefault()

    const touch = Array.prototype.find
      .call(event.touches, e => e.identifier === this.touchStartId)
    if (!touch) return

    this.drawMove(
      touch.pageX - event.target.offsetLeft,
      touch.pageY - event.target.offsetTop)
  }

  onTouchEnd(event) {
    event.preventDefault()

    const touch = Array.prototype.find
      .call(event.changedTouches, e => e.identifier === this.touchStartId)
    if (!touch) return

    this.drawEnd(
      touch.pageX - event.target.offsetLeft,
      touch.pageY - event.target.offsetTop)
  }

  onResize(event) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  initState() {
    this.dispatchCustomEvent('patterninit', {
      previous: 'actives' in this && this.actives.length > 0 ?
        this.actives.slice() : null,
    })

    this.actives = []
    this.isDrawing = false
    this.x = this.y = -1

    this.initPoints()
    this.replaceWithProxy()
  }

  replaceWithProxy() {
    this.actives = new Proxy(this.actives, {
      set: (target, prop, value) => {
        switch (prop) {
          case 'length':
            this.dispatchCustomEvent('patterninput', {
              actives: this.actives.slice()
            })
            break
          default:
            break
        }
        return Reflect.set(target, prop, value)
      }
    })
  }

  initPoints() {
    this.points = []

    const pointStyle = {
      unit: 75,
      radius: 20,
    }

    for (let unit = pointStyle.unit, y = unit; y <= unit * 3; y += unit) {
      for (let x = unit; x <= unit * 3; x += unit) {
        this.points.push({
          x: x,
          y: y,
          r: pointStyle.radius,
          hover: false,
          active: false,
        })
      }
    }
  }

  draw() {
    this.drawBackground()
    this.drawConnection()
  }

  drawBackground() {
    const pathCircle = (ctx, x, y, r) => {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI*2, true)
    }

    const fillCircle = (ctx, x, y, r) => {
      pathCircle(ctx, x, y, r)
      ctx.fill()
    }

    const strokeCircle = (ctx, x, y, r) => {
      pathCircle(ctx, x, y, r)
      ctx.stroke()
    }

    // Draw each points
    this.points.forEach(point => {
      contextManager(this.ctx, () => {
        this.ctx.fillStyle = 'lightgray'

        fillCircle(this.ctx, point.x, point.y, point.r)

        // Draw inner point
        this.ctx.fillStyle = 'gray'
        fillCircle(this.ctx, point.x, point.y, point.r-10)

        // Draw hover outline indicator
        if (point.hover || point.active) {
          this.ctx.strokeStyle = this.attrs.theme
          this.ctx.lineWidth = 3

          strokeCircle(this.ctx, point.x, point.y, point.r)
        }
      })
    })
  }

  drawConnection() {
    // Helpers for readability
    const isFirstIndex = (arr, i) => !i
    const isLastIndex = (arr, i) => i === arr.length-1

    // Draw connected line
    this.actives.forEach((v, i, a) => {
      contextManager(this.ctx, () => {
        this.ctx.strokeStyle = this.attrs.theme
        this.ctx.lineWidth = 5
        this.ctx.lineCap = this.ctx.lineJoin = 'round'

        const point = this.points[v]
        const {x, y} = point

        if (isFirstIndex(a, i)) {
          this.ctx.beginPath()
          this.ctx.moveTo(x, y)
        } else {
          this.ctx.lineTo(x, y)
        }

        if (isLastIndex(a, i)) {
          if (!isLastIndex(this.points, i) &&
              this.isDrawing && !point.hover) {
            this.ctx.lineTo(this.x, this.y)
          }
          this.ctx.stroke()
        }
      })
    })
  }

  setPosition(x, y) {
    this.x = x
    this.y = y
  }

  nextFrame(timestamp) {
    this.clearCanvas()
    this.draw()

    this.animationId = window.requestAnimationFrame(this.nextFrame.bind(this))
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

