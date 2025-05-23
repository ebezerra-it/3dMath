const canvasConfig = {
  width: 600,
  height: 600,
}
let canvas;
let img;
const imageName = "w11logo.jpg";

var p0 = { x: -100, y: -100};
var p1 = { x: 100, y: -100};
var p2 = { x: -100, y: 100 };
var p3 = { x: 100, y: 100};

const txtLinePrecision = 2;
const txtPointPrecision = 2;
const txtPointSize = 6.0;

const speed = 0.08;

let triangle1 = [];
let triangle2 = [];

let gl;
let glcanvas;
let theta, mx, my, ray = 150;
let flag = true;
let font;
let fontcolor = 255;
let fontinc = 2;
const fontFile = 'KyivMachine.ttf'; 
let cv;
let txt;

const textureWorker1 = new Worker("textureWorker.js");
const textureWorker2 = new Worker("textureWorker.js");

p5.disableFriendlyErrors = true;

function setup() {


 var a = createA('https://www.linkedin.com/in/ebezerra-it', 'Develpoped by Eduardo Bezerra', '_blank');
  a.position(10, 10);
  a.style('font-size', '12px');
  a.style('font-family', 'arial');
  a.style('text-decoration', 'none');
  a.style('font-weight', 'normal');
  a.style('color', '#ffffff'); 

  const glcanvas = document.getElementById('glcanvas');
  glcanvas.width = canvasConfig.width;
  glcanvas.height = canvasConfig.height;
  gl = glcanvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: true });

  theta = 0;

  cnv = createCanvas(canvasConfig.width, canvasConfig.height, WEBGL, glcanvas); 

  txt = createGraphics(canvasConfig.width, canvasConfig.height);
  //console.log(txt.elt.style);
  txt.elt.style.display = "block";
  txt.elt.style.position = "absolute";  
  txt.elt.style.top = "100px";
  txt.elt.style.left = 0;
  txt.elt.style.zIndex = 10;

  txt.background(color(255,255,255,0));

  img.resize(256, 256);
  img.loadPixels();

  frameRate(30);
}

function preload() {
  img = loadImage(imageName,()=>{}, () => { console.log(`!!![ERROR - Can't read image: ${imageName}]!!!`); noLoop(); });
  font = loadFont(fontFile, ()=>{}, () => { console.log(`!!![ERROR - Can't read font: ${fontFile}]!!!`); noLoop(); });
} 

function draw() {
  //webglcleanbackground({ r: 255, g: 255, b: 255, a: 255});
  background(0);
  theta += speed*2/3;
  if (theta > 2*Math.PI) theta -= 2*Math.PI;

  mx = ray * Math.cos(theta);
  my = ray * Math.sin(theta);

  p0 = rotate2d(p0, speed);
  p1 = rotate2d(p1, speed);
  p2 = rotate2d(p2, speed);
  p3 = rotate2d(p3, speed);

  fontcolor -= fontinc; 
  if (fontcolor < 0) {
    fontcolor = 0;
    fontinc = -fontinc
  } else if (fontcolor>255) {
    fontinc = -fontinc;
  }

  txt.textFont(font); 
  txt.textSize(40);
  txt.fill(color(fontcolor, fontcolor, fontcolor));
  
  txt.text('The Texture', canvasConfig.width/2-80, canvasConfig.height/2+250);

  fillQuadTexture(p0, p1, p2, p3, img);
}

function fillQuadTexture(p0, p1, p2, p3, myTexture) {
  
  //Draw triangle1 in separated thread
  textureWorker1.postMessage({
    p0,
    p1,
    p2,
    myTexture: myTexture.pixels,
    myTextureWidth: myTexture.width,
    ptxt0: { x: 0, y: 0 }, 
    ptxt1: {x: myTexture.width - 1, y: 0 }, 
    ptxt2: { x: 0, y: myTexture.height - 1},
    txtLinePrecision,
    txtPointPrecision,
    id: 1
  });
  textureWorker1.onmessage = (msg) => {
    triangle1 = msg.data.triangle;
  }; 
  
  //Draw triangle2 in separated thread
  textureWorker2.postMessage({
    p0: p3, 
    p1: p2, 
    p2: p1, 
    myTexture: myTexture.pixels,
    myTextureWidth: myTexture.width,
    ptxt0: { x: myTexture.width - 1, y: myTexture.height - 1 }, 
    ptxt1: { x: 0, y: myTexture.height - 1}, 
    ptxt2: {x: myTexture.width - 1, y: 0 },
    txtLinePrecision,
    txtPointPrecision,
    id: 2
  });
  textureWorker2.onmessage = (msg) => {
    triangle2 = msg.data.triangle;
  };

  if (triangle1 && triangle2) { 

    if (triangle1.length === 0 || triangle2.length === 0) return;

    // webglcleanbackground({ r: 255, g: 255, b: 255, a: 255});
    webglDrawPointsArray(
      [
        ...triangle1,
        ...triangle2,
      ]
    );

  }
}

function rotate2d(p2d, angle) {
  if (angle == 0) return p2d;
  
  var x2 = Math.round(p2d.x*Math.cos(angle) - p2d.y*Math.sin(angle));
  var y2 = Math.round(p2d.y*Math.cos(angle) + p2d.x*Math.sin(angle));
  
  return {x: x2, y: y2};
}

function normalize(data, min_value, max_value) {
  return (data - min_value) / (max_value - min_value);
}

function webglDrawPointsArray(pointsData) {

  if (!pointsData) return;

  const colors = [];
  const points = [];

  for (let i=0; i<pointsData.length;i++) {
    
    points.push(
      normalize(pointsData[i].x+mx, 0, canvasConfig.width/2), 
      normalize(pointsData[i].y-my, 0, canvasConfig.height/2), 
      0.0
    );

    colors.push(
      normalize(pointsData[i].r, 0, 255),
      normalize(pointsData[i].g, 0, 255),
      normalize(pointsData[i].b, 0, 255),
      normalize(pointsData[i].a, 0, 255),
    );

  }
 
  var vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // vertex shader source code
  var vertCode =
    'attribute vec3 coordinates;' +
    'attribute vec4 color;' +
    'varying vec4 vColor;'+
    'void main(void) {' +
      'gl_Position = vec4(coordinates, 1.0);' +
      'vColor = color;'+
     // 'glEnable(GL_PROGRAM_POINT_SIZE);'
      'gl_PointSize = ' + txtPointSize.toFixed(1) + ';' +
      // 'glPointSize(' + txtPointSize.toFixed(1) + ');' +
    '}';

  //console.log(vertCode);
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);

  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) 
    console.log(gl.getShaderInfoLog(vertShader));


  var color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null); 

  // fragment shader source code
  var fragCode = 'precision mediump float;'+
  'varying vec4 vColor;'+
  'void main(void) {'+
      'gl_FragColor = vec4(vColor);'+
  '}';

  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) 
    console.log(gl.getShaderInfoLog(fragShader));

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader); 
  gl.attachShader(shaderProgram, fragShader);

  // Link both programs
  gl.linkProgram(shaderProgram);
  if ( !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) )
    console.log(gl.getProgramInfoLog(shaderProgram));

  gl.useProgram(shaderProgram);
  gl.enable(gl.DEPTH_TEST);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  var coord = gl.getAttribLocation(shaderProgram, "coordinates");
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);

  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  var color = gl.getAttribLocation(shaderProgram, "color");
  gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0) ;
  gl.enableVertexAttribArray(color); 

  // Draw points
  //gl.enable(gl.GL_PROGRAM_POINT_SIZE);
  console.log(gl);
  //strokeWeight(4); 
  gl.drawArrays(gl.POINTS, 0, points.length/3); 
}

function webglcleanbackground(rgbaColor) {
  gl.clearColor(
    normalize(rgbaColor.r, 0, 255),
    normalize(rgbaColor.g, 0, 255),
    normalize(rgbaColor.b, 0, 255),
    normalize(rgbaColor.a, 0, 255),
  );

  // Enable the depth test
  //gl.enable(gl.DEPTH_TEST);

  // Clear the color buffer bit
  //gl.clear(gl.COLOR_BUFFER_BIT);
}