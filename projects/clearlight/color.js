function RGBColor(value, g, b) {
  let self = this;

  self.r = 0;
  self.g = 0;
  self.b = 0;

  self.set = set;
  self.get = get;

  self.set(value, g, b);

  function get() {
    return [ self.r, self.g, self.b ];
  }

  function set(value, g, b) {
    let rgb;
    switch (typeof value) {
      case 'string':
      rgb = value.startsWith('#') ? hexTripletToRGB(value) : intToRGB(parseInt(value));
      break;

      case 'number':
      rgb = [value, g, b];
      break;

      default:
      rgb = [ 0, 0, 0 ];
      break;
    }

    self.r = rgb[0];
    self.g = rgb[1];
    self.b = rgb[2];
  }

  function equalTo(color) {
    if (typeof color !== 'undefined') {
      return (self.r === color.r && self.g === color.g && self.b === color.b);
    }

    return false;
  }
}

function hexTripletToRGB(hex) {
  return intToRGB(hex.replace('#', '0x'));
};

function rgbToHexTriplet(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function intToRGB(i) {
  return [(i >> 16) / 255, (i >> 8 & 0xFF) / 255, (i & 0xFF) / 255];
};

export { RGBColor, intToRGB, hexTripletToRGB, rgbToHexTriplet };
