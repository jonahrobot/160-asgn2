// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGl(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true})
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function setupGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Connect up u_Size variable
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    } 

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    } 

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix,false,identityM.elements);
}

// Globals for HTML UI
let g_yellowAngle = 0;
let g_globalAngle = 60;
let g_pinkSlide = 0;

function setupHTMLUIActions(){

    document.getElementById('angleSlide').addEventListener('mousemove', function(){g_globalAngle = this.value; renderAllShapes();});
    document.getElementById('yellowSlide').addEventListener('mousemove', function(){g_yellowAngle = this.value; renderAllShapes();});
    document.getElementById('pinkSlide').addEventListener('mousemove', function(){g_pinkSlide = this.value; renderAllShapes();});
    
}

function main() {

  setupWebGl();
  setupGLSL();

  // Setup actions for HTML elements
  setupHTMLUIActions();

    //   // Register function (event handler) to be called on a mouse press
    //   canvas.onmousedown = click;
    //   canvas.onmousemove = function(ev){
    //     if(ev.buttons == 1){
    //         click(ev);
    //     }
    //   }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  renderAllShapes();
}

// function click(ev) {
//     // Extract the event click and return it in WebGL coordinates
//     let [x,y] = convertCordEventToGL(ev);
// }

function renderAllShapes(){

    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw cube body
    var body = new Cube();
    body.color = [1,0,0,1];
    body.matrix.setTranslate(-0.25,-0.75,0.0); // Translate second
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(0.5,0.3,0.5);
    body.render();

    // Draw left arm
    var arm = new Cube();
    arm.color = [1,1,0,1];
    arm.matrix.setTranslate(0, -0.5, 0); // Translate second
    arm.matrix.rotate(-5,1,0,0);
    arm.matrix.rotate(-g_yellowAngle,0,0,1);
    var yellowMatrix = new Matrix4(arm.matrix);
    arm.matrix.scale(0.25,0.7,0.5);
    arm.matrix.translate(-0.5,0,0);
    arm.render();

    var box = new Cube();
    box.color = [1,0,1,1];
    box.matrix = yellowMatrix;
    box.matrix.translate(0, 0.65,0); // Translate second
    box.matrix.rotate(g_pinkSlide,0,0,1);
    box.matrix.scale(0.3,0.3,0.3);
    box.matrix.translate(-0.5,0,-0.001,0);
    box.render();
}

function sendTextToHTML(text,htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function convertCordEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}