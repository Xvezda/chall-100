import {PyLike, __super__ as super_, inherits} from './pylike.js'


class Foo {
  do_something() {
    console.log('foo is doing something')
  }
}

class Bar {
  do_something() {
    console.log('bar is doing something')
  }
}

class Baz {
  do_something() {
    console.log('baz is doing something')
  }
}


/**
 * Let's test it :)
 */
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  console.debug = function() {}
}


class Hello extends PyLike {
  __init__(...args) {
    console.log('hello world from pylike')
  }
}

const hello = new Hello()
console.debug('='.repeat(80))


// Make multiple inheritance possible
class Egg extends inherits(Baz, Bar, Foo) {
  __init__(...args) {
    super_(Egg, this).__init__(...args)
    console.debug('Egg __init__:', this)
  }

  do_something() {
    // Expect: foo is doing something
    super_(Bar, this).do_something()
    console.log('egg also does something')
  }
}

const egg = new Egg()
console.debug(egg)
egg.do_something()

console.debug('='.repeat(80))


// FIXME: Inherit single class does not work as expected
/*
class Ham extends inherits(Egg) {
  __init__(...args) {
    super_(Ham, this).__init__()
    console.debug('Ham __init__:', this)
  }

  do_something() {
    super_(Ham, this).do_something()
    console.log('and ham also does something')
  }
}

const ham = new Ham()
*/
