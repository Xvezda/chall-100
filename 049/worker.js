self.onmessage = (event) => {
  console.log(event)

  const {imageData, pixelSize} = event.data
  const {data: pixels, width, height} = imageData
  const rgbs = []
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const baseIndex = (x + (y*width)) * 4
      const [r, g, b] = [
        pixels[baseIndex],
        pixels[baseIndex+1],
        pixels[baseIndex+2]
      ]
      rgbs.push([r, g, b])
    }
  }
  self.postMessage({ rgbs, pixelSize })
}
