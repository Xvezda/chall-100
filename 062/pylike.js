/**
 * Implementation of builtins module
 */
export function abs(x) {
  return Math.abs(x)
}

export function all(iterable) {
  Array.from(iterable).every(x => !!x)
}

export function any(iterable) {
  Array.from(iterable).some(x => !!x)
}

// TODO
export function ascii(obj) {}

export function bin(number) {
  return `0b${parseInt(number).toString(2)}`
}

export function breakpoint(...args) {
  // FIXME: Any better method?
  eval('debugger')
}

export function callable(obj) {
  return obj && typeof obj.call === 'function'
}

export function chr(i) {
  return String.fromCharCode(i)
}

// TODO
export function compile() {}

// TODO
export function copyright() {}

// TODO
export function credits() {}

export function delattr(obj, name) {
  delete obj[name]
}

export const dir = (...args) => {
  // TODO
}

export function divmod(x, y) {
  return [Math.round(x / y), x % y]
}

// TODO: Add implementation for globals and locals parameters
export const eval_ = function(source) {
  return new Function(source)()
}

// TODO: Add implementation for globals and locals parameters
export const exec = eval

// TODO
export function exit() {}

// TODO
export function format() {}

export function getattr(obj, name, defaultValue) {
  return obj && obj[name] || defaultValue
}

export function globals() {
  return Object.getOwnPropertyNames(globalThis)
}

export function hasattr(obj, name) {
  return !!(obj && obj[name])
}

// TODO
export function hash(obj) {
}

// TODO
export function help() {}

export function hex(number) {
  return `0x${parseInt(number).toString(16)}`
}

// TODO
export function id(obj) {}

// TODO
export function input() {}

// TODO
export function isinstance() {}

// TODO
export function issubclass() {}

// TODO
export function iter() {}

export function len(obj) {
  if (obj.length === undefined)
    throw new TypeError(`object of type '${typeof obj}' has no len()`)
  return obj.length
}

// TODO
export function license() {}

// TODO
export function locals() {}

// TODO
export function max() {}

// TODO
export function min() {}

// TODO
export function next() {}

export function oct(number) {
  return `0o${parseInt(number).toString(8)}`
}

// TODO
export function open() {}

export function ord(c) {
  return c.charCodeAt(0)
}

export function pow(base, exp, mod) {
  const result = Math.pow(base, exp)
  return mod !== undefined ? result % mod : result
}

// TODO: Implement named argument
export function print(...args) {
  console.debug(...args)
}

// TODO
export function quit() {}

// TODO
export function repr() {}

export function reversed(iterable) {
  // TODO: Using iter?
  const ret = []
  for (const i of iterable) {
    ret.unshift(i)
  }
  return ret
}

// TODO: ndigits parameter
export function round(number) {
  return Math.round(number)
}

// TODO
export function setattr(obj, name, value) {}

// TODO
export function sorted() {}

// TODO
export function sum() {}

// TODO
export function vars() {}


// Builtin types
export function bool(x) {
  return !!x
}

// TODO
export function bytearray() {}

// TODO
export function bytes() {}

// TODO
export function dict() {}

export function set(iterable) {
  // TODO: Match interfaces
  return new Set(iterable)
}

export function str(obj) {
  return obj.toString()
}

// TODO
export function tuple() {}

// TODO: Python style type representation?
export function type(obj) {
  return typeof obj
}

export function int(x, base) {
  return parseInt(x, base)
}


export function PyLike() {
  this.__init__(this, ...Array.from(arguments))
}
// PyLike.prototype.constructor = PyLike
PyLike.prototype.__init__ = function (...args) {
  console.debug('PyLike: default constructor', this, args)
}


export function __super__(type, objOrType) {
  console.debug('__super__:',
    type, objOrType, objOrType.constructor, objOrType.constructor.name)
  const mro = objOrType.__mro__ || [PyLike]
  const index = mro.indexOf(type)

  console.debug('__super__: index:', index)

  const proxy = new Proxy(mro[index + 1].prototype, {
    get: (target, prop) => {
      const reflected = Reflect.get(target, prop)
      console.debug('__super__: proxy:', target, prop)
      return reflected
    }
  })
  return proxy
}


export function inherits(...classes) {
  console.debug('inherits:', classes, this)

  const inherits_ = function (s, c) {
    return class extends s {
      constructor() {
        super()
        console.debug('inherits_:', s, c)

        if ('__mro__' in this && Array.isArray(this.__mro__)) {
          this.__mro__.unshift(c)
        } else {
          this.__mro__ = [c, PyLike]
        }
        c.constructor.call(this)
        c.superConstructor = s
      }
    }
  }
  return reversed([...classes, PyLike]).reduce(inherits_)
}


// TODO: Write more tests
