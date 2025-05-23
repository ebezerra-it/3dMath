/*
Developed by Eduardo Bulhões
Date: 26/10/2023
edubbulhoes@gmail.com
linkedin: www.linkedin.com/in/ebezerra-it
*/
const canvas2d = { x: 800, y: 600 };
const gridSize = { x: 20, y: 20 };
const gridStep = Math.PI/8;
const wireframe = true;
const quadFace = true;
const zobs = -50;
const zoom = 15;
const rotVel = { x: 0.01, y: 0.01, z: 0 };
const radius = 10;
const viewTypeTimer = 10000;

var start = true;
var rotAngle = { x: 0, y: 0, z: 0 };
var viewType = 0;

function setup() {
  createCanvas(canvas2d.x, canvas2d.y);
  credits()
  
  setInterval(() => {
    if (start) {
      viewType = viewType === 3 ? 0 : viewType + 1;
    }
  }, viewTypeTimer);
}

function draw() {
  background(0); 
  drawGrid();
}

function credits() {
  var a = createA('https://www.linkedin.com/in/ebezerra-it', 'Develped by Eduardo Bezerra', '_blank');
  a.position(10, 10);
  a.style('font-size', '12px');
  a.style('font-family', 'arial');
  a.style('text-decoration', 'none');
  a.style('font-weight', 'normal');
  a.style('color', '#ffffff');  
}

function drawGrid() {
  var p2dPrev;
  rotAngle.x += rotVel.x;
  rotAngle.y += rotVel.y;
  rotAngle.z += rotVel.z;

  var gridline = [];
  var step = 0.1;
  var gridlinePrev;
  for (var phi = 0; phi<Math.PI+step; phi+=step) {
    gridline = [];

    for (var rho = 0; rho<2*Math.PI+step; rho+=step) {
    
      const x = radius * Math.cos(rho)*Math.sin(phi);
      const y = radius * Math.sin(rho)*Math.sin(phi);
      const z = radius * Math.cos(phi);
      const p3d = rotate3d({x, y, z}, rotAngle);

      gridline.push(p3d);
    }
    
    if (gridlinePrev) {
      for (var i=0; i<gridline.length-1; i+=1) {
        drawFace(gridline[i], gridlinePrev[i], gridlinePrev[i+1], gridline[i+1]);
        /*if (wireframe) {
          drawWireFace(gridline[i], gridlinePrev[i], gridlinePrev[i+1], gridline[i+1]);
        } else if (quadFace)
          drawGridQuadFace(gridline[i], gridlinePrev[i], gridlinePrev[i+1], gridline[i+1]);
        else {
          drawGridTriangleFace(gridline[i], gridlinePrev[i], gridlinePrev[i+1]);
          drawGridTriangleFace(gridline[i], gridlinePrev[i+1], gridline[i+1]);
        }*/
      }
    }
    gridlinePrev = [...gridline];
  }
}

function drawFace(p3d1, p3d2, p3d3, p3d4) {
  
  if (viewType === 0) {
    drawPoints(p3d1, p3d2, p3d3, p3d4);
  } else if (viewType === 1) {
    drawWireFace(p3d1, p3d2, p3d3, p3d4);
  } else if (quadFace) {
    drawGridQuadFace(p3d1, p3d2, p3d3, p3d4)
  } else {
    drawGridTriangleFace(p3d1, p3d2, p3d3);
    drawGridTriangleFace(p3d1, p3d3, p3d4);
  }
}

function drawPoints(p3d1, p3d2, p3d3, p3d4) {
  stroke("white");
  const p2d1 = point3dTo2d(p3d1);
  const p2d2 = point3dTo2d(p3d2);
  const p2d3 = point3dTo2d(p3d3);
  const p2d4 = point3dTo2d(p3d4);

  p2d1.size = (-p3d1.z + radius)/10; if (p2d1.size <=0) p2d1.size = 1;
  strokeWeight(p2d1.size);
  point(p2d1.x, p2d1.y);
  
  p2d2.size = (-p3d2.z + radius)/10; if (p2d2.size <=0) p2d2.size = 1;
  strokeWeight(p2d2.size);
  point(p2d2.x, p2d2.y);
  
  p2d3.size = (-p3d3.z + radius)/10; if (p2d3.size <=0) p2d3.size = 1;
  strokeWeight(p2d3.size);
  point(p2d3.x, p2d3.y);
  
  p2d4.size = (-p3d4.z + radius)/10; if (p2d4.size <=0) p2d4.size = 1;
  strokeWeight(p2d4.size);
  point(p2d4.x, p2d4.y);
  
  //console.log(p2d1.size, p2d2.size, p2d3.size, p2d4.size)
}

function drawWireFace(p3d1, p3d2, p3d3, p3d4) {
  const p2d1 = point3dTo2d(p3d1);
  const p2d2 = point3dTo2d(p3d2);
  const p2d3 = point3dTo2d(p3d3);
  const p2d4 = point3dTo2d(p3d4);

  stroke("white");
  strokeWeight(1);
  line(p2d1.x, p2d1.y, p2d2.x, p2d2.y);
  line(p2d2.x, p2d2.y, p2d3.x, p2d3.y);
  line(p2d3.x, p2d3.y, p2d4.x, p2d4.y);
  line(p2d4.x, p2d4.y, p2d1.x, p2d1.y);
}

function drawGridQuadFace(p3d1, p3d2, p3d3, p3d4) {
  const p2d1 = point3dTo2d(p3d1);
  const p2d2 = point3dTo2d(p3d2);
  const p2d3 = point3dTo2d(p3d3);
  const p2d4 = point3dTo2d(p3d4);
  
  var fp3d1 = vectorDiff(p3d3, p3d1);
  var fp3d2 = vectorDiff(p3d2, p3d1);
  var faceNormal = vectorProduct(fp3d1, fp3d2);
  var costheta = cosVec1Vec2(faceNormal, { x: 0, y: 0, z: zobs})
  
  if (costheta > 0.18) {
    if (viewType === 2)
      c = color(240, 240, 240);
    else 
      c = color(250*costheta, 250*costheta, 250*costheta);
    
    noStroke();
    fill(c);
    quad(p2d1.x, p2d1.y, p2d2.x, p2d2.y, p2d3.x, p2d3.y, p2d4.x, p2d4.y);
  }
}

function drawGridTriangleFace(p3d1, p3d2, p3d3) {
  const p2d1 = point3dTo2d(p3d1);
  const p2d2 = point3dTo2d(p3d2);
  const p2d3 = point3dTo2d(p3d3);
  
  var fp3d1 = vectorDiff(p3d3, p3d1);
  var fp3d2 = vectorDiff(p3d2, p3d1);
  var faceNormal = vectorProduct(fp3d1, fp3d2);
  var costheta = cosVec1Vec2(faceNormal, { x: 0, y: 0, z: zobs})
  
  if (costheta > 0.18) {
    if (viewType === 2)
      c = color(240, 240, 240);
    else 
      c = color(250*costheta, 250*costheta, 250*costheta);
    
    noStroke();
    fill(c);
    quad(p2d1.x, p2d1.y, p2d2.x, p2d2.y, p2d3.x, p2d3.y, p2d3.x, p2d3.y);
  }
}

function point3dTo2d(p3d) {
  return { 
    x: Math.round(p3d.x*(zobs + p3d.z) / zobs * zoom + canvas2d.x/2),
    y: Math.round(p3d.y*(zobs + p3d.z) / zobs * zoom + canvas2d.y/2),
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
  var p3d1 = vectorDiff(points[face[3]], points[face[0]]);
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