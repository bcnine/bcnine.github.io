import CLModule from './cl.js';
import { hexTripletToRGB, rgbToHexTriplet } from './color.js';

let state= {
  wasm : null
};

function getColorAsHexTriplet(id) {
  let ptr = state.getRGB(id);
  let r = parseInt(255.99*state.wasm.getValue(ptr, 'float'));
  let g = parseInt(255.99*state.wasm.getValue(ptr+4, 'float'));
  let b = parseInt(255.99*state.wasm.getValue(ptr+8, 'float'));
  return rgbToHexTriplet(r, g, b);
}

function initFloatElements(ids) {
  for (let i = 0; i < ids.length; ++i) {
    let elem = document.getElementById(ids[i]);
    elem.value = state.getFloat(ids[i]);
    elem.oninput = function() {
      state.setFloat(ids[i], elem.value);
    };
  }
}

function initColorElement(id) {
  let elem = document.getElementById(id);

  elem.oninput = function() {
    let rgb = hexTripletToRGB(elem.value);
    state.setRGB(id, rgb[0], rgb[1], rgb[2]);
  };
  elem.value = getColorAsHexTriplet(id);
}

function initSelectElement(id, custom) {
  let elem = document.getElementById(id);
  let idx = state.getInt(id);
  elem.options.selectedIndex = idx;
  if (custom)
      custom(idx);

  elem.onchange = function() {
    state.setInt(id, elem.selectedIndex);
    if (custom)
      custom(elem.selectedIndex);
  };
}

function initCheckboxElement(id) {
  let elem = document.getElementById(id);
  let checked = state.getInt(id); 
  elem.checked = checked;
  elem.onclick = function() {
    state.setInt(id, elem.checked ? 1 : 0);
  };
}

function initStringElement(id) {
  let elem = document.getElementById(id);
  let value = state.getString(id); 
  elem.value = value;
  elem.onchange = function() {
    state.setString(id, elem.value);
  };
}

window.jsinit = function jsmain(module) {
  state.getInt = state.wasm.cwrap('getInt', 'number', [ 'string' ]);
  state.setInt = state.wasm.cwrap('setInt', null, ['string', 'number'] );
  state.getRGB = state.wasm.cwrap('getRGB', 'number', [ 'string' ]);
  state.setRGB = state.wasm.cwrap('setRGB', null, ['string', 'number'] );
  state.getFloat = state.wasm.cwrap('getFloat', 'number', [ 'string' ]);
  state.setFloat = state.wasm.cwrap('setFloat', null, ['string', 'number'] );
  state.getString = state.wasm.cwrap('getString', 'string', [ 'string' ]);
  state.setString = state.wasm.cwrap('setString', null, ['string', 'string'] );

  console.log("initialization complete.");
}

window.jsreset = function jsreset(module) {
  initStringElement('scene');

  // Important that the min's and max's are set up properly *before* the actual
  // values are set, as otherwise, if the values being set are outside the
  // range of the previous min's and max's, the assignment will fail.

  initSelectElement('projection', (idx) => {
    let label = document.getElementById('fovheight-label');
    let fovheight = document.getElementById('fovheight');
    let near = document.getElementById('near');
    let far = document.getElementById('far');
    if (idx == 0) { // perspective
      label.textContent = 'FOV';
      fovheight.min = state.getFloat('fov-min');
      fovheight.max = state.getFloat('fov-max');
    }
    else if (idx == 1) { // orthographic
      label.textContent = 'Height';
      fovheight.min = state.getFloat('height-min');
      fovheight.max = state.getFloat('height-max');
    }
    fovheight.value = state.getFloat('fovheight');

    near.min = state.getFloat('near-min');
    near.max = state.getFloat('near-max');
    far.min = state.getFloat('far-min');
    far.max = state.getFloat('far-max');
  });

  initSelectElement('light', (idx) => {
    let lightx = document.getElementById('lightx');
    let lighty = document.getElementById('lighty');
    let lightz = document.getElementById('lightz');

    lightx.min = state.getFloat('lightx-min');
    lighty.min = state.getFloat('lighty-min');
    lightz.min = state.getFloat('lightz-min');
    lightx.max = state.getFloat('lightx-max');
    lighty.max = state.getFloat('lighty-max');
    lightz.max = state.getFloat('lightz-max');
    lightx.value = state.getFloat('lightx');
    lighty.value = state.getFloat('lighty');
    lightz.value = state.getFloat('lightz');
  });

  initColorElement('background');
  initFloatElements([ 'fovheight', 'near', 'far' ]);
  initFloatElements([ 'lightx', 'lighty', 'lightz' ]);
  initColorElement('ambient');
  initColorElement('diffuse');
  initColorElement('specular');
  initSelectElement('shadingModel');
  initSelectElement('cull');

  initCheckboxElement('lighting');
  initCheckboxElement('texturing');
  initCheckboxElement('depth');

  let material = document.getElementById('material');
  material.options.length = 0;
  let matcount = state.getInt('material-count');
  for (let i = 0; i < matcount; ++i) {
    material.options[material.options.length] = new Option(state.getString('material-'+i+'-name'), '');
  }
  material.onchange = function() {
    document.getElementById('material-ambient').value = getColorAsHexTriplet('material-'+material.selectedIndex+'-ambient');
    document.getElementById('material-diffuse').value = getColorAsHexTriplet('material-'+material.selectedIndex+'-diffuse');
    document.getElementById('material-specular').value = getColorAsHexTriplet('material-'+material.selectedIndex+'-specular');
    document.getElementById('material-shininess').value = state.getFloat('material-'+material.selectedIndex+'-shininess');
  }

  let matambient = document.getElementById('material-ambient');
  matambient.oninput = function() {
    let rgb = hexTripletToRGB(matambient.value);
    state.setRGB('material-'+material.selectedIndex+'-ambient', rgb[0], rgb[1], rgb[2]);
  };
  let matdiffuse = document.getElementById('material-diffuse');
  matdiffuse.oninput = function() {
    let rgb = hexTripletToRGB(matdiffuse.value);
    state.setRGB('material-'+material.selectedIndex+'-diffuse', rgb[0], rgb[1], rgb[2]);
  };
  let matspecular = document.getElementById('material-specular');
  matspecular.oninput = function() {
    let rgb = hexTripletToRGB(matspecular.value);
    state.setRGB('material-'+material.selectedIndex+'-specular', rgb[0], rgb[1], rgb[2]);
  };
  let matshininess = document.getElementById('material-shininess');
  matshininess.oninput = function() {
    state.setFloat('material-'+material.selectedIndex+'-shininess', matshininess.value);
  };

  material.onchange();

  document.getElementById('reset-view').onclick = () => {
    state.setInt('reset-view', 0);
  };
}

let m = {
  canvas: (function() {
    return document.getElementById('canvas');
    })(),
  locateFile: function(url) {
    if (url.endsWith('.data')) {

    }
    else if (url.endsWith('.wasm')) {

    }

    return url;
  }
};

let module = new CLModule(m);
module.onRuntimeInitialized = function() {
  state.wasm = module;
}
