
class ICO {
    constructor() {
        this._iconEntries = []
    }
    initEntry(index) {
      this._iconEntries[index] = {
        width: -1,
        height: -1,
        colors: -1,
        colorPlanes: -1,
        bitsPerPixel: -1,
        horizontalHotspot: -1,
        verticalHotspot: -1,
        imageSize: -1,
        imageOffset: -1,
        imageData: null,
      }
    }
}

module.exports = ICO