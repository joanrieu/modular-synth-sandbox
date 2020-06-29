// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"hFzp":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function isPort(id) {
  const [, portOrParam] = id;
  return typeof portOrParam === "number";
}

class RecorderNode extends MediaStreamAudioDestinationNode {
  constructor(context, options) {
    super(context, options);
    this.recorder = new MediaRecorder(this.stream, {
      mimeType: ";codecs=pcm"
    });
    this.recorder.ondataavailable = this.onDataAvailable.bind(this);
  }

  onDataAvailable(event) {
    // open the audio file with a small delay to prevent it from
    // stealing focus (it causes us to miss the mouseup event)
    setTimeout(() => window.open(URL.createObjectURL(event.data)), 100);
  }

}

exports.RecorderNode = RecorderNode;

class SAudio {
  constructor(ecs) {
    this.ecs = ecs;
    this.ctx = new AudioContext();
    this.nodes = new Map();
    this.nextNodeIndex = 1;
    this.connections = new Set();
    const interval = setInterval(() => {
      if (this.ctx.state === "running") {
        clearInterval(interval);
      } else {
        this.ctx.resume();
      }
    }, 400);
  }

  get sampleRate() {
    return this.ctx.sampleRate;
  }

  createAudioDestinationNode(device) {
    const node = this.ctx.destination;
    return this.createAudioNode(device, node);
  }

  createRecorderNode(device, options) {
    const node = new RecorderNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  record(id, start) {
    const {
      node
    } = this.getNode(id);

    if (start) {
      node.recorder.start();
    } else {
      node.recorder.stop();
    }
  }

  createAudioBufferSourceNode(device, options) {
    const {
      createBuffer,
      ...nodeOptions
    } = options;
    const node = new AudioBufferSourceNode(this.ctx, nodeOptions);
    const buffer = this.ecs.invokeCallback(createBuffer);
    Promise.resolve(buffer).then(buffer => {
      node.buffer = buffer;
      node.start();
    });
    return this.createAudioNode(device, node, options);
  }

  createAnalyserNode(device, options) {
    const node = new AnalyserNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  getAnalyserFrequencyBinCount(nodeId) {
    return this.getNode(nodeId).node.frequencyBinCount;
  }

  getAnalyserFloatTimeDomainData(nodeId, array) {
    return this.getNode(nodeId).node.getFloatTimeDomainData(array);
  }

  createBiquadFilterNode(device, options) {
    const node = new BiquadFilterNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  createConstantSourceNode(device, options) {
    const node = new ConstantSourceNode(this.ctx, options);
    node.start();
    return this.createAudioNode(device, node, options);
  }

  createDelayNode(device, options) {
    const node = new DelayNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  createGainNode(device, options) {
    const node = new GainNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  createOscillatorNode(device, options) {
    const node = new OscillatorNode(this.ctx, options);
    node.start();
    return this.createAudioNode(device, node, options);
  }

  getOscillatorType(nodeId) {
    return this.getNode(nodeId).node.type;
  }

  setOscillatorType(nodeId, type) {
    const {
      node,
      options
    } = this.getNode(nodeId);
    node.type = type;
    options.type = type;
  }

  createStereoPannerNode(device, options) {
    const node = new StereoPannerNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  createConvolverNode(device, createBuffer) {
    const node = new ConvolverNode(this.ctx);
    const buffer = this.ecs.invokeCallback(createBuffer);
    Promise.resolve(buffer).then(buffer => node.buffer = buffer);
    return this.createAudioNode(device, node, createBuffer);
  }

  connect(connectionId, connect = true) {
    const [srcPortId, dstPortOrParamId] = connectionId;
    const [srcId, srcPort] = srcPortId;
    const [dstId] = dstPortOrParamId;
    const srcNode = this.getNode(srcId).node;
    const dstNode = this.getNode(dstId).node;

    if (isPort(dstPortOrParamId)) {
      const [, dstPort] = dstPortOrParamId;

      if (connect) {
        srcNode.connect(dstNode, srcPort, dstPort);
      } else {
        srcNode.disconnect(dstNode, srcPort, dstPort);
      }
    } else {
      const dstParam = this.getParam(dstPortOrParamId);

      if (connect) {
        srcNode.connect(dstParam, srcPort);
      } else {
        srcNode.disconnect(dstParam, srcPort);
      }
    }

    const connection = JSON.stringify([srcPortId, dstPortOrParamId]);

    if (connect) {
      this.connections.add(connection);
    } else {
      this.connections.delete(connection);
    }
  }

  createAudioNode(device, node, options = {}) {
    const id = [device, this.nextNodeIndex++];
    this.nodes.set(JSON.stringify(id), [node, options]);
    return id;
  }

  getNode(nodeId) {
    const [node, options] = this.nodes.get(JSON.stringify(nodeId));
    return {
      node: node,
      options
    };
  }

  getParam([nodeId, paramName]) {
    const {
      node
    } = this.getNode(nodeId);
    const key = paramName;
    const param = node[key];
    if (!(param instanceof AudioParam)) throw new Error("invalid param name: " + paramName);
    return param;
  }

  getParamValue(paramId) {
    return this.getParam(paramId).value;
  }

  setParamValue(paramId, value) {
    const [nodeId, paramName] = paramId;
    this.getParam(paramId).value = value;
    this.getNode(nodeId).options[paramName] = value;
  }

  deleteDevice(entity) {
    for (const id of this.connections) {
      const connectionId = JSON.parse(id);
      const [[[srcEntity]], [[dstEntity]]] = connectionId;

      if (srcEntity === entity || dstEntity === entity) {
        this.connect(connectionId, false);
      }
    }

    for (const id of this.nodes.keys()) {
      const [device] = JSON.parse(id);

      if (device === entity) {
        this.nodes.delete(id);
      }
    }
  }

  save() {
    return [[...this.nodes].map(([id, [node, options]]) => {
      const ctor = node.constructor.name;
      return [JSON.parse(id), [ctor, options]];
    }), [...this.connections]];
  }

  restore([nodes, connections]) {
    for (const [[device, node], [ctor, options]] of nodes) {
      this.nextNodeIndex = node;
      const create = "create" + ctor;
      this[create](device, options);
    }

    for (const connection of connections) {
      this.connect(JSON.parse(connection));
    }
  }

}

exports.SAudio = SAudio;
},{}],"CMn8":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SAutosave {
  constructor(ecs) {
    this.ecs = ecs;
    setTimeout(this.restoreAll.bind(this));
    setInterval(this.saveAll.bind(this), 1000);
  }

  restoreAll() {
    const str = localStorage.getItem("save");
    if (!str) return;
    const save = JSON.parse(str);
    Object.entries(save).map(([name, system]) => this.ecs[name].restore(system));
  }

  saveAll() {
    const save = Object.entries(this.ecs).reduce((acc, [name, system]) => "save" in system && "restore" in system ? { ...acc,
      [name]: system.save()
    } : acc, {});
    const str = JSON.stringify(save);
    localStorage.setItem("save", str);
  }

}

exports.SAutosave = SAutosave;
},{}],"pdbw":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SButtonClicker {
  constructor(ecs) {
    this.ecs = ecs;
    this.held = new Set();
  }

  update() {
    for (const [entity, button] of this.ecs.buttons) {
      const grabTarget = this.ecs.pointerGrabTargets.get(entity);

      if (grabTarget.grabbed && !this.held.has(entity)) {
        this.held.add(entity);

        if (button.toggle) {
          button.down = !button.down;
        } else {
          button.down = true;
        }

        this.ecs.invokeCallback(button.onClick);
      } else if (!grabTarget.grabbed && this.held.has(entity)) {
        this.held.delete(entity);

        if (!button.toggle) {
          button.down = false;
        }
      }
    }
  }

}

exports.SButtonClicker = SButtonClicker;
},{}],"qn35":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SButtonRenderer {
  constructor(ecs) {
    this.ecs = ecs;
  }

  render() {
    const ctx = this.ecs.display.ctx;
    ctx.lineWidth = 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";

    for (const [entity, button] of this.ecs.buttons) {
      const {
        x,
        y,
        w,
        h
      } = this.ecs.display.getWorldTransform(entity);
      ctx.strokeStyle = "grey";
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = button.down ? "grey" : "#222";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "white";
      ctx.fillText(button.label, x + w / 2, y + h / 2);
    }
  }

}

exports.SButtonRenderer = SButtonRenderer;
},{}],"sopS":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SDeviceRenderer {
  constructor(ecs) {
    this.ecs = ecs;
  }

  render() {
    const ctx = this.ecs.display.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "bold 15px monospace";
    ctx.lineWidth = 2;

    for (const [entity, device] of this.ecs.devices) {
      const {
        x,
        y,
        w,
        h
      } = this.ecs.display.getWorldTransform(entity);
      ctx.strokeStyle = "grey";
      ctx.strokeRect(x, y, w, h);

      if (!this.ecs.scopes.has(entity)) {
        ctx.fillStyle = "#222";
        ctx.fillRect(x, y, w, h);
      }

      ctx.fillStyle = "white";
      ctx.fillText(device.name, x + w / 2, y + 10, w - 20);
    }
  }

}

exports.SDeviceRenderer = SDeviceRenderer;
},{}],"AuQU":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const ECS_1 = require("./ECS");

class SDeviceSaver {
  constructor(ecs) {
    this.ecs = ecs;
  }

  save() {
    const {
      buttons,
      dragAndDropTargets,
      devices,
      knobs,
      knobDragZones,
      pointerGrabTargets,
      ports,
      scopes,
      transforms,
      wires
    } = this.ecs;
    const entities = [...devices.keys()];

    for (const parent of entities) {
      for (const [child, transform] of transforms) {
        if (transform.parent === parent) {
          entities.push(child);
        }
      }
    }

    return Object.entries({
      buttons,
      devices,
      dragAndDropTargets,
      knobs,
      knobDragZones,
      pointerGrabTargets,
      ports,
      scopes,
      transforms,
      wires
    }).map(([name, system]) => [name, [...system].filter(entry => entities.includes(Array.isArray(entry) ? entry[0] : entry) || name === "wires")]);
  }

  restore(save) {
    for (const [k, v] of save) {
      const key = k;

      if (this.ecs[key] instanceof ECS_1.EntitySet) {
        const set = this.ecs[key];

        for (const entity of v) set.add(entity);
      } else if (this.ecs[key] instanceof ECS_1.EntityComponentMap) {
        const map = this.ecs[key];

        for (const [entity, component] of v) map.set(entity, component);
      }
    }
  }

}

exports.SDeviceSaver = SDeviceSaver;
},{"./ECS":"y35b"}],"Nj29":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SDisplay {
  constructor(ecs) {
    this.ecs = ecs;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.resize = () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
    };

    this.loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(this.loop);
    };

    document.body.appendChild(this.canvas);
    window.addEventListener("resize", this.resize);
    this.resize();
    requestAnimationFrame(this.loop);
  }

  update() {
    for (const system of Object.values(this.ecs)) {
      if ("update" in system && system !== this) {
        system.update();
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = (this.canvas.height / 8 | 0) + "px monospace";
    this.ctx.fillStyle = "hsla(0, 0%, 0%)";
    this.ctx.fillText("Modular", this.canvas.width / 2, this.canvas.height * 2 / 6);
    this.ctx.fillText("Synth", this.canvas.width / 2, this.canvas.height * 3 / 6);
    this.ctx.fillText("Sandbox", this.canvas.width / 2, this.canvas.height * 4 / 6);

    for (const system of Object.values(this.ecs)) {
      if ("render" in system && system !== this) {
        system.render();
      }
    }
  }

  getWorldTransform(entity) {
    const transform = { ...this.ecs.transforms.get(entity)
    };

    if (transform.parent) {
      const parent = this.getWorldTransform(transform.parent);
      transform.x += parent.x;
      transform.y += parent.y;
    }

    return transform;
  }

}

exports.SDisplay = SDisplay;
},{}],"jnFJ":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SDragAndDrop {
  constructor(ecs) {
    this.ecs = ecs;
  }

  update() {
    for (const entity of this.ecs.dragAndDropTargets) {
      const grabTarget = this.ecs.pointerGrabTargets.get(entity);

      if (grabTarget.grabbed) {
        const pointerTransform = this.ecs.transforms.get(grabTarget.grabbed.pointer);
        const transform = this.ecs.transforms.get(entity);
        transform.x = pointerTransform.x + grabTarget.grabbed.dx;
        transform.y = pointerTransform.y + grabTarget.grabbed.dy;
      }
    }
  }

}

exports.SDragAndDrop = SDragAndDrop;
},{}],"SdOw":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SKnobManager {
  constructor(ecs) {
    this.ecs = ecs;
  }

  update() {
    for (const [entity, knob] of this.ecs.knobs) {
      const target = this.ecs.pointerGrabTargets.get(entity);

      if (target.grabbed) {
        const dragZone = this.ecs.knobDragZones.get(entity);
        const {
          y
        } = this.ecs.display.getWorldTransform(target.grabbed.pointer);

        const op = x => knob.max > 1000 ? Math.log10(x) : x;

        const opInv = x => knob.max > 1000 ? 10 ** x : x;

        if (dragZone) {
          let percent = (y - dragZone.minY) / (dragZone.maxY - dragZone.minY);
          percent = Math.max(0, Math.min(1, percent));
          this.ecs.audio.setParamValue(knob.param, knob.min + opInv(percent * op(knob.max - knob.min)));
        } else {
          let percent = op(this.ecs.audio.getParamValue(knob.param) - knob.min) / op(knob.max - knob.min);
          percent = Math.max(0, Math.min(1, percent));
          const scale = 200;
          const minY = y + percent * scale;
          const maxY = minY - scale;
          this.ecs.knobDragZones.set(entity, {
            minY,
            maxY
          });
        }
      } else {
        this.ecs.knobDragZones.delete(entity);
      }
    }
  }

}

exports.SKnobManager = SKnobManager;
},{}],"LnCi":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SKnobRenderer {
  constructor(ecs) {
    this.ecs = ecs;
  }

  render() {
    const ctx = this.ecs.display.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";

    const valueToAngle = value => Math.PI * (value * 2 - 1) * 0.7 - Math.PI / 2;

    const minAngle = valueToAngle(0);
    const maxAngle = valueToAngle(1);

    for (const [entity, knob] of this.ecs.knobs) {
      const {
        x,
        y,
        w,
        h
      } = this.ecs.display.getWorldTransform(entity);
      const r = Math.min(w, h) / 2;

      const op = x => knob.max > 1000 ? Math.log10(x) : x;

      let value = op(this.ecs.audio.getParamValue(knob.param) - knob.min) / op(knob.max - knob.min);
      value = Math.max(0, Math.min(1, value));
      const valueAngle = valueToAngle(value);
      ctx.strokeStyle = ctx.fillStyle = "hsl(180, " + (value * 100 | 0) + "%, " + (50 + value * 30 | 0) + "%)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, minAngle, maxAngle);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, minAngle, valueAngle);
      ctx.stroke();
      ctx.fillText(knob.name, x + r, y + r);
      const grabTarget = this.ecs.pointerGrabTargets.get(entity);

      if (grabTarget.grabbed) {
        const {
          x,
          y
        } = this.ecs.display.getWorldTransform(grabTarget.grabbed.pointer);
        const d = 30;
        ctx.fillStyle = "white";
        ctx.fillText(this.ecs.audio.getParamValue(knob.param).toFixed(2), x + d, y + d);
      }
    }
  }

}

exports.SKnobRenderer = SKnobRenderer;
},{}],"RQ1L":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var MidiB0;

(function (MidiB0) {
  MidiB0[MidiB0["NOTE_ON"] = 144] = "NOTE_ON";
  MidiB0[MidiB0["NOTE_OFF"] = 128] = "NOTE_OFF";
})(MidiB0 || (MidiB0 = {}));

function isMidiInput(port) {
  return port.type === "input";
}

class SMidi {
  constructor(ecs) {
    this.ecs = ecs;
    this.lastNote = 0;
    this.gateNodes = new Set();
    this.cvNodes = new Set();
    this.onMidiMessage = this.onMidiMessage.bind(this);
    navigator.requestMIDIAccess?.().then(midi => {
      for (const port of midi.inputs.values()) {
        port.addEventListener("midimessage", this.onMidiMessage);
      }

      midi.addEventListener("statechange", event => {
        if (event.port.state === "connected" && isMidiInput(event.port)) {
          event.port.addEventListener("midimessage", this.onMidiMessage);
        }
      });
    });
  }

  createGateNode(device) {
    const node = this.ecs.audio.createConstantSourceNode(device);
    this.gateNodes.add(node);
    return node;
  }

  createCVNode(device) {
    const node = this.ecs.audio.createConstantSourceNode(device);
    this.cvNodes.add(node);
    return node;
  }

  onMidiMessage(event) {
    for (const gateNode of this.gateNodes) {
      for (const cvNode of this.cvNodes) {
        const [command, note, velocity] = event.data;

        if (command === MidiB0.NOTE_ON && velocity > 0) {
          this.ecs.audio.setParamValue([cvNode, "offset"], this.noteToCV(note));
          this.ecs.audio.setParamValue([gateNode, "offset"], 1);
          this.lastNote = note;
        } else if (command === MidiB0.NOTE_OFF || command === MidiB0.NOTE_ON && velocity === 0) {
          if (note === this.lastNote) {
            this.ecs.audio.setParamValue([gateNode, "offset"], 0);
          }
        }
      }
    }
  }

  noteToCV(note) {
    return 2 ** ((note - 33) / 12);
  }

  deleteDevice(entity) {
    for (const node of this.gateNodes) {
      if (node[0] === entity) {
        this.gateNodes.delete(node);
      }
    }

    for (const node of this.cvNodes) {
      if (node[0] === entity) {
        this.cvNodes.delete(node);
      }
    }
  }

  save() {
    return [[...this.gateNodes], [...this.cvNodes]];
  }

  restore([gateNodes, cvNodes]) {
    this.gateNodes = new Set(gateNodes);
    this.cvNodes = new Set(cvNodes);
  }

}

exports.SMidi = SMidi;
},{}],"LfEz":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function intersection(point, rect) {
  return point.x >= rect.x && point.y >= rect.y && point.x < rect.x + rect.w && point.y < rect.y + rect.h;
}

exports.intersection = intersection;
},{}],"OXog":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const CTransform_1 = require("./CTransform");

class SMouseInput {
  constructor(ecs) {
    this.ecs = ecs;
    this.mouse = this.ecs.createEntity("mouse");
    this.transform = {
      x: 0,
      y: 0,
      w: 1,
      h: 1
    };
    this.pointer = {
      pressed: false
    };

    this.onMouseDown = e => {
      this.pointer.pressed = true;
    };

    this.onMouseUp = () => {
      this.pointer.pressed = false;
    };

    this.onMouseMove = e => {
      this.transform.x = e.clientX;
      this.transform.y = e.clientY;
      this.pointer.target = this.findTargetEntity(this.transform);
    };

    ecs.transforms.set(this.mouse, this.transform);
    ecs.pointers.set(this.mouse, this.pointer);
    ecs.display.canvas.addEventListener("mousedown", this.onMouseDown);
    ecs.display.canvas.addEventListener("mouseup", this.onMouseUp);
    ecs.display.canvas.addEventListener("mousemove", this.onMouseMove);
  }

  findTargetEntity(pointerTransform, parent) {
    for (const targetEntity of this.ecs.pointerGrabTargets.keys()) {
      const targetTransform = this.ecs.display.getWorldTransform(targetEntity);

      if (targetTransform.parent === parent && CTransform_1.intersection(this.transform, targetTransform)) {
        return this.findTargetEntity(pointerTransform, targetEntity);
      }
    }

    return parent;
  }

}

exports.SMouseInput = SMouseInput;
},{"./CTransform":"LfEz"}],"c8pg":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SPointerGrabber {
  constructor(ecs) {
    this.ecs = ecs;
    this.dummyGrabTargets = new Set();
  }

  update() {
    const freePointers = new Map(this.ecs.pointers);
    const freeTargets = new Set(this.ecs.pointerGrabTargets.keys());

    for (const [grabbedEntity, grabTarget] of this.ecs.pointerGrabTargets) {
      if (grabTarget.grabbed) {
        const {
          pressed
        } = this.ecs.pointers.get(grabTarget.grabbed.pointer);

        if (pressed) {
          freePointers.delete(grabTarget.grabbed.pointer);
          freeTargets.delete(grabbedEntity);
        } else {
          delete grabTarget.grabbed;

          if (this.dummyGrabTargets.has(grabbedEntity)) {
            this.dummyGrabTargets.delete(grabbedEntity);
            this.ecs.pointerGrabTargets.delete(grabbedEntity);
          }
        }
      }
    }

    for (const [pointer, {
      target,
      pressed
    }] of freePointers) {
      if (pressed && target && freeTargets.has(target)) {
        const pointerTransform = this.ecs.transforms.get(pointer);
        const grabbedTransform = this.ecs.transforms.get(target);
        const dx = grabbedTransform.x - pointerTransform.x;
        const dy = grabbedTransform.y - pointerTransform.y;
        this.ecs.pointerGrabTargets.get(target).grabbed = {
          pointer,
          dx,
          dy
        };
      } else if (pressed) {
        this.cancelGrab(pointer);
      }
    }
  }

  cancelGrab(pointer) {
    const dummy = this.ecs.createEntity("cancelled-grab-target");
    this.dummyGrabTargets.add(dummy);
    this.ecs.pointerGrabTargets.set(dummy, {
      grabbed: {
        pointer,
        dx: 0,
        dy: 0
      }
    });
  }

}

exports.SPointerGrabber = SPointerGrabber;
},{}],"FbqG":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SPortRenderer {
  constructor(ecs) {
    this.ecs = ecs;
  }

  render() {
    const ctx = this.ecs.display.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";
    ctx.lineWidth = 1;
    const connectedPorts = new Set([...this.ecs.wires.values()].flatMap(wire => [wire.source, wire.destination]));

    for (const [entity, port] of this.ecs.ports) {
      const {
        x,
        y,
        w,
        h
      } = this.ecs.display.getWorldTransform(entity);
      const r = Math.min(w, h) / 2;
      const on = connectedPorts.has(entity);
      ctx.strokeStyle = ctx.fillStyle = on ? "white" : "grey";
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, -Math.PI, Math.PI);
      ctx.stroke();
      ctx.fillText(port.name, x + r, y + r);
    }
  }

}

exports.SPortRenderer = SPortRenderer;
},{}],"iJlX":[function(require,module,exports) {
"use strict"; // Middle Square Weyl Sequence PRNG
// https://en.wikipedia.org/wiki/Middle-square_method#Middle_Square_Weyl_Sequence_PRNG

Object.defineProperty(exports, "__esModule", {
  value: true
});

function uint64(x) {
  return BigInt.asUintN(64, x);
}

function uint32(x) {
  return BigInt.asUintN(32, x);
}

function uint32_to_float(x) {
  return Number(x) / 2 ** 32;
}

function* msws(seed = 0xb5ad4eceda1ce2a9n) {
  let rnd = 0n;
  let weyl = 0n;

  for (;;) {
    weyl = uint64(weyl + seed);
    rnd = uint64(uint64(rnd * rnd) + weyl);
    rnd = uint64(rnd >> 32n) | uint64(rnd << 32n);
    yield uint32_to_float(uint32(rnd));
  }
}

exports.msws = msws;
},{}],"ILBV":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const random_1 = require("./random");

class SPrefabs {
  constructor(ecs) {
    this.ecs = ecs;

    this.getContentBox = (entity, size) => {
      const position = size === "w" ? "x" : "y";
      const children = [...this.ecs.transforms.values()].filter(t => t.parent === entity);
      const margin = Math.min(...children.map(t => t.x));
      const dimension = Math.max(...children.map(t => t[position] + t[size]));
      return dimension + margin;
    };

    this.createToolbar();
  }

  createMaster() {
    const device = this.createDevice("Master");
    const node = this.ecs.audio.createAudioDestinationNode(device);
    this.createPort(device, 20, 40, {
      name: "spk",
      input: [node, 0]
    });
    return device;
  }

  createOscillator(audioRange) {
    const device = this.createDevice(audioRange ? "VCO" : "LFO");
    const node = this.ecs.audio.createOscillatorNode(device, {
      frequency: 0
    });

    if (audioRange) {
      const gainNode = this.ecs.audio.createGainNode(device, {
        gain: 55
        /* convert CV to Hz */

      });
      this.ecs.audio.connect([[gainNode, 0], [node, "frequency"]]);
      this.createPort(device, 20, 40, {
        name: "freq",
        input: [gainNode, 0]
      });
    }

    if (audioRange) {
      this.createKnob(device, 70, 40, {
        name: "dtn",
        param: [node, "detune"],
        min: -100,
        max: 100
      });
    } else {
      this.createKnob(device, 70, 40, {
        name: "rate",
        param: [node, "frequency"],
        min: 0,
        max: 20
      });
    }

    this.createOscillatorWaveButton(device, node, "sine", 0, true);
    this.createOscillatorWaveButton(device, node, "triangle", 1);
    this.createOscillatorWaveButton(device, node, "sawtooth", 2);
    this.createOscillatorWaveButton(device, node, "square", 3);
    let outNode = node;

    if (!audioRange) {
      const gainNode = this.ecs.audio.createGainNode(device, {
        gain: 50
      });
      this.ecs.audio.connect([[outNode, 0], [gainNode, 0]]);
      outNode = gainNode;
      this.createKnob(device, 20, 40, {
        name: "amp",
        param: [gainNode, "gain"],
        min: 0,
        max: 100
      });
    }

    this.createPort(device, 44, 190, {
      name: "out",
      output: [outNode, 0]
    });
    return device;
  }

  createOscillatorWaveButton(device, node, type, line, down = false) {
    const button = this.ecs.createEntity("osc-waveform-" + type);
    this.createButton(button, {
      parent: device,
      x: 20,
      y: 90 + 19 * line,
      w: 80,
      h: 20
    }, {
      label: type,
      toggle: true,
      down,
      onClick: ["prefabs", this.onOscillatorWaveButtonClick.name, [device, node, type]]
    });
    return button;
  }

  onOscillatorWaveButtonClick(device, node, type) {
    this.ecs.audio.setOscillatorType(node, type);

    for (const [entity, transform] of this.ecs.transforms) {
      if (transform.parent === device && this.ecs.buttons.has(entity)) {
        const button = this.ecs.buttons.get(entity);
        button.down = button.label === type;
      }
    }
  }

  createVCO() {
    return this.createOscillator(true);
  }

  createLFO() {
    return this.createOscillator(false);
  }

  createNoise() {
    const device = this.createDevice("Noise");
    const node = this.ecs.audio.createAudioBufferSourceNode(device, {
      createBuffer: ["prefabs", this.createNoiseBuffer.name, []],
      loop: true
    });
    this.createPort(device, 20, 40, {
      name: "out",
      output: [node, 0]
    });
    return device;
  }

  createNoiseBuffer() {
    const sampleRate = this.ecs.audio.sampleRate;
    const audioBuffer = new AudioBuffer({
      length: sampleRate,
      sampleRate,
      numberOfChannels: 2
    });
    const channels = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)];
    const rng = random_1.msws();

    for (let i = 0; i < audioBuffer.length; ++i) {
      channels[0][i] = rng.next().value * 2 - 1;
      channels[1][i] = rng.next().value * 2 - 1;
    }

    return audioBuffer;
  }

  createLPF() {
    return this.createFilter("LPF", "lowpass");
  }

  createHPF() {
    return this.createFilter("HPF", "highpass");
  }

  createFilter(name, type) {
    const device = this.createDevice(name);
    const node = this.ecs.audio.createBiquadFilterNode(device, {
      type
    });
    this.createPort(device, 45, 40, {
      name: "in",
      input: [node, 0]
    });
    this.createPort(device, 20, 90, {
      name: "fm",
      input: [node, "frequency"]
    });
    this.createKnob(device, 70, 90, {
      name: "freq",
      param: [node, "frequency"],
      min: 0,
      max: 20000
    });
    this.createPort(device, 45, 140, {
      name: "out",
      output: [node, 0]
    });
    return device;
  }

  createVCA() {
    const device = this.createDevice("VCA");
    const node1 = this.ecs.audio.createGainNode(device);
    this.createPort(device, 45, 40, {
      name: "in",
      input: [node1, 0]
    });
    this.createPort(device, 20, 90, {
      name: "mod",
      input: [node1, "gain"]
    });
    this.createKnob(device, 70, 90, {
      name: "gain",
      param: [node1, "gain"],
      min: 0,
      max: 2
    });
    const node2 = this.ecs.audio.createGainNode(device);
    this.ecs.audio.setParamValue([node2, "gain"], 1);
    this.createPort(device, 20, 140, {
      name: "out",
      output: [node2, 0]
    });
    this.createVCAGainButton(device, 70, 140, node2, 100);
    this.ecs.audio.connect([[node1, 0], [node2, 0]]);
    return device;
  }

  createVCAGainButton(device, x, y, node, gain) {
    const entity = this.ecs.createEntity("button");
    this.createButton(entity, {
      parent: device,
      x,
      y,
      w: 32,
      h: 32
    }, {
      label: "x" + gain,
      toggle: true,
      down: false,
      onClick: ["prefabs", this.onVCAGainButtonClick.name, [[node, "gain"], gain]]
    });
    return entity;
  }

  onVCAGainButtonClick(param, gain) {
    this.ecs.audio.setParamValue(param, this.ecs.audio.getParamValue(param) === 1 ? gain : 1);
  }

  createPanner() {
    const device = this.createDevice("Panner");
    const node = this.ecs.audio.createStereoPannerNode(device);
    this.createPort(device, 20, 40, {
      name: "in",
      input: [node, 0]
    });
    this.createKnob(device, 20, 90, {
      name: "pan",
      param: [node, "pan"],
      min: -1,
      max: 1
    });
    this.createPort(device, 20, 140, {
      name: "out",
      output: [node, 0]
    });
    return device;
  }

  createReverb() {
    const device = this.createDevice("Reverb");
    const convolution = this.ecs.audio.createConvolverNode(device, ["prefabs", this.createReverbArray.name, []]);
    const hpf = this.ecs.audio.createBiquadFilterNode(device, {
      type: "highpass",
      frequency: 10,
      Q: 0
    });
    this.ecs.audio.connect([[convolution, 0], [hpf, 0]]);
    this.createPort(device, 20, 40, {
      name: "in",
      input: [convolution, 0]
    });
    this.createPort(device, 20, 90, {
      name: "out",
      output: [hpf, 0]
    });
    return device;
  }

  async createReverbArray() {
    const el = document.querySelector("audio");
    let audioBuffer;

    if (el) {
      const res = await fetch(el.src);
      const arrayBuffer = await res.arrayBuffer();
      audioBuffer = await this.ecs.audio.ctx.decodeAudioData(arrayBuffer);

      if (audioBuffer.numberOfChannels > 4) {
        const oldAudioBuffer = audioBuffer;
        audioBuffer = new AudioBuffer({
          length: oldAudioBuffer.length,
          sampleRate: oldAudioBuffer.sampleRate,
          numberOfChannels: 2
        });
        const array = new Float32Array(audioBuffer.length);
        oldAudioBuffer.copyFromChannel(array, 0);
        audioBuffer.copyToChannel(array, 0);
        oldAudioBuffer.copyFromChannel(array, 1);
        audioBuffer.copyToChannel(array, 1);
      }
    } else {
      const sampleRate = this.ecs.audio.sampleRate;
      audioBuffer = new AudioBuffer({
        length: sampleRate * 5,
        sampleRate: sampleRate,
        numberOfChannels: 2
      });
      const channels = [audioBuffer.getChannelData(1), audioBuffer.getChannelData(0)];
      const rng = random_1.msws();

      for (let i = 0; i < audioBuffer.length; ++i) {
        for (const samples of channels) {
          const x = i / sampleRate;
          const parabola = 1 - (x / 3) ** 2;

          if (parabola > 0) {
            let val = rng.next().value;
            const coef = 0.95;
            if (i > 0) val = samples[i - 1] * coef + val * (1 - coef);
            samples[i] = parabola * val;
          }
        }
      }
    }

    return audioBuffer;
  }

  createDelay(maxDelayTime = 10) {
    const device = this.createDevice("Delay");
    const node = this.ecs.audio.createDelayNode(device, {
      maxDelayTime
    });
    this.createPort(device, 20, 40, {
      name: "in",
      input: [node, 0]
    });
    this.createKnob(device, 20, 90, {
      name: "val",
      param: [node, "delayTime"],
      min: 0,
      max: maxDelayTime
    });
    this.createPort(device, 20, 140, {
      name: "out",
      output: [node, 0]
    });
    return device;
  }

  createScope() {
    const device = this.createDevice("Scope");
    this.ecs.transforms.set(device, {
      x: 0,
      y: 0,
      w: 300,
      h: 200
    });
    const node = this.ecs.audio.createAnalyserNode(device);
    this.ecs.scopes.set(device, {
      node
    });
    this.createPort(device, 10, 10, {
      name: "in",
      input: [node, 0]
    });
    return device;
  }

  createMIDI() {
    const device = this.createDevice("MIDI in");
    const gateNode = this.ecs.midi.createGateNode(device);
    this.ecs.prefabs.createPort(device, 20, 40, {
      name: "gate",
      output: [gateNode, 0]
    });
    const cvNode = this.ecs.midi.createCVNode(device);
    this.ecs.prefabs.createPort(device, 70, 40, {
      name: "cv",
      output: [cvNode, 0]
    });
    return device;
  }

  createRecorder() {
    const device = this.createDevice("Recorder");
    const node = this.ecs.audio.createRecorderNode(device);
    this.createPort(device, 45, 40, {
      name: "in",
      input: [node, 0]
    });
    const button = this.ecs.createEntity("button");
    this.createButton(button, {
      parent: device,
      x: 10,
      y: 90,
      w: 100,
      h: 20
    }, {
      label: "start",
      toggle: true,
      down: false,
      onClick: ["prefabs", this.onRecorderStartStopButtonClicked.name, [node, button]]
    });
    return device;
  }

  onRecorderStartStopButtonClicked(node, button) {
    const cbutton = this.ecs.buttons.get(button);
    this.ecs.audio.record(node, cbutton.down);
    cbutton.label = cbutton.down ? "stop" : "start";
  }

  createDevice(name) {
    const getContentBox = this.getContentBox;
    const entity = this.ecs.createEntity(name.toLowerCase());
    this.ecs.devices.set(entity, {
      name
    });
    this.ecs.transforms.set(entity, {
      x: 0,
      y: 0,

      // FIXME the getters are replaced by their values when serialized
      // (it works, but it could cause problems in the future)
      get w() {
        return getContentBox(entity, "w");
      },

      get h() {
        return getContentBox(entity, "h");
      }

    });
    this.ecs.pointerGrabTargets.set(entity, {});
    this.ecs.dragAndDropTargets.add(entity);
    return entity;
  }

  createPort(device, x, y, port) {
    const entity = this.ecs.createEntity(device + "-" + port.name.toLowerCase());
    this.ecs.transforms.set(entity, {
      parent: device,
      x,
      y,
      w: 32,
      h: 32
    });
    this.ecs.ports.set(entity, port);
    this.ecs.pointerGrabTargets.set(entity, {});
    return entity;
  }

  createKnob(device, x, y, knob) {
    const entity = this.ecs.createEntity(device + "-" + knob.name.toLowerCase());
    this.ecs.transforms.set(entity, {
      parent: device,
      x,
      y,
      w: 32,
      h: 32
    });
    this.ecs.knobs.set(entity, knob);
    this.ecs.pointerGrabTargets.set(entity, {});
    return entity;
  }

  createButton(entity, transform, button) {
    this.ecs.transforms.set(entity, transform);
    this.ecs.pointerGrabTargets.set(entity, {});
    this.ecs.buttons.set(entity, button);
  }

  createToolbar() {
    let spot = 0;
    const self = this;

    const nextPosition = () => ({
      get x() {
        return self.ecs.display.canvas.width - 110;
      },

      y: 10 + 20 * spot++,
      w: 100,
      h: 20
    });

    this.createNewProjectButton(nextPosition());
    spot += 0.5;
    this.createSpawnButton("Master", nextPosition());
    this.createSpawnButton("MIDI", nextPosition());
    this.createSpawnButton("Recorder", nextPosition());
    spot += 0.5;
    this.createSpawnButton("VCO", nextPosition());
    this.createSpawnButton("LFO", nextPosition());
    spot += 0.5;
    this.createSpawnButton("Noise", nextPosition());
    spot += 0.5;
    this.createSpawnButton("LPF", nextPosition());
    this.createSpawnButton("HPF", nextPosition());
    this.createSpawnButton("Delay", nextPosition());
    this.createSpawnButton("Panner", nextPosition());
    this.createSpawnButton("Reverb", nextPosition());
    spot += 0.5;
    this.createSpawnButton("VCA", nextPosition());
    spot += 0.5;
    this.createSpawnButton("Scope", nextPosition());
  }

  createNewProjectButton(transform) {
    const entity = this.ecs.createEntity("button");
    this.createButton(entity, transform, {
      label: "New Project",
      toggle: false,
      down: false,
      onClick: ["prefabs", this.onNewProjectButtonClick.name, []]
    });
    return entity;
  }

  onNewProjectButtonClick() {
    localStorage.clear();
    location.reload();
  }

  createSpawnButton(name, transform) {
    const entity = this.ecs.createEntity("button");
    this.createButton(entity, transform, {
      label: name,
      toggle: false,
      down: false,
      onClick: ["prefabs", this.onSpawnButtonClick.name, [entity, name]]
    });
    return entity;
  }

  onSpawnButtonClick(entity, type) {
    const key = "create" + type;
    const spawn = this[key].bind(this);
    const spawnedEntity = spawn();
    const transform = this.ecs.transforms.get(spawnedEntity);
    const buttonGrabTarget = this.ecs.pointerGrabTargets.get(entity);
    const spawnedGrabTarget = this.ecs.pointerGrabTargets.get(spawnedEntity);
    spawnedGrabTarget.grabbed = {
      pointer: buttonGrabTarget.grabbed.pointer,
      dx: -transform.w / 2,
      dy: -transform.h / 4
    };
    delete buttonGrabTarget.grabbed;
  }

}

exports.SPrefabs = SPrefabs;
},{"./random":"iJlX"}],"j0NI":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SScopeRenderer {
  constructor(ecs) {
    this.ecs = ecs;
  }

  render() {
    const ctx = this.ecs.display.ctx;
    ctx.fillStyle = "black";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;

    for (const [entity, scope] of this.ecs.scopes) {
      const transform = this.ecs.display.getWorldTransform(entity);
      ctx.save();
      ctx.translate(transform.x, transform.y + transform.h / 2);
      ctx.scale(1, -1);
      ctx.fillRect(0, -transform.h / 2, transform.w, transform.h);
      const size = this.ecs.audio.getAnalyserFrequencyBinCount(scope.node);
      const buffer = new Float32Array(size);
      this.ecs.audio.getAnalyserFloatTimeDomainData(scope.node, buffer);
      const zx = buffer.findIndex(sample => (sample * 100 | 0) === 0);
      const ox = buffer.findIndex((sample, x) => x > zx && (sample * 100 | 0) > 0);
      ctx.beginPath();

      for (let x = 0; x < buffer.length; ++x) {
        ctx.lineTo(x++ * transform.w / buffer.length, buffer[(ox + x) % buffer.length] * (transform.h / 2));
      }

      ctx.stroke();
      ctx.restore();
    }
  }

}

exports.SScopeRenderer = SScopeRenderer;
},{}],"NQ8u":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const CTransform_1 = require("./CTransform");

const ECS_1 = require("./ECS");

class STrash {
  constructor(ecs) {
    this.ecs = ecs;
    const entity = this.ecs.createEntity("trashcan");
    ecs.transforms.set(entity, {
      get x() {
        return (ecs.display.canvas.width - 50) / 2;
      },

      get y() {
        return ecs.display.canvas.height - 75;
      },

      w: 50,
      h: 50
    });
    ecs.trashcans.set(entity, {
      visible: false,
      active: false
    });
  }

  update() {
    let deviceGrabbed = false;

    for (const [entity] of this.ecs.devices) {
      if (this.ecs.pointerGrabTargets.get(entity).grabbed) {
        deviceGrabbed = true;
        break;
      }
    }

    for (const [entity, trashcan] of this.ecs.trashcans) {
      const transform = this.ecs.transforms.get(entity);
      trashcan.visible = deviceGrabbed;
      const wasActive = trashcan.active;
      trashcan.active = false;

      for (const [entity2] of this.ecs.devices) {
        const transform2 = this.ecs.transforms.get(entity2);
        const overlap = CTransform_1.intersection(transform, transform2);
        const grabbed = this.ecs.pointerGrabTargets.get(entity2).grabbed;

        if (overlap && grabbed) {
          trashcan.active = overlap;
        } else if (wasActive && overlap) {
          this.deleteDevice(entity2);
        }
      }
    }
  }

  deleteDevice(entity) {
    let count = 0;
    const trash = new Set([entity]);

    while (trash.size !== count) {
      count = trash.size;

      for (const [entity, {
        parent
      }] of this.ecs.transforms) {
        if (parent && trash.has(parent)) {
          trash.add(entity);
        }
      }
    }

    for (const [entity, wire] of this.ecs.wires) {
      if (trash.has(wire.source) || trash.has(wire.destination)) {
        trash.add(entity);
      }
    }

    for (const entity of trash) {
      if (this.ecs.devices.has(entity)) {
        this.ecs.audio.deleteDevice(entity);
        this.ecs.midi.deleteDevice(entity);
      }

      for (const v of Object.values(this.ecs)) {
        if (v instanceof ECS_1.EntitySet || v instanceof ECS_1.EntityComponentMap) {
          v.delete(entity);
        }
      }
    }
  }

}

exports.default = STrash;
},{"./CTransform":"LfEz","./ECS":"y35b"}],"BtAL":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class STrashcanRenderer {
  constructor(ecs) {
    this.ecs = ecs;
  }

  render() {
    const {
      ctx
    } = this.ecs.display;

    for (const [entity, trashcan] of this.ecs.trashcans) {
      if (!trashcan.visible) continue;
      const {
        x,
        y,
        w,
        h
      } = this.ecs.transforms.get(entity);
      ctx.strokeStyle = trashcan.active ? "hsla(0deg, 100%, 50%, .5)" : "hsla(0deg, 0%, 50%, .5)";
      ctx.lineWidth = trashcan.active ? 5 : 2;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x + w / 2, y + h / 2);
      ctx.moveTo(x + w / 2, y - h / 2);
      ctx.lineTo(x - w / 2, y + h / 2);
      ctx.closePath();
      ctx.stroke();
    }
  }

}

exports.default = STrashcanRenderer;
},{}],"TXlZ":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SWireManager {
  constructor(ecs) {
    this.ecs = ecs;
  }

  update() {
    for (const [grabbedEntity, grabTarget] of this.ecs.pointerGrabTargets) {
      if (grabTarget.grabbed && this.ecs.ports.has(grabbedEntity)) {
        // create a draggable wire from a port or delete an existing one
        this.deleteWireIfExists(grabbedEntity, grabTarget.grabbed.pointer) || this.createDraggableWire(grabbedEntity, grabTarget.grabbed.pointer);
        delete grabTarget.grabbed;
      } else if (!grabTarget.grabbed && this.ecs.wires.has(grabbedEntity)) {
        // connect a wire if dropped on a compatible port
        this.dropWire(grabbedEntity);
      }
    }
  }

  deleteWireIfExists(grabbedEntity, pointer) {
    for (const [wireEntity, wire] of this.ecs.wires) {
      if (wire.source === grabbedEntity || wire.destination === grabbedEntity) {
        this.disconnect(wire);
        this.ecs.wires.delete(wireEntity);
        this.ecs.pointerGrabber.cancelGrab(pointer);
        return true;
      }
    }

    return false;
  }

  createDraggableWire(grabbedEntity, pointer) {
    const wire = this.ecs.createEntity("wire");
    this.ecs.wires.set(wire, {
      source: grabbedEntity,
      destination: pointer,
      hue: Math.random()
    });
    this.ecs.pointerGrabTargets.set(wire, {
      grabbed: {
        pointer,
        dx: 0,
        dy: 0
      }
    });
  }

  dropWire(grabbedEntity) {
    const wire = this.ecs.wires.get(grabbedEntity);
    const transform = this.ecs.transforms.get(wire.destination);
    const target = this.ecs.mouseInput.findTargetEntity(transform);
    let connected = false;

    if (target && this.ecs.ports.has(target)) {
      wire.destination = target;
      connected = this.connect(wire);
    }

    if (!connected) {
      this.ecs.wires.delete(grabbedEntity);
    }

    this.ecs.pointerGrabTargets.delete(grabbedEntity);
  }

  connect(wire, connect = true) {
    let sourcePort = this.ecs.ports.get(wire.source);
    let destinationPort = this.ecs.ports.get(wire.destination);

    if (!sourcePort || !destinationPort) {
      return false;
    }

    if (sourcePort.output === undefined) {
      const tmp = sourcePort;
      sourcePort = destinationPort;
      destinationPort = tmp;
    }

    if (sourcePort.output === undefined || destinationPort.input === undefined) {
      return false;
    }

    this.ecs.audio.connect([sourcePort.output, destinationPort.input], connect);
    return true;
  }

  disconnect(wire) {
    this.connect(wire, false);
  }

}

exports.SWireManager = SWireManager;
},{}],"Ey0W":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class SWireRenderer {
  constructor(ecs) {
    this.ecs = ecs;
  }

  render() {
    const ctx = this.ecs.display.ctx;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";

    for (const [entity, wire] of this.ecs.wires) {
      const source = this.ecs.display.getWorldTransform(wire.source);
      const destination = this.ecs.display.getWorldTransform(wire.destination);
      ctx.beginPath();
      ctx.moveTo(source.x + source.w / 2, source.y + source.h * 0.8);
      ctx.bezierCurveTo(source.x + source.w / 2, source.y + source.h * 0.8 + 100, destination.x + destination.w / 2, destination.y + destination.h * 0.8 + 100, destination.x + destination.w / 2, destination.y + destination.h * 0.8);
      ctx.strokeStyle = "hsla(" + (wire.hue * 6 | 0) * 60 + "deg, 100%, 70%, .5)";
      ctx.stroke();
    }
  }

}

exports.SWireRenderer = SWireRenderer;
},{}],"y35b":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const SAudio_1 = require("./SAudio");

const SAutosave_1 = require("./SAutosave");

const SButtonClicker_1 = require("./SButtonClicker");

const SButtonRenderer_1 = require("./SButtonRenderer");

const SDeviceRenderer_1 = require("./SDeviceRenderer");

const SDeviceSaver_1 = require("./SDeviceSaver");

const SDisplay_1 = require("./SDisplay");

const SDragAndDrop_1 = require("./SDragAndDrop");

const SKnobManager_1 = require("./SKnobManager");

const SKnobRenderer_1 = require("./SKnobRenderer");

const SMidi_1 = require("./SMidi");

const SMouseInput_1 = require("./SMouseInput");

const SPointerGrabber_1 = require("./SPointerGrabber");

const SPortRenderer_1 = require("./SPortRenderer");

const SPrefabs_1 = require("./SPrefabs");

const SScopeRenderer_1 = require("./SScopeRenderer");

const STrash_1 = __importDefault(require("./STrash"));

const STrashcanRenderer_1 = __importDefault(require("./STrashcanRenderer"));

const SWireManager_1 = require("./SWireManager");

const SWireRenderer_1 = require("./SWireRenderer");

class EntitySet extends Set {}

exports.EntitySet = EntitySet;

class EntityComponentMap extends Map {}

exports.EntityComponentMap = EntityComponentMap;

class ECS {
  constructor() {
    this.transforms = new EntityComponentMap();
    this.devices = new EntityComponentMap();
    this.ports = new EntityComponentMap();
    this.knobs = new EntityComponentMap();
    this.wires = new EntityComponentMap();
    this.pointers = new EntityComponentMap();
    this.pointerGrabTargets = new EntityComponentMap();
    this.dragAndDropTargets = new EntitySet();
    this.knobDragZones = new EntityComponentMap();
    this.buttons = new EntityComponentMap();
    this.scopes = new EntityComponentMap();
    this.trashcans = new EntityComponentMap();
    this.prefabs = new SPrefabs_1.SPrefabs(this);
    this.audio = new SAudio_1.SAudio(this);
    this.display = new SDisplay_1.SDisplay(this);
    this.mouseInput = new SMouseInput_1.SMouseInput(this);
    this.pointerGrabber = new SPointerGrabber_1.SPointerGrabber(this);
    this.buttonClicker = new SButtonClicker_1.SButtonClicker(this);
    this.dragAndDrop = new SDragAndDrop_1.SDragAndDrop(this);
    this.deviceSaver = new SDeviceSaver_1.SDeviceSaver(this);
    this.wireManager = new SWireManager_1.SWireManager(this);
    this.knobManager = new SKnobManager_1.SKnobManager(this);
    this.midi = new SMidi_1.SMidi(this);
    this.autosave = new SAutosave_1.SAutosave(this);
    this.trash = new STrash_1.default(this); // debugRenderer = new SDebugRenderer(this);

    this.scopeRenderer = new SScopeRenderer_1.SScopeRenderer(this);
    this.deviceRenderer = new SDeviceRenderer_1.SDeviceRenderer(this);
    this.portRenderer = new SPortRenderer_1.SPortRenderer(this);
    this.knobRenderer = new SKnobRenderer_1.SKnobRenderer(this);
    this.buttonRenderer = new SButtonRenderer_1.SButtonRenderer(this);
    this.wireRenderer = new SWireRenderer_1.SWireRenderer(this);
    this.trashRenderer = new STrashcanRenderer_1.default(this);
  }

  createEntity(name) {
    return name + "-" + Math.random().toString(16).slice(2, 6);
  }

  invokeCallback([systemName, methodName, args]) {
    const system = this[systemName];
    const method = system[methodName];
    return method.apply(system, args);
  }

}

exports.ECS = ECS;
},{"./SAudio":"hFzp","./SAutosave":"CMn8","./SButtonClicker":"pdbw","./SButtonRenderer":"qn35","./SDeviceRenderer":"sopS","./SDeviceSaver":"AuQU","./SDisplay":"Nj29","./SDragAndDrop":"jnFJ","./SKnobManager":"SdOw","./SKnobRenderer":"LnCi","./SMidi":"RQ1L","./SMouseInput":"OXog","./SPointerGrabber":"c8pg","./SPortRenderer":"FbqG","./SPrefabs":"ILBV","./SScopeRenderer":"j0NI","./STrash":"NQ8u","./STrashcanRenderer":"BtAL","./SWireManager":"TXlZ","./SWireRenderer":"Ey0W"}],"QCba":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const ECS_1 = require("./ECS");

const ecs = new ECS_1.ECS();
Object.assign(window, {
  ecs
});
},{"./ECS":"y35b"}]},{},["QCba"], null)
//# sourceMappingURL=https://joanrieu.github.io/modular-synth-sandbox/src.ab20e588.js.map