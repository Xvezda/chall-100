import HighlightText, {lorem} from './elements/highlight.js'

customElements.define('highlight-text', HighlightText, {extends: 'div'})


function entity(text) {
  // TODO: Support more entities
  return text.toString()
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/=/g, '&equals;')
}


function jshtm(strings, ...args) {
  const result = [strings[0]]
  strings.slice(1).forEach((v, i) => {
    const iterable = (obj) => (
      Array.isArray(obj)
      || obj[Symbol.iterator]
      || typeof obj.forEach === 'function'
      || typeof obj.next === 'function'
    )
    const stringify = (arg) => {
      console.debug(arg)
      if (arg instanceof HTMLElement) {
        return arg.outerHTML
      }
      if (iterable(arg) && typeof arg !== 'string') {
        let result = ''
        for (const i of arg) {
          result += stringify(i)
        }
        return result
      }
      return entity(arg)
    }
    const arg = stringify(args[i])

    result.push(arg, v)
  })
  const html = result.join('')

  const parser = new DOMParser()
  const dom = parser.parseFromString(html, 'text/html')

  return dom.body.childNodes
}


document.body.append(
  ...jshtm`
    <!-- testing highlight element -->
    <div is="highlight-text" keyword="ipsum" id="highlight">
      ${lorem}
    </div>
    <hr>
    <!-- testing loop -->
    <style>
    body {
      margin: 25px;
    }
    ul {
      list-style-type: disc;
      margin-left: 25px;
    }
    </style>
    <ul>
      ${[1, 2, 3].map(v => jshtm`<li>${v ** 2}</li>`)}
    </ul>
  `
)


// Test result
console.assert(
  document.getElementById('highlight').textContent.trim()
  === lorem.trim()
)
