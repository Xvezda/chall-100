function pseudoClassProxy(element) {
  const hoverStyle = {}

  const onHandler = (evt) => {
    console.log('hoverStyle:', hoverStyle)

    Object.entries(hoverStyle).forEach(([k, v]) => {
      element.style[k] = v
    })
  }

  const offHandler = (evt) => {
    console.log('hoverStyle:', hoverStyle)

    Object.entries(hoverStyle).forEach(([k, _]) => {
      element.style[k] = ''
    })
  }

  return new Proxy(element.style, {
    set(obj, prop, value) {
      console.log(obj, prop, value)

      if (prop in obj) {
        Reflect.set(obj, prop, value)
        return true
      } else if (prop.startsWith(':')) {
        const className = prop.substring(1)
        switch (className) {
          case 'hover':
          // TODO:
          // case 'focus':
            break
          default:
            throw new Error('not implemented')
        }
        return true
      }
      return false
    },
    get(obj, prop) {
      console.log(obj, prop)

      if (prop in obj) {
        return Reflect.get(obj, prop)
      } else if (prop.startsWith(':')) {
        const className = prop.substring(1)
        switch (className) {
          case 'hover':
          // TODO:
          // case 'focus':
            element.addEventListener('mouseenter', onHandler, false)
            element.addEventListener('mouseleave', offHandler, false)
            return hoverStyle
          default:
            throw new Error('not implemented')
        }
      }
    }
  })
}


class App {
  constructor(parent) {
    this.container = document.createElement('div')
    this.container.style.padding = '25px'

    this.button = document.createElement('button')
    this.button.textContent = 'button'

    const buttonStyle = pseudoClassProxy(this.button)
    console.log(buttonStyle)
    buttonStyle.fontSize = '24px'

    // Using hash to switch between JavaScript and original CSS
    if (location.hash === '#test') {
      buttonStyle[':hover'].color = 'red'
    } else {
      const style = document.createElement('style')
      style.textContent = `
        button:hover {
          color: red;
        }
      `
      document.head.appendChild(style)
    }
    this.container.appendChild(this.button)
    parent.appendChild(this.container)
  }
}

new App(document.body)
