class App {
  constructor(parent) {
    this.container = document.createElement('div')
    this.container.style.cssText = `
      display: flex;
      justify-content: center;
      flex-direction: column;
    `

    this.header = document.createElement('div')
    this.header.style.cssText = `
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 10px;
      padding: 10px 20px;
    `

    const date = new Date()
    this.birthday = document.createElement('input')
    this.birthday.id = 'birthday'
    this.birthday.type = 'date'
    this.birthday.value = '2000-01-01'
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
    this.age.value = 90
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
    this.container.appendChild(this.boxes)

    parent.appendChild(this.container)

    this.createBoxes()
  }

  createBoxes() {
    const daysOfYear = 365
    const daysOfWeek = 7
    const totalAge = parseInt(this.age.value)
    const totalBoxesCount = (totalAge * daysOfYear) / daysOfWeek

    const currentAgeInTimes = Date.now() - new Date(this.birthday.value).getTime()
    const currentAge = currentAgeInTimes / (daysOfYear * 24 * 60 * 60 * 1000)

    for (let i = 0; i < totalBoxesCount; ++i) {
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      // checkbox.setAttribute('disabled', 'disabled')
      checkbox.addEventListener('click', (evt) => evt.preventDefault())

      checkbox.checked = (i+1) * 7 < currentAge * 365

      this.boxes.appendChild(checkbox)
    }
  }

  onChange(event) {
    const newBoxes = document.createElement('div')
    this.container.replaceChild(newBoxes, this.boxes)
    this.boxes = newBoxes

    this.createBoxes()
  }
}


window.onload = (evt) => new App(document.body)
