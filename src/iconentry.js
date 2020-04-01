class IconEntry {
  constructor() {
    this._width = -1
    this._height = -1
    this._colors = -1
    this._colorPlanes = -1
    this._bitsPerPixel = -1
    this._horizontalHotspot = -1
    this._verticalHotspot = -1
    this._imageSize = -1
    this._imageOffset = -1
    this._imageType = -1
    this._imageData = null
  }
  get width() {
    return this._width
  }
  get height() {
    return this._height
  }
  get colors() {
    return this._colors
  }
  get colorPlanes() {
    return this._colorPlanes
  }
  get bitsPerPixel() {
    return this._bitsPerPixel
  }
  get horizontalHotspot() {
    return this._horizontalHotspot
  }
  get verticalHotspot() {
    return this._verticalHotspot
  }
  get imageSize() {
    return this._imageSize
  }
  get imageOffset() {
    return this._imageOffset
  }
  get imageType() {
    return this._imageType
  }
  get imageData() {
    return this._imageData
  }
}

export default IconEntry
