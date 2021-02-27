function hashSelectorFormat(hash) {
  return `data-${hash}-hash`
}

export class CustomElement extends HTMLElement {
  constructor() {
    super()

    this.attrs = this.attributes
    this.state = {}

    this.$hashes = []
    this.$hashed = {}

    this.$commonEventOptions = {
      bubbles: true,
      composed: true
    }
    this.$shadowStyle = html`<style />`

    this.attachShadow({mode: 'open'})
  }

  hash(name) {
    if (name === undefined)
      throw new Error(`name argument is required`)

    const key = hashSelectorFormat(unique())
    this.$hashes.push(key)

    const value = name

    return {
      [key]: value,
    }
  }

  getHashed(name) {
    return this.$hashed[name]
  }

  getAllHashed() {
    return this.$hashed
  }

  mount() {
    if ('mounted' in this) return

    const root = this.render(this.attrs)
    this.shadowRoot.appendChild(root)
    this.mounted = root
  }

  update() {
    // Clear previous hashes
    this.$hashes = []

    const updated = this.render(this.attrs)

    this.shadowRoot.replaceChild(updated, this.mounted)
    this.mounted = updated

    // Enforce connected callback
    this.connectedCallback()
  }

  get shadowStyle() {
    return this.$shadowStyle.textContent
  }

  set shadowStyle(newValue) {
    const oldValue = this.$shadowStyle.textContent
    if (!newValue) {
      this.shadowRoot.removeChild(this.$shadowStyle)
    } else if (oldValue) {
      this.shadowRoot.prepend(this.$shadowStyle)
    }
    const isChanged = oldValue !== newValue
    this.$shadowStyle.textContent = newValue

    if (isChanged) {
      this.dispatchEvent(new CustomEvent('stylechange', {
        ...this.$commonEventOptions
      }))
    }
  }

  updateState(newState) {
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

  /* https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks */
  connectedCallback() {
    // Mount
    this.mount()

    // Collect hashed elements
    this.$hashes.forEach(hash => {
      const target = this.shadowRoot.querySelector(`[${hash}]`)
      if (!target) {
        console.warn(`hash '${hash}' does not exists`)
        return
      }
      const value = target.getAttribute(hash)
      console.assert(value && value.length > 0, `value is empty`)
      this.$hashed[value] = target

      // FIXME: Do not remove attribute for debuggin purpose
      // target.removeAttribute(hash)
    })

    this.onConnect()
    this.dispatchEvent(new CustomEvent('connect', {
      ...this.$commonEventOptions
    }))
  }

  disconnectedCallback() {
    this.onDisconnect()
    this.dispatchEvent(new CustomEvent('disconnect', {
      ...this.$commonEventOptions
    }))
  }

  adoptedCallback(...args) {
    this.onAdopt(...args)
    this.dispatchEvent(new CustomEvent('adopt', {
      detail: {
        ...args
      },
      ...this.$commonEventOptions
    }))
  }

  attributeChangedCallback(...args) {
    this.onAttributeChange(...args)
    this.dispatchEvent(new CustomEvent('attributechange', {
      detail: {
        ...args
      },
      ...this.$commonEventOptions
    }))
  }

  onConnect() {}
  onDisconnect() {}
  onAdopt(...args) {}
  onAttributeChange(...args) {}
}


export function unique() {
  // TODO: Find better id generate mechanism
  return btoa(Math.random().toString().substring('0.'.length))
    .substring(2, 18)
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


export function funcToCustomElement(func) {
  return class extends CustomElement {
    render(attrs) {
      return func.call(this, attrs)
    }
  }
}


function defineIfNotExists(name, ctor) {
  const isExists = !!customElements.get(name)

  console.assert(typeof ctor === 'function', `ctor is not a function`)

  if (isExists) return
  customElements.define(name, ctor)
}


export function stringify(obj) {
  const mappings = [
    {check: (obj) => obj === null, process: (obj) => ''},
    {
      check: (obj) => typeof obj == 'function',
      process: (obj) => {
        const func = obj
        const elementName = classToElementName(func)
        const ctor = !isElementSubClass(func)
          ? funcToCustomElement(func)
          : func

        defineIfNotExists(elementName, ctor)
        return elementName
      }
    },
    {
      check: (obj) => isElement(obj),
      process: (obj) => obj.outerHTML
    },
    {
      check: (obj) => isIterable(obj) && typeof obj !== 'string',
      process: (obj) => {
        const iterable = obj
        const results = []
        for (const i of iterable) {
          results.push(stringify(i))
        }
        return results.join('')
      }
    },
    {check: (obj) => obj instanceof InlineStyle, process: (obj) => `${obj}`},
    {
      check: (obj) => (typeof obj === 'object'
        && typeof obj.valueOf() !== 'string'),
      process: (obj) => {
        const attrs = []
        Object.entries(obj).forEach(([k, v]) => {
          if (k.startsWith('on')) {
            console.warn(
              `inline event attribute ${k} found which is not recommended`)
          }
          attrs.push([k.toLowerCase(), `"${stringify(v)}"`].join('='))
        })
        return attrs.join(' ')
      }
    }
  ]

  for (const mapping of mappings) {
    if (mapping.check(obj)) {
      return mapping.process(obj)
    }
  }
  const text = obj
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
  const dom = parser.parseFromString(
    `<template>${html}</template>`, 'text/html')

  const node = dom.querySelector('template').content.cloneNode(true)
  const nodeFilter = (node) => !node.nodeName.startsWith('#')

  const childNodes = Array.prototype.filter.call(
    node.childNodes, nodeFilter)

  console.assert(childNodes.length === 1,
    `there are ${childNodes.length} child nodes,`,
    `which is more than 1 node exist at root of ${html}`,
    `root of custom element must be a single node`)

  if (childNodes[0] === undefined) return null

  return childNodes[0]
}


export class InlineStyle {
  constructor(css) {
    this.virtualElement = html`<div />`
    Object.entries(css).forEach(([k, v]) => {
      this.virtualElement.style[k] = v
    })
  }

  toString() {
    return this.virtualElement.style.cssText
  }
}


export function css(obj) {
  return new InlineStyle(obj)
}


export default {
  CustomElement,
  unique,
  globalUnique,
  entity,
  isIterable,
  isElement,
  isElementSubClass,
  funcToCustomElement,
  stringify,
  html,
  InlineStyle,
  css,
}
