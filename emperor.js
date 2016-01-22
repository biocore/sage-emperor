//
// SAGE2 application: emperor
// by: McHelper Penguin <emperor@emperor.microbio.me>
//
// Copyright (c) 2015
//

// This function was copied over from @squirrelo's bokeh SAGE2 app
function addCSS(url) {
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", url);
    document.head.appendChild(fileref);
}


var emperor = SAGE2_WebGLApp.extend( {
  init: function(data) {
    this.WebGLAppInit('canvas', data);

    this.ready = false;
    this.ec = null;
    this.dm = null;

    requirejs.config({
      'baseUrl': this.resrcPath + 'emperor/emperor/support_files/',

      // the left side is the module name, and the right side is the path
      // relative to the baseUrl attribute, do NOT include the .js extension
      'paths': {
      /* jQuery */
      'jquery': './vendor/js/jquery-2.1.4.min',
      'jqueryui': './vendor/js/jquery-ui.min',
      'jquery_drag': './vendor/js/jquery.event.drag-2.2.min',

      /* jQuery plugins */
      'chosen': './vendor/js/chosen.jquery.min',
      'spectrum': './vendor/js/spectrum.min',

      /* other libraries */
      'underscore': './vendor/js/underscore-min',
      'chroma': './vendor/js/chroma.min',

      /* THREE.js and plugins */
      'three': './vendor/js/three.min',
      'orbitcontrols': './vendor/js/three.js-plugins/OrbitControls',

      /* SlickGrid */
      'slickcore': './vendor/js/slick.core.min',
      'slickgrid': './vendor/js/slick.grid.min',
      'slickformatters': './vendor/js/slick.editors.min',
      'slickeditors': './vendor/js/slick.formatters.min',

      /* Emperor's objects */
      'model': './js/model',
      'view': './js/view',
      'controller': './js/controller',
      'scene3d': './js/sceneplotview3d',
      'viewcontroller': './js/view-controller',
      'colorviewcontroller': './js/color-view-controller',
      'visibilitycontroller': './js/visibility-controller',
      'color-editor': './js/color-editor',
      },
      /*
        Libraries that are not AMD compatible need shim to declare their
        dependencies.
      */
      'shim': {
        'jquery_drag': {
          'deps': ['jquery', 'jqueryui']
        },
        'chosen': {
          'deps': ['jquery'],
          'exports': 'jQuery.fn.chosen'
        },
        'orbitcontrols': {
          'deps': ['three']
        },
        'slickcore': ['jqueryui'],
        'slickgrid': [
          'slickcore', 'jquery_drag', 'slickformatters', 'slickeditors'
        ]
      }
    }); // require config

    var scope = this;

    // Create div into the DOM
    // Set the background to black
    this.element.style.backgroundColor = 'black';
    this.element.id = 'plots';

    addCSS(this.resrcPath + 'emperor/emperor/support_files/css/emperor.css');
    addCSS(this.resrcPath + 'emperor/emperor/support_files/vendor/css/jquery-ui.min.css');
    addCSS(this.resrcPath + 'emperor/emperor/support_files/vendor/css/slick.grid.min.css');
    addCSS(this.resrcPath + 'emperor/emperor/support_files/vendor/css/spectrum.min.css');
    addCSS(this.resrcPath + 'emperor/emperor/support_files/vendor/css/chosen.min.css');

    requirejs(['jquery', 'model', 'controller'],
      function($, model, EmperorController){
        var DecompositionModel = model.DecompositionModel;

        var name = "pcoa";
        var ids = ['PC.636', 'PC.635', 'PC.356', 'PC.481', 'PC.354', 'PC.593',
                   'PC.355', 'PC.607', 'PC.634'];
        var coords = [
        [-0.276542, -0.144964, 0.066647, -0.067711, 0.176070, 0.072969,
        -0.229889, -0.046599],
        [-0.237661, 0.046053, -0.138136, 0.159061, -0.247485, -0.115211,
        -0.112864, 0.064794],
        [0.228820, -0.130142, -0.287149, 0.086450, 0.044295, 0.206043,
        0.031000, 0.071992],
        [0.042263, -0.013968, 0.063531, -0.346121, -0.127814, 0.013935,
        0.030021, 0.140148],
        [0.280399, -0.006013, 0.023485, -0.046811, -0.146624, 0.005670,
        -0.035430, -0.255786],
        [0.232873, 0.139788, 0.322871, 0.183347, 0.020466, 0.054059,
        -0.036625, 0.099824],
        [0.170518, -0.194113, -0.030897, 0.019809, 0.155100, -0.279924,
        0.057609, 0.024248],
        [-0.091330, 0.424147, -0.135627, -0.057519, 0.151363, -0.025394,
        0.051731, -0.038738],
        [-0.349339, -0.120788, 0.115275, 0.069495, -0.025372, 0.067853,
               0.244448, -0.059883]];
        var pct_var = [26.6887048633, 16.2563704022, 13.7754129161,
             11.217215823, 10.024774995, 8.22835130237, 7.55971173665,
             6.24945796136];
        var md_headers = ['SampleID', 'LinkerPrimerSequence',
             'Treatment', 'DOB'];
        var metadata = [
           ['PC.636', 'YATGCTGCCTCCCGTAGGAGT', 'Control', '20070314'],
           ['PC.635', 'YATGCTGCCTCCCGTAGGAGT', 'Fast', '20071112'],
           ['PC.356', 'YATGCTGCCTCCCGTAGGAGT', 'Fast', '20080116'],
           ['PC.481', 'YATGCTGCCTCCCGTAGGAGT', 'Fast', '20080116'],
           ['PC.354', 'YATGCTGCCTCCCGTAGGAGT', 'Control', '20071210'],
           ['PC.593', 'YATGCTGCCTCCCGTAGGAGT', 'Fast', '20080116'],
           ['PC.355', 'YATGCTGCCTCCCGTAGGAGT', 'Control', '20061218'],
           ['PC.607', 'YATGCTGCCTCCCGTAGGAGT', 'Control', '20061218'],
           ['PC.634', 'YATGCTGCCTCCCGTAGGAGT', 'Control', '20061126']];

        // Initialize the DecompositionModel
        scope.dm = new DecompositionModel(name, ids, coords, pct_var,
                                          md_headers, metadata);

        // Initialize the EmperorController
        scope.ec = new EmperorController(scope.dm, 'plots', scope.canvas);  
        scope.ready = true;

        scope.refresh(data.date);
      }
    );

    // move and resize callbacks
    this.resizeEvents = "onfinish";

    // SAGE2 Application Settings
    //
    // Control the frame rate for an animation application
    this.maxFPS = 30.0;
    // Not adding controls but making the default buttons available
    this.controls.finishedAddingControls();
    this.enableControls = true;
          
    this.resizeCanvas();
    this.refresh(data.date);
  },

  load: function(date) {
    console.log('emperor> Load with state value', this.state.value);
    this.refresh(date);
  },

  draw: function(date) {
    console.log('emperor> ready', this.ready);
    if (this.ready) {
      console.log("WebGL context>", this.gl);
      console.log("EC", this.ec);
      this.ec.render();
    }
  },

  resizeApp: function(resizeData) {
    if (this.renderer !== null && this.camera !== null) {
      this.renderer.setSize(this.canvas.width, this.canvas.height);

      this.camera.setViewOffset(this.sage2_width, this.sage2_height,
                  resizeData.leftViewOffset, resizeData.topViewOffset,
                  resizeData.localWidth, resizeData.localHeight);
      this.cameraCube.setViewOffset(this.sage2_width, this.sage2_height,
                  resizeData.leftViewOffset, resizeData.topViewOffset,
                  resizeData.localWidth, resizeData.localHeight);
      console.log('width: '+this.sage2_width);
      console.log('height: '+this.sage2_height);
      this.ec.resize(this.sage2_width, this.sage2_height);
    }
  },

  move: function(date) {
    this.refresh(date);
  },

  quit: function() {
    // Make sure to delete stuff (timers, ...)
  },

  event: function(eventType, position, user_id, data, date) {
    if (eventType === "pointerPress" && (data.button === "left")) {
    }
    else if (eventType === "pointerMove" && this.dragging) {
    }
    else if (eventType === "pointerRelease" && (data.button === "left")) {
    }
    // Scroll events for zoom
    else if (eventType === "pointerScroll") {
    }
    else if (eventType === "widgetEvent"){
    }
    else if (eventType === "keyboard") {
      if (data.character === "m") {
        this.refresh(date);
      }
    }
    else if (eventType === "specialKey") {
      if (data.code === 37 && data.state === "down") { // left
        this.refresh(date);
      }
      else if (data.code === 38 && data.state === "down") { // up
        this.refresh(date);
      }
      else if (data.code === 39 && data.state === "down") { // right
        this.refresh(date);
      }
      else if (data.code === 40 && data.state === "down") { // down
        this.refresh(date);
      }
    }
  }
});
