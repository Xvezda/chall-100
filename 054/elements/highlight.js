export default class HighlightText extends HTMLDivElement {
  constructor() {
    super()

    if (!this.hasAttribute('keyword')) {
      console.warn('no keyword provided')
      return
    }
    const keyword = this.getAttribute('keyword').trim()

    let textNode = this.firstChild
    let content = this.textContent
    let idx = content.indexOf(keyword)
    while (idx !== -1) {
      const remain = textNode.splitText(idx)
      const afterKeyword = remain.splitText(keyword.length)
      const keywordNode = afterKeyword.previousSibling

      console.assert(keywordNode.data === keyword, keywordNode.data)

      this.removeChild(keywordNode)

      const highlight = document.createElement('span')
      highlight.style.backgroundColor = 'yellow'
      highlight.textContent = keyword

      this.insertBefore(highlight, afterKeyword)

      content = afterKeyword.data
      idx = content.indexOf(keyword)
      textNode = afterKeyword
    }
  }
}


export const lorem = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius neque at sapien ullamcorper, in tincidunt turpis commodo. Praesent aliquam dolor a lobortis sollicitudin. Curabitur purus dolor, volutpat vitae nisl sed, maximus faucibus turpis. Phasellus commodo gravida nulla, vel facilisis risus pulvinar nec. Aliquam interdum suscipit diam id porttitor. Pellentesque eget pellentesque lorem. Donec bibendum at libero vel aliquet. Aenean eget ipsum lectus. Nam accumsan odio et venenatis vulputate. Curabitur pellentesque purus a enim imperdiet, porttitor vehicula purus placerat. Pellentesque in augue ut nunc luctus cursus. Sed eget arcu nec mauris placerat sodales. Proin suscipit fringilla nisl quis tincidunt.

Vestibulum malesuada, neque et molestie pharetra, nisi neque varius metus, rutrum gravida sapien lorem dignissim erat. Donec quis leo lacus. Ut blandit semper ante sed semper. Sed pulvinar metus vel est convallis accumsan. In ac iaculis turpis. Cras pretium ipsum non purus consequat maximus. Phasellus suscipit vitae urna non porttitor. Vestibulum euismod mattis metus, convallis aliquam nulla viverra nec.

Morbi feugiat eleifend molestie. Maecenas semper turpis dui, quis interdum mi vulputate vitae. Aliquam et mauris vel nunc efficitur sagittis. Vivamus laoreet risus enim, sit amet vulputate magna tincidunt ac. Nunc ornare euismod facilisis. Curabitur eu justo non libero iaculis ultrices a eu velit. Mauris mollis, libero a sagittis eleifend, nunc nunc elementum turpis, at fermentum magna neque id libero. Proin scelerisque mollis neque, id fermentum velit consequat a. Duis molestie leo vel cursus pellentesque. Nulla id tortor volutpat neque aliquet pretium aliquam sed tellus. Nunc tincidunt augue non purus condimentum mattis. Curabitur vel aliquet metus, eu consectetur neque. Curabitur quis vehicula erat. Etiam eu pulvinar metus. In vulputate efficitur sodales. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

Praesent commodo diam ac massa semper sollicitudin. Suspendisse id nulla est. Integer purus lorem, euismod rhoncus volutpat a, gravida vel sapien. Aenean vitae lacinia sem. Aliquam accumsan sed sapien sit amet varius. Curabitur scelerisque condimentum sodales. Quisque iaculis lectus quis neque placerat, non viverra diam viverra. Morbi et euismod velit. Nulla egestas lorem id enim tristique ornare. Fusce tempus, ipsum sit amet commodo faucibus, nulla nisi ultrices eros, eget viverra lorem tellus non quam. Quisque varius nulla vitae erat sollicitudin iaculis. Integer scelerisque condimentum imperdiet. Ut lacinia augue quis eros pretium consequat. Ut sit amet dolor sit amet odio vulputate consectetur.

Etiam interdum felis justo, vel porta risus ultrices eget. Donec condimentum ullamcorper turpis in suscipit. Nullam mattis at ante sit amet tincidunt. Mauris quis varius ligula, quis cursus diam. Quisque ut imperdiet dui. Sed consequat leo vitae arcu pellentesque ullamcorper. Pellentesque aliquet tincidunt leo a iaculis. Aenean eget faucibus ligula. Vestibulum pretium ipsum porttitor lobortis dignissim. Etiam ac ipsum placerat, gravida ex ac, luctus metus. Cras imperdiet, leo id aliquam convallis, massa enim lobortis arcu, quis tempor nisl nibh vel quam. Aenean aliquet risus massa, non ullamcorper enim efficitur facilisis. Donec tincidunt vel est tincidunt tempor. Praesent molestie mattis tellus sit amet imperdiet. In turpis tellus, facilisis eu erat ut, pharetra vehicula lectus. Quisque dui velit, tristique ac scelerisque ut, placerat vitae elit.
`



