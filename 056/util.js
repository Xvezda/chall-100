export class CustomElement extends HTMLElement {
  constructor() {
    super()

    this.$commonEventOptions = {
      bubbles: true,
      composed: true
    }
  }

  updateState(newState) {
    console.debug('setState:', newState)

    const oldState = this.state
    this.state = {
      ...this.state,
      ...newState
    }
    this.dispatchEvent(new CustomEvent('stateupdate', {
      detail: {
        oldState,
        newState,
        value: this.state,
      },
      ...this.$commonEventOptions
    }))
    this.update()
  }

  update() {
    try {
      const shadow = this.attachShadow({mode: 'open'})

      this.mounted = this.render()
      shadow.append(...this.mounted)
    } catch (e) {
      const updated = this.render()

      if (updated.length !== this.mounted.length) {
        this.shadowRoot.innerHTML = ''
        this.shadowRoot.append(...updated)
        this.mounted = updated
        return
      }

      Array.prototype.forEach.call(updated, (v, i) => {
        this.shadowRoot.replaceChild(v, this.mounted[i])
      })
      this.mounted = updated
    }
  }

  /* https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks */
  connectedCallback() {
    this.update()
    this.dispatchEvent(new CustomEvent('connect'))
  }

  disconnectedCallback() {
    this.dispatchEvent(new CustomEvent('disconnect'))
  }

  adoptedCallback() {
    this.dispatchEvent(new CustomEvent('adopt'))
  }

  attributeChangedCallback(...args) {
    this.dispatchEvent(new CustomEvent('attributechange', {
      detail: {
        ...args
      }
    }))
  }
}


export function unique() {
  // TODO: Find better id generate mechanism
  return btoa(Math.random().toString().substring(2)).substring(0, 16)
}
export const globalUnique = unique()
console.debug('globalUnique:', globalUnique)


// Generate valid prefix for custom element name
const lowerCases = 'abcdefghijklmnopqrstuvwxyz'
const validElementPrefix = lowerCases.charAt(Math.random() * lowerCases.length) +
  globalUnique.toLowerCase()

export function classToElementName(classConstructor) {
  // NOTE: https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
  const className = classConstructor.name

  return validElementPrefix + '-'
    + className.replace(/([A-Z])/g, '-$1').toLowerCase()
}


export function entity(text) {
  // TODO: Support more entities
  return text.toString()
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/=/g, '&equals;')
}


export function isIterable(obj) {
  return Array.isArray(obj)
    || obj[Symbol.iterator]
    || typeof obj.forEach === 'function'
    || typeof obj.next === 'function'
}


export function isElement(obj) {
  return obj instanceof HTMLElement
}


export function isElementSubClass(obj) {
  return typeof obj === 'function' && isElement(obj.prototype)
}


export function stringify(arg) {
  console.debug('stringify:', arg)

  if (arg === null) return ''

  if (typeof arg === 'function') {
    let func = arg
    const elementName = classToElementName(func)
    const ctor = (() => {
      if (!isElementSubClass(func)) {
        return class extends CustomElement {
          constructor() {
            super()
            func.call(this)
          }
        }
      }
      return func
    })()

    const isExists = !!customElements.get(elementName)

    console.debug('stringify: elementName:', elementName)

    if (!isExists) {
      customElements.define(elementName, ctor)
    }
    return elementName
  }
  if (isElement(arg)) {
    const element = arg
    return element.outerHTML
  }
  if (isIterable(arg) && typeof arg !== 'string') {
    const iterable = arg
    let result = ''
    for (const i of iterable) {
      result += stringify(i)
    }
    return result
  }
  // arg is object
  if (typeof arg === 'object' && typeof arg.valueOf() !== 'string') {
    const obj = arg
    const attrs = []
    Object.entries(obj).forEach(([k, v]) => {
      if (k.startsWith('on')) {
        console.debug('skipped:', k)
        return  // TODO: How to bind function to element?
      }
      attrs.push([k, stringify(v)].join('='))
    })
    console.debug('attrs:', attrs)
    return attrs.join(' ')
  }
  const text = arg
  return entity(text)
}


export function html(strings, ...args) {
  const results = [strings[0]]
  strings.slice(1).forEach((v, i) => {
    const arg = args[i]

    results.push(stringify(arg), v)
  })
  const html = results.join('')

  const parser = new DOMParser()
  const dom = parser.parseFromString(html, 'text/html')

  console.debug('html:',
    dom, dom.getElementsByTagName('style'), dom.body.childNodes,
    dom.querySelectorAll('[onclick]'))

  const ret = [
    ...dom.getElementsByTagName('style'),  // TODO: De-duplicate for global styles
    ...dom.body.childNodes
  ]
  const retProxy = new Proxy(ret, {
    get: (obj, prop) => {
      const reflected = Reflect.get(dom.body, prop) || Reflect.get(ret, prop)
      if (isElement(reflected)) {
        return chain(reflected)
      }
      return reflected
    }
  })
  console.debug('retProxy:', retProxy.firstChild)

  return retProxy
}


export function chain(element) {
  element.on = (...args) => {
    element.addEventListener(...args)
    return chain(element)
  }
  return element
}


export default {
  CustomElement,
  unique,
  globalUnique,
  entity,
  isIterable,
  isElement,
  isElementSubClass,
  stringify,
  html,
  chain,
}
