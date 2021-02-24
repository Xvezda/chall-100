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


export function isElementSubClass(obj) {
  return typeof obj === 'function' && obj.prototype instanceof HTMLElement
}


export function stringify(arg) {
  console.debug('stringify:', arg)

  if (typeof arg === 'function') {
    let func = arg
    // https://stackoverflow.com/a/35686949
    if (func.name.startsWith('bound ') && !func.hasOwnProperty('prototype')) {
      console.debug('skipped:', func)
      // FIXME: Skip for temporary
      return ''
    }
    const elementName = classToElementName(func)
    const ctor = (() => {
      if (!isElementSubClass(func)) {
        return class extends HTMLElement {
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
  if (arg instanceof HTMLElement) {
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


export function jshtm(strings, ...args) {
  const results = [strings[0]]
  strings.slice(1).forEach((v, i) => {
    const arg = args[i]

    results.push(stringify(arg), v)
  })
  const html = results.join('')

  const parser = new DOMParser()
  const dom = parser.parseFromString(html, 'text/html')

  console.debug('jshtm:',
    dom, dom.getElementsByTagName('style'), dom.body.childNodes,
    dom.querySelectorAll('[onclick]'))

  return [
    ...dom.getElementsByTagName('style'),  // TODO: De-duplicate for global styles
    ...dom.body.childNodes
  ]
}


export default {
  unique,
  globalUnique,
  entity,
  isIterable,
  isElementSubClass,
  stringify,
  jshtm,
}
