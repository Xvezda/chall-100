function pseudoClassProxy(element) {
  const original = {}
  const style = {}

  const setEventStyle = (name, key, value) => {
    if (!style[name]) {
      style[name] = {}
    }
    style[name][key] = value
  }

  const getEventStyles = (name) => {
    if (!style[name]) {
      style[name] = {}
    }
    return style[name]
  }

  const getEventStyle = (name, key) => {
    const styles = getEventStyles(name)
    return styles && styles[key] || ''
  }

  const onHandlerWrapper = (name) => {
    return (evt) => {
      Object.entries(getEventStyles(name)).forEach(([k, v]) => {
        element.style[k] = v
      })
    }
  }

  const offHandlerWrapper = (name) => {
    return (evt) => {
      console.log('original:', original)

      Object.entries(getEventStyles(name)).forEach(([k, _]) => {
        element.style[k] = original[k] || ''
      })
    }
  }

  return new Proxy(element.style, {
    set(obj, prop, value) {
      console.log(obj, prop, value)

      if (prop in obj) {
        Reflect.set(obj, prop, value)
        original[prop] = value

        return true
      } else if (prop.startsWith(':')) {
        const className = prop.substring(1)
        switch (className) {
          case 'hover':
          case 'focus':
            // Do nothing
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
        let onEventName, offEventName;

        const className = prop.substring(1)
        switch (className) {
          case 'focus':
            element.addEventListener('focus',
              onHandlerWrapper(className), false)
            element.addEventListener('blur',
              offHandlerWrapper(className), false)
            break
          case 'hover':
            // TODO: Keep *DRY*
            element.addEventListener('mouseenter', (evt) => {
              const handler = onHandlerWrapper(className)

              if (document.activeElement === evt.target) return
              handler(evt)
            }, false)
            element.addEventListener('mouseleave', (evt) => {
              const handler = offHandlerWrapper(className)

              if (document.activeElement === evt.target) return
              handler(evt)
            }, false)
            break
          default:
            throw new Error('not implemented')
        }

        return getEventStyles(className)
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

    window.onhashchange = (evt) => location.reload()

    // Using hash to switch between JavaScript and original CSS
    if (location.hash === '#debug') {
      const style = document.createElement('style')
      style.textContent = `
        button {
          font-size: 24px;
          color: blue;
        }
        button:hover {
          color: red;
        }
        button:focus {
          color: green;
        }
      `
      document.head.appendChild(style)
    } else {
      buttonStyle.fontSize = '24px'
      buttonStyle.color = 'blue'
      buttonStyle[':hover'].color = 'red'
      buttonStyle[':focus'].color = 'green'
    }
    this.container.appendChild(this.button)
    parent.appendChild(this.container)
  }
}

new App(document.body)
