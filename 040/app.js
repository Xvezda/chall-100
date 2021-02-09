class App {
  constructor(parent) {
    this.parent = parent

    this.commands = {}
    this.variables = {
      '?': 0,
      '_': ''
    }

    // User interface

    this.container = document.createElement('div')
    this.container.style.display = 'flex'
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'
    this.container.style.justifyContent = 'center'
    this.container.style.alignItems = 'center'

    this.subcontainer = document.createElement('div')
    this.subcontainer.style.display = 'inline-block'

    this.display = document.createElement('textarea')
    this.display.cols = 80
    this.display.rows = 25

    this.display.setAttribute('readonly', 'true')
    this.display.style.resize = 'none'
    this.display.style.display = 'block'
    this.display.style.marginBottom = '5px'

    this.subcontainer.appendChild(this.display)

    this.input = document.createElement('input')
    this.input.type = 'text'
    this.input.style.width = '100%'
    this.input.style.boxSizing = 'border-box'

    this.subcontainer.appendChild(this.input)

    this.container.appendChild(this.subcontainer)
    this.parent.appendChild(this.container)

    this.input.onkeydown = this.onKeyDown.bind(this)
    window.onload = this.onLoad.bind(this)
  }

  onLoad(event) {
    this.input.focus()
  }

  onKeyDown(event) {
    if (event.keyCode === 0xD) {
      this.onEnter(event)
      event.preventDefault()
      return
    }
  }

  onEnter(event) {
    const input = event.target.value
    const IFS = ' '

    input.split(';').forEach(cmd => {
      if (!cmd) return

      const argv = cmd.split(IFS).filter(x => x)
      console.log('argv:', argv)

      this.execute(argv)
    })
    // Reset input
    event.target.value = ''
  }

  execute(argv) {
    const cmd = this.commands[argv[0]]
    try {
      if (!cmd) {
        throw new Error(`command '${argv[0]}' not found\n`)
      }

      cmd(argv)

      this.variables['?'] = 0
    } catch (e) {
      this.write(e.message)

      this.variables['?'] = 1
    }
    this.variables['_'] = argv.slice(-1).pop()
  }

  write(text) {
    this.display.value += text
  }

  addCommand(cmd) {
    const name = cmd.name.split(' ').pop()
    console.log(`command '${name}' added`)

    this.commands[name] = cmd.bind(this)
  }

  getVariable(name) {
    console.assert(name.startsWith('$'))
    console.log(`getting variable ${name}`)

    return this.variables[name.substring(1)] ?? ''
  }
}


const app = new App(document.body)

// Basic idea is that function, which also called as procedure or *sub process*
// is basically same as any other programs.
function echo(argv) {
  const args = argv.slice(1).map(a => a.startsWith('$') ? this.getVariable(a) : a)
  console.log('args:', args)

  this.write(`${args.join(' ')}\n`)
}

app.addCommand(echo)

