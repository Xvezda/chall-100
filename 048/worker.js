self.onmessage = (event) => {
  console.log(event)

  const {imageData, pixelSize} = event.data
  const {width, height} = imageData
  const rgbs = []
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const pixels = imageData.data
      const baseIndex = (x + (y*width)) * /* rgba */ 4
      const [r, g, b] = [
        pixels[baseIndex],
        pixels[baseIndex+1],
        pixels[baseIndex+2]
      ]
      const rgb = ((r << 16) | (g << 8) | b).toString(16)

      rgbs.push(`#${rgb}`)
    }
  }
  self.postMessage({ rgbs, pixelSize })
}
