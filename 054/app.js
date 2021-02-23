import HighlightText, {lorem} from './elements/highlight.js'
customElements.define('highlight-text', HighlightText, {extends: 'div'})


function jshtm(strings, ...args) {
  const result = [strings[0]]
  strings.slice(1).forEach((v, i) => {
    const stringify = (arg) => {
      console.debug(arg)
      if (arg.forEach) {
        let result = ''
        arg.forEach(v => result += stringify(v))
        return result
      }
      if (arg.outerHTML) {
        return arg.outerHTML
      }
      return arg.toString()
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
    <ul>
      ${[1, 2, 3].map(v => jshtm`<li>${v ** 2}</li>`)}
    </ul>
    <style>
    body {
      margin: 25px;
    }
    ul {
      list-style-type: disc;
      margin-left: 25px;
    }
    </style>
  `
)


// Test result
console.assert(
  document.getElementById('highlight').textContent.trim()
  === lorem.trim()
)
