export class Command {
  constructor(target) {
    target.onkeydown = this.onKeyDown.bind(this)

    this.commands = {}
  }

  onKeyDown(event) {
    event.preventDefault()
    console.debug('onKeyDown:', event)
    const key = String.fromCharCode(event.keyCode).toLowerCase()
    const job = this.commands[key]
    if (job) {
      job(event)
    }
  }

  add(name, job) {
    this.commands[name.toLowerCase()] = job
  }
}
