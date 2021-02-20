export default class Util {
  static contextManager(ctx, exec, err) {
    ctx.save()

    try {
      exec()
    } catch (e) {
      if (err) {
        err(e)
      }
    }
    ctx.restore()
  }

  static isUpperCase(c) {
    return /[A-Z]/.test(c)
  }

  static toHypenCase(name) {
    return name.replace(/([\w-])([A-Z])/g, (match, p1, p2) => {
      return [p1, '-', p2.toLowerCase()].join('')
    })
  }
}
