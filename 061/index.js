import {PyLike, __super__, inherits} from './pylike.js'


class MyClass extends PyLike {
  constructor() {
    super()
  }
}

const mc = new MyClass()


class Foo {
  doSomething() {
    console.debug('foo is doing something')
  }
}

class Bar {
  doSomething() {
    console.debug('bar is doing something')
  }
}

class Baz {
  doSomething() {
    console.debug('baz is doing something')
  }
}

// Make multiple inheritance possible
class Egg extends inherits(Baz, Bar, Foo) {
  __init__(self, ...args) {
    // TODO: Python style constructor possible?
    // __super__(Bar, this).__init__(self, ...args)
    console.debug('pylike constructor:', self)
  }

  doSomething() {
    // Expect: foo is doing something
    __super__(Bar, this).doSomething()
  }
}

// Let's test it :)
const egg = new Egg()
console.debug(egg)

egg.doSomething()
