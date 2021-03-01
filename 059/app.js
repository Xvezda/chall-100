class App {
  constructor(parent) {
    const container = document.createElement('div')
    container.style.display = 'flex'
    container.style.width = '100vw'
    container.style.height = '100vh'

    const subContainer = document.createElement('div')
    subContainer.style.display = 'flex'
    subContainer.style.width = '100%'
    subContainer.style.gap = '10px'

    const leftPanel = document.createElement('div')
    leftPanel.style.display = 'flex'
    leftPanel.style.flexDirection = 'column'
    leftPanel.style.gap = '10px'
    leftPanel.style.width = '50%'
    leftPanel.style.height = '100%'

    const textareaStyles = `
      resize: none;
      width: 100%;
      height: 50%;
      padding: 15px;
      box-sizing: border-box;
    `

    const htmlInput = document.createElement('textarea')
    htmlInput.style.cssText = textareaStyles
    htmlInput.style.borderTop = '0'
    htmlInput.style.borderLeft = '0'
    htmlInput.setAttribute('tabindex', '0')

    function dedentText(text) {
      console.debug('dedentText:', text)
      const leadingSpaces = text.match(/^\s*/m)[0]
      const regex = new RegExp(`^\\s{${leadingSpaces.length}}`, 'gm')
      console.debug('dedentText:', regex)
      return text.replace(regex, '').trim()
    }

    function dedent(strings, ...args) {
      const results = [strings[0]]
      strings.slice(1).forEach((v, i) => {
        results.push(args[i], v)
      })
      const text = results.join('')
      return dedentText(text)
    }

    const defaultHtml = dedent`\
      <h1>Hello World</h1>
      <hr>
      <ol>
        <li>foo</li>
        <li>bar</li>
        <li>baz</li>
      </ol>
    `
    htmlInput.placeholder = 'type your html here'
    htmlInput.value = defaultHtml.trim()

    htmlInput.addEventListener('input', this.onInput.bind(this), false)
    leftPanel.appendChild(htmlInput)
    this.htmlInput = htmlInput

    const xPathInput = document.createElement('textarea')
    xPathInput.setAttribute('tabindex', '0')
    xPathInput.style.cssText = textareaStyles
    xPathInput.style.borderLeft = '0'
    xPathInput.style.borderBottom = '0'

    xPathInput.addEventListener('input', this.onInput.bind(this), false)
    xPathInput.placeholder = 'type your xpath here'
    leftPanel.appendChild(xPathInput)
    this.xPathInput = xPathInput

    subContainer.appendChild(leftPanel)

    const preview = document.createElement('iframe')
    preview.setAttribute('tabindex', '-1')
    preview.sandbox = 'allow-scripts'
    preview.style.width = '50%'
    preview.style.borderLeft = '1px solid gray'

    const sandboxScript = (function (global) {
      const removeStyle = function (node) {
        node.style.border = ''
      }
      const applyStyle = function (node) {
        node.style.border = '3px solid red'
      }
      const previousNodes = []

      global.addEventListener('message', function (event) {
        let node
        try {
          while ((node=previousNodes.pop()) !== undefined) {
            removeStyle(node)
          }
        } catch (e) {}

        const message = JSON.parse(event.data)
        const htmlPreview = document.getElementById('html-preview')
        htmlPreview.innerHTML = message.html

        let nodes
        try {
          nodes = document.evaluate(
            message.xpath, document, null, XPathResult.ANY_TYPE, null)

          let node
          while ((node=nodes.iterateNext()) !== null) {
            previousNodes.push(node)
            applyStyle(node)
          }
        } catch (e) {}
      })
    })

    preview.srcdoc = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sandbox</title>
        </head>
        <body>
          <div id="html-preview"></div>
          <script>
            (${sandboxScript})(this);
          </script>
        </body>
      </html>
    `
    subContainer.appendChild(preview)
    this.preview = preview

    container.appendChild(subContainer)
    parent.appendChild(container)

    window.addEventListener('load', this.onLoad.bind(this), false)
  }

  onLoad(event) {
    this.xPathInput.focus()
    this.sendMessage()
  }

  onInput(event) {
    this.sendMessage()
  }

  sendMessage() {
    const message = {
      html: this.htmlInput.value,
      xpath: this.xPathInput.value,
    }
    // https://stackoverflow.com/a/58112471
    this.preview.contentWindow.postMessage(JSON.stringify(message), '*')
  }
}

new App(document.body)
