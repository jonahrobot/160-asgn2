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
let g_animating = false;

let g_globalAngle = 0;
let g_globalAngle_y = 0;
let g_pinkSlide = 0;

let g_LWING_angle = 25;
let g_RWING_angle = 25;
let g_RWING2_angle = -45;
let g_RWING3_angle = -45;
let g_head_angle = 0;
let g_body_angle = 0;

let toggleSpeed = 1;

function setupHTMLUIActions(){

    document.getElementById('angleSlide').addEventListener('mousemove', function(){g_globalAngle = this.value; renderAllShapes();});

    // Rotate individual parts
    document.getElementById('g_LWING_angle').addEventListener('mousemove', function(){g_LWING_angle = this.value; renderAllShapes();});
    document.getElementById('g_RWING_angle').addEventListener('mousemove', function(){g_RWING_angle = this.value; renderAllShapes();});
    document.getElementById('g_head_angle').addEventListener('mousemove', function(){g_head_angle = this.value; renderAllShapes();});
    document.getElementById('g_body_angle').addEventListener('mousemove', function(){g_body_angle = this.value; renderAllShapes();});
    document.getElementById('g_RWING2_angle').addEventListener('mousemove', function(){g_RWING2_angle = this.value; renderAllShapes();});
    document.getElementById('g_RWING3_angle').addEventListener('mousemove', function(){g_RWING3_angle = this.value; renderAllShapes();});

    document.getElementById('animationYellowOnButton').onclick = function(){ g_animating = true; }
    document.getElementById('animationYellowOffButton').onclick = function(){ g_animating = false; }
    
}

function main() {

  setupWebGl();
  setupGLSL();

  // Setup actions for HTML elements
  setupHTMLUIActions();

      // Register function (event handler) to be called on a mouse press
      canvas.onmousedown = function(ev){
        if(ev.buttons == 1 && ev.shiftKey){
            toggleSpeed += 1
            if(toggleSpeed > 10){
                toggleSpeed = 1;
            }
        }
      }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  renderAllShapes();

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){

    g_seconds = performance.now()/1000.0 - g_startTime;
    //console.log(g_seconds);

    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function click(ev) {
    // Extract the event click and return it in WebGL coordinates
    let [x,y] = convertCordEventToGL(ev);
}

function updateAnimationAngles(){
    if(g_animating){




            g_LWING_angle = (25 * Math.sin(g_seconds*10 * toggleSpeed));
            g_RWING_angle  = (25 * Math.sin(g_seconds*10 * toggleSpeed));
            g_head_angle  = (5 * Math.cos(g_seconds) * 3 * toggleSpeed); 
            g_body_angle = (15 * Math.sin(g_seconds* 3 * toggleSpeed));
            g_RWING2_angle = (-45 * Math.abs(Math.sin(g_seconds* 3 * toggleSpeed)));
            g_RWING3_angle =  (-45 * Math.abs(Math.sin(g_seconds* 3 * toggleSpeed)));
        
    }
}

function renderAllShapes(){

    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Chicken
    var body = new Cube();
    body.color = [1,1,1,1];
    body.matrix.rotate(g_body_angle,0,0,1);
    var bodyParent = new Matrix4(body.matrix);
    body.matrix.scale(0.5,0.4,0.5);
    body.matrix.translate(-0.5,-0.5,-0.5);
    body.render();

    var RWing = new Cube();
    RWing.color = [0.8,0.8,0.8,1];
    RWing.matrix = new Matrix4(bodyParent);
    RWing.matrix.rotate(g_RWING_angle,0,0,1);
    var wingParentA = new Matrix4(RWing.matrix);
    RWing.matrix.translate(0,0,-0.2,0);
    RWing.matrix.scale(0.5,0.1,0.4);

    RWing.render();

    var RWing2 = new Cube();
    RWing2.color = [0.8,0.8,0.8,1];
    RWing2.matrix = new Matrix4(wingParentA);
    RWing2.matrix.translate(0.4,0.1,-0.1,0);
    RWing2.matrix.rotate(g_RWING2_angle,0,0,1);
    var wingParentParentD = new Matrix4(RWing2.matrix);
    RWing2.matrix.scale(0.3,0.1,0.4);
    RWing2.render();

    var RWing3 = new Cube();
    RWing3.color = [0.8,0.8,0.8,1];
    RWing3.matrix = new Matrix4(wingParentParentD);
    RWing3.matrix.translate(0.2,0.05,-0.1,0);
    RWing3.matrix.rotate(g_RWING3_angle,0,0,1);
    RWing3.matrix.scale(.2,0.1,0.4);
    RWing3.render();

    var LWing = new Cube();
    LWing.color = [0.8,0.8,0.8,1];
    LWing.matrix = new Matrix4(bodyParent);
    LWing.matrix.translate(0,0,-0.2,0);
    LWing.matrix.rotate(-g_LWING_angle,0,0,1);
    var wingParentB = new Matrix4(LWing.matrix);
    LWing.matrix.scale(-0.5,0.1,0.4);
    LWing.render();

    var LWing2 = new Cube();
    LWing2.color = [0.8,0.8,0.8,1];
    LWing2.matrix = new Matrix4(wingParentB);
    LWing2.matrix.translate(-0.4,0.1,-0.1,0);
    LWing2.matrix.rotate(-g_RWING2_angle,0,0,1);
    var wingParentParentC = new Matrix4(LWing2.matrix);
    LWing2.matrix.scale(0-.3,0.1,0.4);
    LWing2.render();

    var LWing3 = new Cube();
    LWing3.color = [0.8,0.8,0.8,1];
    LWing3.matrix = new Matrix4(wingParentParentC);
    LWing3.matrix.translate(-0.2,0.05,-0.1,0);
    LWing3.matrix.rotate(-g_RWING3_angle,0,0,1);
    LWing3.matrix.scale(0-.2,0.1,0.4);
    LWing3.render();

    var Head = new Cube();
    Head.color = [1,1,1,1];
    Head.matrix = bodyParent;
    Head.matrix.rotate(g_head_angle,0,0,1);
    var headParent = new Matrix4(Head.matrix);
    Head.matrix.scale(0.3,0.33,0.3);
    Head.matrix.translate(-0.5,0.4,-1.2);
    Head.render();

    var nose = new Cube();
    nose.color = [1,1,0,1];
    nose.matrix = new Matrix4(headParent);
    nose.matrix.scale(0.2,0.1,0.1);
    nose.matrix.translate(-0.5,2.5,-4.3);
    nose.render();

    var eye1 = new Cube();
    eye1.color = [0,0,0,1];
    eye1.matrix = new Matrix4(headParent);
    eye1.matrix.scale(0.05,0.05,0.05);
    eye1.matrix.translate(-2,7,-7.5);
    eye1.render();

    var eye2 = new Cube();
    eye2.color = [0,0,0,1];
    eye2.matrix = new Matrix4(headParent);
    eye2.matrix.scale(0.05,0.05,0.05);
    eye2.matrix.translate(1,7,-7.5);
    eye2.render();

    var redFluff = new Cube();
    redFluff.color = [1,0,0,1];
    redFluff.matrix = new Matrix4(headParent);
    redFluff.matrix.scale(0.1,0.1,0.1);
    redFluff.matrix.translate(-0.5,1.5,-4.2);
    redFluff.render();




    // // Draw cube body
    // var body = new Cube();
    // body.color = [1,0,0,1];
    // body.matrix.setTranslate(-0.25,-0.75,0.0); // Translate second
    // body.matrix.rotate(-5,1,0,0);
    // body.matrix.scale(0.5,0.3,0.5);
    // body.render();

    // Draw left arm
    // var arm = new Cube();
    // arm.color = [1,1,0,1];
    // arm.matrix.setTranslate(0, -0.5, 0); // Translate second
    // arm.matrix.rotate(-5,1,0,0);

    // arm.matrix.rotate(-g_yellowAngle,0,0,1);

    // var yellowMatrix = new Matrix4(arm.matrix);

    // arm.matrix.scale(0.25,0.7,0.5);
    // arm.matrix.translate(-0.5,0,0);
    // arm.render();

    // var box = new Cube();
    // box.color = [1,0,1,1];
    // box.matrix = yellowMatrix;
    // box.matrix.translate(0, 0.65,0); // Translate second
    // box.matrix.rotate(g_pinkSlide,0,0,1);
    // box.matrix.scale(0.3,0.3,0.3);
    // box.matrix.translate(-0.5,0,-0.001,0);
    // box.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/ duration)/10, "numdot");
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