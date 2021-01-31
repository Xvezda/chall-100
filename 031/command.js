export class Command {
  constructor(target) {
    target.onkeydown = this.onKeyDown.bind(this)

    this.commands = {}
  }

  onKeyDown(event) {
    event.preventDefault()
    console.debug('onKeyDown:', event)
    const job = this.commands[event.key]
    if (job) {
      job(event)
    }
  }

  add(name, job) {
    this.commands[name] = job
  }
}
