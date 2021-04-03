import Metronome from './metronome.js'


class App {
  constructor(parent) {
    this.container = document.createElement('div')
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    `

    // Create image
    const imageContainer = document.createElement('div')
    imageContainer.style.cssText = `
      max-width: 100%;
      max-height: 100%;
    `
    const metronome = new Metronome()
    metronome.appendTo(imageContainer)
    this.container.appendChild(imageContainer)
    this.metronome = metronome

    this.preloadAudio()

    // Create worker of metronome for more precise timing
    this.worker = new Worker('metronome-worker.js')

    const button = document.createElement('button')
    button.setAttribute('disabled', 'disabled')
    this.container.appendChild(button)
    this.button = button

    const bpm = document.createElement('input')
    bpm.type = 'number'
    bpm.min = 1
    bpm.max = 999
    bpm.value = 120
    this.container.appendChild(bpm)
    this.bpm = bpm

    parent.appendChild(this.container)

    this.pauseMetronome()

    bpm.addEventListener('change', this.onChange.bind(this), false)
    this.worker.addEventListener('message', this.onMessage.bind(this), false)
  }

  preloadAudio() {
    const prefix = 'assets'
    const files = [
      'metronome/indicator.wav',
      'metronome/tick.wav',
    ]

    const filePromises = files.map((file) => {
      return fetch(`${prefix}/${file}`)
    })

    Promise.all(filePromises)
      .then((resources) => {
        return Promise.all(resources.map((resource) => resource.blob()))
      })
      .then((blobs) => {
        return Promise.all(blobs.map((blob, i) => {
          const blobUrl = URL.createObjectURL(blob)
          return new Promise((resolve, reject) => {
            const audio = new Audio()
            audio.addEventListener('canplaythrough', (evt) => {
              resolve({
                name: files[i],
                audio: audio,
                blob: blob,
                url: blobUrl,
              })
            }, {
              capture: false,
              once: true,
            })
            audio.src = blobUrl
          })
        }))
      })
      .then((audios) => {
        this.audios = {}
        audios.forEach((audio, i) => {
          this.audios[audio.name] = audio
        })
        this.button.removeAttribute('disabled')
      })
      .catch((err) => {
        console.error(err)
      })
  }

  playMetronome(event) {
    if (!this.worker) return

    this.metronome.start()
    // Synchronize visual and sound
    this.metronome.addEventListener('iteration', () => {
      this.worker.postMessage({type: 'init', bpm: Number(this.bpm.value)})
    }, {
      capture: false,
      once: true,
    })
    this.button.textContent = 'pause'
    this.button.addEventListener('click', this.pauseMetronome.bind(this), {
      capture: false,
      once: true,
    })
    this.bpm.setAttribute('disabled', 'disabled')
  }

  pauseMetronome(event) {
    this.metronome.stop()
    this.worker.postMessage({type: 'stop'})

    this.button.textContent = 'play'
    this.button.addEventListener('click', this.playMetronome.bind(this), {
      capture: false,
      once: true,
    })
    this.bpm.removeAttribute('disabled')
  }

  onMessage(event) {
    console.log(event)

    switch (event.data.type) {
      case 'tick':
        this.playSound(event.data.count)
        break
      default:
        break
    }
  }

  playSound(count) {
    let audio
    switch (count) {
      case 0:
        audio = this.audios['metronome/indicator.wav']
        break
      default:
        audio = this.audios['metronome/tick.wav']
        break
    }
    const { url } = audio
    const audioClone = new Audio(url)
    audioClone.play()
  }

  onChange(event) {
    const bpm = Number(event.target.value)

    this.metronome.bpm = bpm
    this.worker.postMessage({
      type: 'updatebpm',
      bpm: bpm,
    })
  }
}


window.onload = (evt) => new App(document.body)

