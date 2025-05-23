/*
Developed by Eduardo Bulhões
Date: 26/10/2023
edubbulhoes@gmail.com
linkedin: www.linkedin.com/in/ebezerra-it
Points:
(±φ,±1,0)
 φ=(1+√5)/2
*/
const canvas2d = { x: 800, y: 600 };
const viewcamera = { x: 0, y: 0, z: -5};
const viewTypeTimer = 10000; // 10 seconds
const maxAxisSpeed = 0.05;
const phi = (1 + Math.sqrt(5))/2;

var points = [];
var faces = [];
var zoomcamera = 100;
var rot3d = {x: 0.0, y: 0.0, z: 0.0};
var newVel3d = {x: 0.0, y: 0.0, z: 0.0};
var vel3d = {x: 0.0, y: 0.0, z: 0.0};
var acel3d = {x: 0.0, y: 0.0, z: 0.0};
var viewType = 0; // 0 - wireframe; 1-solid; 2-solid w/ light
var solidColor = { r: 240, g: 240, b: 240 };
var newSolidColor = { r: 0, g: 0, b: 0 };
var acelSolidColor = { r: 0, g: 0, b: 0 };
var start = false;

function setup() {
  const cnv = createCanvas(canvas2d.x, canvas2d.y);
  
  var a = createA('https://www.linkedin.com/in/ebezerra-it', 'Develped by Eduardo Bezerra', '_blank');
  a.position(10, 10);
  a.style('font-size', '12px');
  a.style('font-family', 'arial');
  a.style('text-decoration', 'none');
  a.style('font-weight', 'normal');
  a.style('color', '#ffffff');  
  
  cnv.mouseClicked(() => {
    start = !start;
    if (start) changeRotation();
  });
  cnv.mouseWheel((event) => {
    if (event.deltaY < 0) {
      if (zoomcamera - 10 < 10) 
        zoomcamera = 10;
      else zoomcamera -= 10;
    } else if (event.deltaY > 0) {
      if (zoomcamera + 10 > 180) 
        zoomcamera = 180;
      else zoomcamera += 10;
    }
  }); 

  points = [
    {x:  phi, y:  1, z: 0},
    {x:  phi, y: -1, z: 0},
    {x: -phi, y: -1, z: 0},
    {x: -phi, y:  1, z: 0},
    {x:  1, y: 0, z:  phi},
    {x: -1, y: 0, z:  phi},
    {x: -1, y: 0, z: -phi},
    {x:  1, y: 0, z: -phi},
    {x: 0, y:  phi, z:  1},
    {x: 0, y:  phi, z: -1},
    {x: 0, y: -phi, z: -1},
    {x: 0, y: -phi, z:  1},
  ];

  faces = [
    [  6, 10,  7],
    [  6,  7,  9],
    [ 10,  6,  2], 
    [  3,  6,  9],
    [  3,  2,  6], 
    [  0,  7,  1],
    [  7, 10,  1],
    [  0,  9,  7], 
    [ 11, 10,  2], 
    [ 10, 11,  1],
    [ 11,  5,  4],
    [  4,  5,  8], 
    [  5, 11,  2],
    [  5,  3,  8],
    [  4,  8,  0],
    [  8,  9,  0],
    [  1, 11,  4],
    [  1,  4,  0],
    [  2,  3,  5],
    [  8,  3,  9],
  ]; 
  
  setInterval(() => {
    if (start) {
      viewType = viewType === 3 ? 0 : viewType + 1;
    }
  }, viewTypeTimer);
 }

function draw() {
  background(0);
  showAxisSpeed();
  drawSolid();
  
  if (start) { 
    rotateSolid();
  } else {
      textSize(20);
      strokeWeight(0);
      stroke("white");
      fill("white");
      textStyle(NORMAL);
      text('Click to start', canvas2d.x/2-60, canvas2d.y/2+240);
  }
}

function showAxisSpeed() {
  // Show axis speed
  textSize(10);
  strokeWeight(0);
  stroke("white");
  fill("white");
  textStyle(NORMAL);
  text('Axis speed x: ' + Math.round(vel3d.x*1000)/1000 + ' y: ' + Math.round(vel3d.y*1000)/1000 + ' z: ' + Math.round(vel3d.z*1000)/1000, 10, 40);
}

function keyPressed() {
  switch(keyCode) {
    case 32:
      start = !start;
      if (start) changeRotation();
      break;
    case 107: //KEYPAD "+"
      zoomcamera = zoomcamera >= 180 ? 180 : zoomcamera + 10;
      break;
    case 109: //KEYPAD "-"
      zoomcamera = zoomcamera <= 10 ? 10 : zoomcamera - 10;
      break;
  }
}

function rotateSolid() {
  rot3d.x += vel3d.x;
  rot3d.y += vel3d.y;
  rot3d.z += vel3d.z;
  
  for (var i = 0; i<points.length; i++) {
    points[i] = rotate3d(points[i], vel3d);
  }
  
  vel3d.x += acel3d.x;
  vel3d.y += acel3d.y;
  vel3d.z += acel3d.z;
  
  solidColor.r = solidColor.r + acelSolidColor.r;
  solidColor.g = solidColor.g + acelSolidColor.g;
  solidColor.b = solidColor.b + acelSolidColor.b;
  
  if (Math.abs(vel3d.x) > maxAxisSpeed || Math.abs(vel3d.y) > maxAxisSpeed || Math.abs(vel3d.z) > maxAxisSpeed)
    changeRotation();
  else 
    if (Math.abs(Math.abs(vel3d.x) - Math.abs(newVel3d.x)) < Math.abs(acel3d.x) ||
        Math.abs(Math.abs(vel3d.y) - Math.abs(newVel3d.y)) < Math.abs(acel3d.y) ||
        Math.abs(Math.abs(vel3d.z) - Math.abs(newVel3d.z)) < Math.abs(acel3d.z))
      changeRotation();
}

function point3dTo2d(p3d) {
  return { 
    x: Math.round(p3d.x*(viewcamera.z + p3d.z) / viewcamera.z * zoomcamera + canvas2d.x/2),
    y: Math.round(p3d.y*(viewcamera.z + p3d.z) / viewcamera.z * zoomcamera + canvas2d.y/2),
  }
}

function drawSolid() {
  // viewType = 3
  if (viewType == 0) {
    drawPoints();
  } else {
    for(var i = 0;i<faces.length;i++) {
      drawFace(faces[i]);
    }
  }
}

function drawPoints() {
  stroke("white");
  for (var i = 0; i < points.length; i++) {
    var p2d = point3dTo2d(points[i]);
    var pointSize = -points[i].z + 5;
    strokeWeight(pointSize);
    point(p2d.x, p2d.y);
  }
}

function drawFace(face) {
    var p2d1 = point3dTo2d(points[face[0]]);
    var p2d2 = point3dTo2d(points[face[1]]);
    var p2d3 = point3dTo2d(points[face[2]]);

    if (viewType === 1) {
      stroke("white");
      strokeWeight(1);
      line(p2d1.x, p2d1.y, p2d2.x, p2d2.y);
      line(p2d2.x, p2d2.y, p2d3.x, p2d3.y);
      line(p2d3.x, p2d3.y, p2d1.x, p2d1.y);
    } else {
      var faceNormal = faceVecNormal(face);
      costheta = cosVec1Vec2(faceNormal, viewcamera);
      // console.log(faceNormal);
      if (costheta > 0.25) {
        var c;
        if (viewType === 2) {
          stroke("white");
          strokeWeight(1);
          c = color(solidColor.r, solidColor.g, solidColor.b);
        } else {
          c = color(solidColor.r*costheta, solidColor.g*costheta, solidColor.b*costheta);
          noStroke();
        }
        fill(c);
        quad(p2d1.x, p2d1.y, p2d2.x, p2d2.y, p2d3.x, p2d3.y, p2d3.x, p2d3.y);
      }
    }
}

function rotate3d(p3d, vel3d) {
  var rotp3d = p3d;
  rotp3d = rotate3dx(rotp3d, vel3d.x);
  rotp3d = rotate3dy(rotp3d, vel3d.y);
  rotp3d = rotate3dz(rotp3d, vel3d.z);
  
  return rotp3d;
}

function rotate3dz(p3d, angle) {
  if (angle == 0) return p3d;
  
  var x2 = p3d.x*Math.cos(angle) - p3d.y*Math.sin(angle);
  var y2 = p3d.y*Math.cos(angle) + p3d.x*Math.sin(angle);
  
  return {x: x2, y: y2, z: p3d.z};
}

function rotate3dx(p3d, angle) {
  if (angle == 0) return p3d;
  
  var z2 = p3d.z*Math.cos(angle) - p3d.y*Math.sin(angle);
  var y2 = p3d.y*Math.cos(angle) + p3d.z*Math.sin(angle);
  
  return {x: p3d.x, y: y2, z: z2};
}

function rotate3dy(p3d, angle) {
  if (angle == 0) return p3d;
  
  var x2 = p3d.x*Math.cos(angle) - p3d.z*Math.sin(angle);
  var z2 = p3d.z*Math.cos(angle) + p3d.x*Math.sin(angle);
  
  return {x: x2, y: p3d.y, z: z2};
}

function faceVecNormal(face) {
  var p3d1 = vectorDiff(points[face[2]], points[face[0]]);
  var p3d2 = vectorDiff(points[face[1]], points[face[0]]);
  
  return vectorProduct(p3d1, p3d2);
}

function scalarVector(vector, scalar) {
  return { 
    x: vector.x * scalar,
    y: vector.y * scalar,
    z: vector.z * scalar,
  }
}
  
function vectorDiff(vec1, vec2) {
  return {
    x: vec1.x - vec2.x,
    y: vec1.y - vec2.y,
    z: vec1.z - vec2.z,
  }
}

function vectorScalar(vec1, vec2) {
  return vec1.x*vec2.x + vec1.y*vec2.y + vec1.z*vec2.z;
}
  
function vectorModule(vector) {
  return Math.sqrt(vector.x*vector.x + vector.y*vector.y + vector.z*vector.z);
}

function cosVec1Vec2(vec1, vec2) {
  var modVec1 = vectorModule(vec1);
  var modVec2 = vectorModule(vec2);

  if (modVec1 == 0 || modVec1 == 0) return 0;
  return vectorScalar(vec1, vec2) / (modVec1 * modVec2);
}

function vectorProduct(vec1, vec2) {
  var xn = vec1.y * vec2.z - vec1.z*vec2.y;
  var yn = vec1.z * vec2.x - vec1.x*vec2.z;
  var zn = vec1.x * vec2.y - vec1.y*vec2.x;
  
  return {x: xn, y: yn, z: zn};
}

function changeRotation() {
  const axisSpeed = {
    min: -maxAxisSpeed,
    max: maxAxisSpeed,
  };
  const shadeColors = {
    min: 80,
    max: 250,
  };
  const steps = 500; // interpolation steps
  
  var randomBetween = (min, max) => Math.round(Math.random() * (max - min)*100)/100 + min;
  newVel3d = {
    x: randomBetween(axisSpeed.min, axisSpeed.max),
    y: randomBetween(axisSpeed.min, axisSpeed.max),
    z: randomBetween(axisSpeed.min, axisSpeed.max),
  };
  acel3d = { 
    x: (newVel3d.x - vel3d.x)/steps,
    y: (newVel3d.y - vel3d.y)/steps,
    z: (newVel3d.z - vel3d.z)/steps,
  }
  
  randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  newSolidColor.r = randomBetween(shadeColors.min, shadeColors.max);
  newSolidColor.g = randomBetween(shadeColors.min, shadeColors.max);
  newSolidColor.b = randomBetween(shadeColors.min, shadeColors.max);
  
  acelSolidColor.r = (newSolidColor.r - solidColor.r)/steps;
  acelSolidColor.g = (newSolidColor.g - solidColor.g)/steps;
  acelSolidColor.b = (newSolidColor.b - solidColor.b)/steps;
}
