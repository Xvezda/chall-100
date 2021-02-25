export class CustomElement extends HTMLElement {
  constructor() {
    super()

    this.$commonEventOptions = {
      bubbles: true,
      composed: true
    }
    this.$shadowStyle = html`<style />`

    this.attachShadow({mode: 'open'})
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
    const updated = this.render()

    if ('mounted' in this) {
      this.shadowRoot.replaceChild(updated, this.mounted)
    } else {
      this.shadowRoot.appendChild(updated)
    }
    this.mounted = updated
  }

  /* https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks */
  connectedCallback() {
    this.update()
    if (typeof this.onConnect === 'function') {
      this.onConnect()
    }
    this.dispatchEvent(new CustomEvent('connect', {
      ...this.$commonEventOptions
    }))
  }

  disconnectedCallback() {
    if (typeof this.onDisconnect === 'function') {
      this.onDisconnect()
    }
    this.dispatchEvent(new CustomEvent('disconnect', {
      ...this.$commonEventOptions
    }))
  }

  adoptedCallback() {
    if (typeof this.onAdopt === 'function') {
      this.onAdopt()
    }
    this.dispatchEvent(new CustomEvent('adopt', {
      ...this.$commonEventOptions
    }))
  }

  attributeChangedCallback(...args) {
    if (typeof this.onAttributeChange === 'function') {
      this.onAttributeChange(...args)
    }
    this.dispatchEvent(new CustomEvent('attributechange', {
      detail: {
        ...args
      },
      ...this.$commonEventOptions
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


export function funcToCustomElement(func) {
  return class extends CustomElement {
    constructor() {
      super()
    }

    render() {
      return func.call(this)
    }
  }
}


function defineIfNotExists(name, ctor) {
  const isExists = !!customElements.get(name)

  if (isExists) return
  customElements.define(name, ctor)
}


export function stringify(obj) {
  console.debug('stringify:', obj)

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
      check: (obj) => typeof obj === 'object' && typeof obj.valueOf() !== 'string',
      process: (obj) => {
        const attrs = []
        Object.entries(obj).forEach(([k, v]) => {
          /*
          if (k.startsWith('on')) {
            console.debug('skipped:', k)
            return  // TODO: How to bind function to element?
          }
          */
          attrs.push([k, `"${stringify(v)}"`].join('='))
        })
        console.debug('attrs:', attrs)
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

  if (childNodes[0] === undefined) return null

  return chain(childNodes[0])
}


export function chain(element) {
  element.on = (...args) => {
    element.addEventListener(...args)
    return chain(element)
  }
  return element
}


class InlineStyle {
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
  chain,
  css,
}
