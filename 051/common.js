import Util from './util.js'


export class CanvasElementStyle extends EventTarget {
  constructor(type, opts) {
    super()

    // Use original element to programmatically generate setters and getters
    this.virtualElement = document.createElement(type)
    // Alias to style
    const vStyle = this.virtualElement.style

    /* Dynamically generate setter, getter properties */
    const defaultGetter = (obj, name) => {
      const value = obj.getPropertyValue(name)
      console.assert(name !== undefined)
      return value
    }

    const defaultSetter = (obj, name, value) => {
      console.assert(name !== undefined && value !== undefined)
      obj.setProperty(name, value)
    }

    const getter = opts?.get ?? defaultGetter
    const getterWrapper = name => {
      return () => {
        return getter(vStyle, Util.toHypenCase(name))
      }
    }

    const setter = opts?.set ?? defaultSetter
    const setterWrapper = name => {
      return (value) => {
        const hypenName = Util.toHypenCase(name)
        const prev = getter(vStyle, hypenName)

        setter(vStyle, hypenName, value)

        if (prev !== value) {
          const evt = new CustomEvent('update', {
            detail: {
              name,
              hypenName,
              newValue: value,
              oldValue: prev,
            }
          })
          this.dispatchEvent(evt)
        }
      }
    }

    const props = {}
    const styleNames = Object.getOwnPropertyNames(vStyle)
    styleNames.forEach(name => {
      props[name] = {
        get: getterWrapper(name),
        set: setterWrapper(name),
      }
    })
    Object.defineProperties(this, props)
  }
}

export default {
  CanvasElementStyle,
}
