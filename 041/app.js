class App {
  constructor(parent) {
    this.parent = parent
    this.setupInterface()

    // Event names to attach focus listener
    !['load', 'focus'].forEach(e => {
      window.addEventListener(e, this.onFocus.bind(this), false)
    })
    window.addEventListener('contextmenu', this.onContextMenu.bind(this), false)
    window.addEventListener('touchstart', this.onTouchStart.bind(this), false)
    window.addEventListener('click', this.onClick.bind(this), true)
  }

  setupInterface() {
    this.hidden = document.createElement('input')
    this.hidden.type = 'text'
    this.hidden.style.position = 'absolute'
    this.hidden.style.width = 0
    this.hidden.style.height = 0
    this.hidden.style.padding = '0'
    this.hidden.style.border = '0'
    this.hidden.style.top = '-100%'

    this.hidden.addEventListener('paste', this.onPaste.bind(this), false)

    this.container = document.createElement('div')
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'
    this.container.style.display = 'flex'
    this.container.style.alignItems = 'center'
    this.container.style.justifyContent = 'center'

    this.parent.appendChild(this.hidden)

    this.button = document.createElement('button')
    this.button.textContent = 'Download'
    this.button.style.padding = '20px'
    this.button.style.fontSize = '32px'

    this.button.addEventListener('click', this.onDownload.bind(this), false)

    this.disableButton()

    this.container.appendChild(this.button)
    this.parent.appendChild(this.container)

  }

  disableButton() {
    this.button.setAttribute('disabled', 'disabled')
  }

  enableButton() {
    this.button.removeAttribute('disabled')
  }

  set item(value) {
    if (!value) {
      delete this._item
      this.disableButton()

      return
    }
    this._item = value
    this.enableButton()
  }

  get item() {
    if ('_item' in this) {
      return this._item
    }
    return
  }

  removeMenu() {
    try {
      this.parent.removeChild(this.menu)
    } catch (e) {}
  }

  onDownload(event) {
    if (!this.item) return

    const link = document.createElement('a')

    link.setAttribute('download', 'clipboard')
    link.href = this.item
    link.click()

    this.item = undefined
  }

  async onPaste(event) {
    event.preventDefault()
    console.log(event)

    // const result = await navigator.permissions.request({name: 'clipboard-read'})
    // if (result.state !== 'granted' && result.state !== 'prompt') {
    //   alert(result.state)
    //   return
    // }

    const data = await navigator.clipboard.read()
    const item = data[0]
    const blob = await item.getType(item.types[0])

    this.item = URL.createObjectURL(blob)

    // TODO: Zip files?
    /*
    data.forEach(item => {
      item.types.forEach(async (type) => {

        if (type.startsWith('image/')) {
          const blob = await item.getType(type)

          const img = new Image()
          img.src = URL.createObjectURL(blob)

          this.parent.appendChild(img)
        }
      })
    })
    */
  }

  isMobile() {
    // return 'maxTouchPoints' in Navigator
    return navigator.userAgent.includes('Mobile')
  }

  onTouchStart(event) {
    event.preventDefault()
  }

  onClick(event) {
    event.preventDefault()
    console.log(event)

    if ('menu' in this
        && !(event.target === this.menu || this.menu.contains(event.target))) {
      this.removeMenu()
    }
    this.onFocus()
  }

  onFocus(event) {
    console.log(event)
    console.dir(document.activeElement)

    if (this.isMobile()) return

    const active = document.activeElement
    switch (active.tagName) {
      case 'INPUT':
      case 'TEXTAREA':
        break
      default:
        break
    }
    this.hidden.focus()
  }

  onContextMenu(event) {
    event.preventDefault()
    console.log(event)

    this.removeMenu()
    const menu = (() => {
      if ('menu' in this) {
        return this.menu
      }
      const menu = document.createElement('div')
      menu.style.position = 'absolute'
      menu.style.border = '1px solid darkgray'

      const menuPaste = document.createElement('button')
      menuPaste.textContent = 'paste'
      menuPaste.style.padding = '10px'
      menuPaste.style.background = 'transparent'
      menuPaste.style.border = '0'

      menuPaste.onclick = (evt) => {
        console.log('clicked', evt)
        // Mimic paste event
        const clipboardEvent = new ClipboardEvent('paste')
        this.onPaste(clipboardEvent)

        this.removeMenu()
      }

      menu.appendChild(menuPaste)

      return menu
    })()

    this.menu = menu
    this.menu.style.top = `${event.clientY}px`
    this.menu.style.left = `${event.clientX}px`

    this.parent.appendChild(this.menu)
  }
}

new App(document.body)
