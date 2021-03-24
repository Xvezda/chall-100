const daysOfYear = 365
const daysOfWeek = 7

class App {
  static PREFIX = 'lifeCalendar'

  constructor(parent) {
    const prevState = localStorage.getItem(`${App.PREFIX}:state`)
    this.state = prevState ? JSON.parse(prevState) : {
      birthday: `2000-01-01`,
      age: 90,
    }

    this.style = document.createElement('style')
    parent.appendChild(this.style)

    this.container = document.createElement('div')
    this.container.id = 'container'

    this.style.textContent += `
      #container {
        display: flex;
        justify-content: center;
        flex-direction: column;
      }
    `

    this.header = document.createElement('div')
    this.header.id = 'header'

    this.style.textContent += `
      #header {
        display: flex;
        flex-direction: row;
        align-items: center;
        column-gap: 10px;
        padding: 10px 20px;
      }

      @media screen and (max-width: 1023px) {
        #header {
          flex-direction: column;
          row-gap: 10px;
        }
      }
    `

    const date = new Date()
    this.birthday = document.createElement('input')
    this.birthday.id = 'birthday'
    this.birthday.type = 'date'
    this.birthday.value = this.state.birthday
    this.birthday.max =
      `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
    this.birthday.addEventListener('change', this.onChange.bind(this), false)

    this.birthdayLabel = document.createElement('label')
    this.birthdayLabel.textContent = 'Your birthday: '
    this.birthdayLabel.setAttribute('for', this.birthday.id)

    this.header.appendChild(this.birthdayLabel)
    this.header.appendChild(this.birthday)

    this.age = document.createElement('input')
    this.age.id = 'age'
    this.age.type = 'number'
    this.age.value = this.state.age
    this.age.min = 1
    this.age.addEventListener('change', this.onChange.bind(this), false)

    this.ageLabel = document.createElement('label')
    this.ageLabel.textContent = 'Age you want to live: '
    this.ageLabel.setAttribute('for', this.age.id)

    this.header.appendChild(this.ageLabel)
    this.header.appendChild(this.age)

    this.about = document.createElement('em')
    this.about.textContent = `See: https://www.youtube.com/watch?v=arj7oStGLkU`
    this.header.appendChild(this.about)

    this.container.appendChild(this.header)

    this.boxes = document.createElement('div')
    this.boxes.id = 'boxes'
    this.style.textContent += `
      #boxes {
        padding: 0 20px 25px;
      }
    `

    this.container.appendChild(this.boxes)
    parent.appendChild(this.container)

    this.createBoxes()

    console.log('total:', this.getTotalBoxes())
    console.log('checked:', this.getCheckedCount())
  }

  createBoxes() {
    const currentAge = this.getCurrentAge()

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    this.boxes.addEventListener('click', (evt) => {
      evt.preventDefault()
      evt.stopPropagation()
    }, false)

    const totalBoxesCount = this.getTotalBoxes()

    for (let i = 0; i < totalBoxesCount; ++i) {
      const cloned = checkbox.cloneNode(false)
      cloned.checked = (i+1) * 7 < currentAge * 365

      this.boxes.appendChild(cloned)
    }
  }

  getCurrentAge() {
    return this.getCurrentAgeTime() / (daysOfYear * 24 * 60 * 60 * 1000)
  }

  getCurrentAgeTime() {
    return Date.now() - new Date(this.state.birthday).getTime()
  }

  getTotalBoxes() {
    const totalAge = this.state.age
    const totalBoxesCount = (totalAge * daysOfYear) / daysOfWeek

    return totalBoxesCount
  }

  getCheckedCount() {
    return Math.round(this.getCurrentAge() * daysOfYear / daysOfWeek)
  }

  onChange(event) {
    this.boxes.innerHTML = ''
    this.state = {
      birthday: this.birthday.value,
      age: parseInt(this.age.value),
    }
    localStorage.setItem(`${App.PREFIX}:state`, JSON.stringify(this.state))

    this.createBoxes()
  }
}


window.onload = (evt) => new App(document.body)
