function callable(obj) {
  return 'call' in obj && obj.constructor === Function
}


class App {
  constructor(parent) {
    this.parent = parent

    this.commands = {}
    this.variables = {
      '?': 0,
      '_': ''
    }
    this.aliases = {}

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

    input.split(';').forEach(cmd => {
      if (!cmd) return

      const alias = this.aliases[cmd.split(' ', 1)[0]]
      if (alias) {
        cmd = alias + ' ' + cmd.substring(cmd.indexOf(' ') + 1)
      }

      const argv = cmd.split(' ').filter(x => x)
      console.debug('argv:', argv)

      this.execute(argv)
    })
    // Reset input
    event.target.value = ''
  }

  execute(argv) {
    const cmd = this.commands[argv[0].toLowerCase()]
    try {
      if (!cmd) {
        throw new Error(`command '${argv[0]}' not found\n`)
      }

      this.variables['?'] = cmd(argv) ?? 0
    } catch (e) {
      this.write(e.message)

      this.variables['?'] = 127
    }
    this.variables['_'] = argv.slice(-1).pop()
  }

  write(text) {
    this.display.value += text
  }

  addCommand(cmd) {
    const {name, func} = (() => {
      if (!callable(cmd)) {
        const {name, func} = cmd
        return {name, func}
      }
      return {
        name: cmd.name.split(' ').pop().toLowerCase(),
        func: cmd,
      }
    })()
    console.debug(`command '${name}' added`)

    this.commands[name] = func.bind(this)
  }

  getVariable(name) {
    console.assert(name.startsWith('$'))
    console.debug(`getting variable ${name}`)

    return this.variables[name.substring(1)] ?? ''
  }
}


const app = new App(document.body)

/**
 * Basic idea is that function, which also called as procedure or *sub process*
 * is basically same as any other programs.
 */
function echo(argv) {
  const args = argv.slice(1).map(a => a.startsWith('$') ? this.getVariable(a) : a)
  console.debug('args:', args)

  this.write(`${args.join(' ')}\n`)

  return 0
}
app.addCommand(echo)


// Using uppercase to prevent token error
function TRUE(argv) {
  return 0
}
app.addCommand(TRUE)
app.addCommand({name: ':', func: TRUE})


function FALSE(argv) {
  return 1
}
app.addCommand(FALSE)


function alias(argv) {
  for (const arg of argv.slice(1)) {
    if (!arg.includes('=')) {
      // TODO: Add write method to stderr
      this.write(`${argv[0]}: ${arg}: not found`)
      return 1
    }
    const indexOfEqual = arg.indexOf('=')
    const [lval, rval] = [
      arg.substring(0, indexOfEqual),
      arg.substring(indexOfEqual+1)
    ]

    const name = lval.toLowerCase()
    const value = rval

    this.aliases[name] = value
  }
  return 0
}
app.addCommand(alias)
