/*
Developed by Eduardo Bulhões
Date: 09/13/2024
edubbulhoes@gmail.com
linkedin: www.linkedin.com/in/ebezerra-it
*/
const canvas2d = { x: 600, y: 600 };
const viewcamera = { x: 0, y: 0, z: -5 };
const maxAxisSpeed = 0.1;

// Movie parameters
let scene = -1; // -1: title; 0: points; 1: lines; 2: No backlines; 3: Substance; 4: Shading; 5: Texture; 6: Ending
let scenePoints = 0;
let sceneEdges = 0;
let flashStatus = 0; // 0: not triggered; 1: triggered; 2: flashing
let tmrMusicVolume;

// Sound parameters
let stormsound;
let stormsoundFilename = "storm2.mp3";
let music;
let musicFilename = "future.mp3";
let fastflip;
let fastflipFilename = "fastflip.mp3";
let laserfit;
let laserfitFilename = "laserfit.mp3";

// Texture parameters
let imgTexture;
//const imageName = "JS_logo1.jpg";
const imageName = "cubetxt3.jpg";
const imageSize = 128;
const txtLinePrecision = 3;
const txtPointPrecision = 3;

// Subtitle parametes
let sceneSubtitle = "";
let subtitleColor = { r: 0, g: 0, b: 0 };
let subtitlePosition = { x: 0, y: 0 };
let font;
const fontFile = 'KyivMachine.ttf';
let subtitleFadeStatus = 0; // 0: not triggered; 1: triggered; 2: fading
let subtitleShowtime = 500; // -1: indefinitely
let subtitleFontSize = 20;
let movietitleFontSize = 40;
let fontSize = subtitleFontSize;
let movietitleTrigger = true;

var points = [];
var faces = [];
var zoomcamera = 70;
var rot3d = {x: 0.0, y: 0.0, z: 0.0};
var newVel3d = {x: 0.0, y: 0.0, z: 0.0};
var vel3d = {x: 0.0, y: 0.0, z: 0.0};
var acel3d = {x: 0.0, y: 0.0, z: 0.0};
var viewType = 0; // 0 - points; 1 - wireframe; 2-solid; 3-solid w/ light & shading; 4-solid w/ texture
var cubeColor = { r: 240, g: 240, b: 240 };
var newCubeColor = { r: 0, g: 0, b: 0 };
var acelCubeColor = { r: 0, g: 0, b: 0 };
var cnv;

p5.disableFriendlyErrors = true; //Improve performance

function preload() {
  imgTexture = loadImage(imageName, ()=>{}, () => { console.log(`!!![ERROR - Can't read image: ${imageName}]!!!`); noLoop(); });
  font = loadFont(fontFile, ()=>{}, () => { console.log(`!!![ERROR - Can't read font: ${fontFile}]!!!`); noLoop(); });
  
  stormsound = loadSound(stormsoundFilename, () => {}, () => { console.log(`!!![ERROR - Can't read sound effect: ${stormsoundFilename}]!!!`); noLoop(); });
  
  fastflip = loadSound(fastflipFilename, () => {}, () => { console.log(`!!![ERROR - Can't read sound effect: ${fastflipFilename}]!!!`); noLoop(); });
  
  laserfit = loadSound(laserfitFilename, () => {}, () => { console.log(`!!![ERROR - Can't read sound effect: ${laserfitFilename}]!!!`); noLoop(); });

  music = createAudio(musicFilename);
}

function createMyCanvas() {
  cnv = createCanvas(canvas2d.x, canvas2d.y, WEBGL);
}

function setup() {
  music.volume(1);
  music.play();
  createMyCanvas();
  colorMode(RGB, 255);
  
  imgTexture.resize(imageSize, imageSize);
  imgTexture.loadPixels();

  points = [
    {x: -1, y: -1, z: -1},
    {x: -1, y: -1, z:  1},
    {x: -1, y:  1, z: -1},
    {x: -1, y:  1, z:  1},
    {x:  1, y: -1, z: -1},
    {x:  1, y: -1, z:  1},
    {x:  1, y:  1, z: -1},
    {x:  1, y:  1, z:  1},
  ];
  edges = [
    [1, 3],
    [3, 7],
    [7, 5],
    [5, 1],
    [0, 4],
    [4, 6],
    [6, 2],
    [2, 0],
    [0, 1],
    [5, 4],
    [6, 7],
    [3, 2],
  ];
  faces = [
    [1, 3, 7, 5],
    [0, 4, 6, 2],
    [5, 7, 6, 4],
    [1, 0, 2, 3],
    [3, 2, 6, 7],
    [1, 5, 4, 0],
  ]; 

  frameRate(30);
  subtitleFadeStatus = 1;
}

async function draw() {
  background(0);
  credits();
  rotateCube();
  
  if (flashStatus === 2) return;
  
  showSubtitle(sceneSubtitle, subtitlePosition, fontSize, 10, subtitleShowtime, 10);
  
  switch (scene) {
    case -1: // movie title
      subtitlePosition = { x: -90, y: 0 };
      sceneSubtitle = "The Cube";
      fontSize = movietitleFontSize;

      if (movietitleTrigger) {
        setTimeout(() => {
          scene = 0;
          subtitleFadeStatus = 1;
          fontSize = subtitleFontSize;
          
          tmrMusicVolume = setInterval(() => {
              let vol = music.volume();
              if (vol <= 0.3) {
                clearInterval(tmrMusicVolume);
                return;
              }
              
              vol -= 0.05;
              music.volume(vol);
            }, 250);
          
        }, 7000);
        
        movietitleTrigger = false;
      }
      break;
      
    case 0: // points
      subtitlePosition = { x: -200, y: 175 };
      sceneSubtitle = "Points define the cube's hidden structure";
      drawPoints();
      break;
      
    case 1: // edges
      subtitlePosition = { x: -175, y: 175 };
      sceneSubtitle = "Connecting points to form the edges";
      if (sceneEdges < edges.length) drawPoints();
      drawEdges();
      break;
      
    case 2: // no backlines
      subtitlePosition = { x: -200, y: 175 };
      sceneSubtitle = "Unveiling essentials by hiding the back!";
      viewType = 2;
      drawCube();
      if (flashStatus === 1) {
        setTimeout(() => {
          stormsound.play();
          flashStatus = 2;
          subtitleFadeStatus = 1;
          flashEffect(() => {
            scene = 3;
            changeRotation();
            flashStatus = 1;
          }, 15, 20);
        }, 3000);
        flashStatus = 0;
      }
      break;
      
    case 3: // solid w/ color
      subtitlePosition = { x: -150, y: 175 };
      sceneSubtitle = "The cube comes alive in color";
      viewType = 2;
      cubeColor = { r: 4, g: 170, b: 109 };
      drawCube();
      
      if (flashStatus === 1) {
        setTimeout(() => {
          stormsound.play();
          subtitleFadeStatus = 1;
          flashStatus = 2;
          flashEffect(() => {
            scene = 4;
            flashStatus = 1;
          }, 15, 20);
        }, 10000);
        flashStatus = 0;
      }
      break;
    case 4: // solid w/ light & shading
      subtitlePosition = { x: -165, y: 175 };
      sceneSubtitle = "Light and shadow shape the cube";
      viewType = 3;
      drawCube();
      
      if (flashStatus === 1) {
        setTimeout(() => {
          stormsound.play();
          subtitleFadeStatus = 1;
          flashStatus = 2;
          flashEffect(() => {
            scene = 5;
            flashStatus = 1;
            createMyCanvas();
          }, 30, 20);
        }, 15000);
        flashStatus = 0;
      }

      break;

    case 5: // texture
      let tmrTransition;
      
      // avoid very poor fr experience
      if (frameRate() < 5) {
        clearTimeout(tmrTransition);
        subtitleShowtime = -1;
        subtitleFadeStatus = 1;
        subtitleShowtime = 53000;
        scene = 6;
        return;
      }
      
      subtitlePosition = { x: -195, y: 175 };
      sceneSubtitle = "Metallic texture adds sleek refinement"
      viewType = 4;
      drawCube();
      
      if (flashStatus === 1) {
        tmrTransition = setTimeout(() => {
          stormsound.play();
          subtitleShowtime = 38000;
          subtitleFadeStatus = 1;
          flashStatus = 2;
          flashEffect(() => {
            scene = 6;
            flashStatus = 1;
            createMyCanvas();
            
            tmrMusicVolume = setInterval(() => {
              let vol = music.volume();
              if (vol === 1) {
                clearInterval(tmrMusicVolume);
                return;
              }
              
              vol += 0.05;
              music.volume(vol);
            }, 500);
            //music.volume(1);
          }, 15, 20);
        }, 15000);
        flashStatus = 0;
      }
      break;
    case 6: // ending
      subtitlePosition = { x: -130, y: 0 };
      sceneSubtitle = "Thank you for watching...";
      break;
  }
}

function credits() {
  textFont(font);
  textSize(12);
  fill('white');
  text('Develped by Eduardo Bulhoes - https://www.linkedin.com/in/ebezerra-it', -canvas2d.x/2+4, -canvas2d.y/2 + 14);
}

function showSubtitle(textSubtitle, position, size, fadeSteps, showTime, fadeOutSteps) {
  textFont(font);
  textSize(size);
  fill(color(subtitleColor.r, subtitleColor.g, subtitleColor.b));
  text(textSubtitle, position.x, position.y);

  let colorStep = 256 / fadeSteps;
  
  if (subtitleFadeStatus == 1) {
    setTimeout(() => {
      //Fade In
      let tmrFade = setInterval(() => {
        subtitleFadeStatus = 2;

        subtitleColor.r += colorStep;
        subtitleColor.g += colorStep;
        subtitleColor.b += colorStep;
        
        if (subtitleColor.r > 255) {
          clearInterval(tmrFade);
          subtitleColor.r = 255;
          subtitleColor.g = 255;
          subtitleColor.b = 255;
          
          if(showTime === -1) {
            subtitleFadeStatus = 0;
            return;
          }
          
          setTimeout(() => {
            tmrFade = setInterval(() => {
              //Fade Out
              subtitleColor.r -= colorStep;
              subtitleColor.g -= colorStep;
              subtitleColor.b -= colorStep;
              
              if (subtitleColor.r < 0) {
                clearInterval(tmrFade);
                subtitleColor.r = 0;
                subtitleColor.g = 0;
                subtitleColor.b = 0;
                
                subtitleFadeStatus = 0;
              }
            }, 200);
          }, showTime);
        }
      }, 200);
    }, 0); //time to begin
    
    subtitleFadeStatus = 0;
  }
}



function flashEffect(endFlashEffect, steps, duration) {
  clear();
  background(steps % 2 === 0 ? "white": "black");
  
  if (steps <= 0 || isNaN(steps)) {
    endFlashEffect();
    return;
  }
  setTimeout(()=>{ flashEffect(endFlashEffect, steps - 1, duration) }, duration);
}

function rotateCube() {
  rot3d.x += vel3d.x;
  rot3d.y += vel3d.y;
  rot3d.z += vel3d.z;
  
  for (var i = 0; i<points.length; i++) {
    points[i] = rotate3d(points[i], vel3d);
  }
  
  vel3d.x += acel3d.x;
  vel3d.y += acel3d.y;
  vel3d.z += acel3d.z;
  
  cubeColor.r = cubeColor.r + acelCubeColor.r;
  cubeColor.g = cubeColor.g + acelCubeColor.g;
  cubeColor.b = cubeColor.b + acelCubeColor.b;
  
  if (scene < 3) return;
  
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
    x: Math.round(p3d.x*(viewcamera.z + p3d.z) / viewcamera.z * zoomcamera), // + canvas2d.x/2),
    y: Math.round(p3d.y*(viewcamera.z + p3d.z) / viewcamera.z * zoomcamera), // + canvas2d.y/2),
  }
}

function drawCube() {
  for(var i = 0;i<faces.length;i++) {
    drawFace(faces[i]);
  }
}

function drawPoints() {
  
  if (scenePoints === 0) {
    scenePoints = 1;
    let ptsInterval = setInterval(() => {
      scenePoints++;
      if (scenePoints >= 8) {
        clearInterval(ptsInterval);
        vel3d = {x: 0.0, y: 0.05, z: 0.0};
        setTimeout(() => {
          scene = 1;
          subtitleFadeStatus = 1;
        }, 3000);
        return;
      }
    }, 1000 * scenePoints);
  }
  stroke("white");
  for (var i = 0; i < points.length; i++) {
    var p2d = point3dTo2d(points[i]);
    var pointSize = -points[i].z + 5;
    strokeWeight(pointSize);
    if (i + 1 <= scenePoints) point(p2d.x, p2d.y);
  }
}

function drawEdges() {
  if (sceneEdges === 0) {
    sceneEdges = 1;
    let edgInterval = setInterval(() => {
      laserfit.play();
      sceneEdges++;

      if (sceneEdges > edges.length) {
        clearInterval(edgInterval);
        
        setTimeout(() => { acel3d = {x: 0.0, y: 0.05, z: 0.0}; }, 3000);
        let acelInterval = setInterval(() => {
          if (acel3d.y > 0 && vel3d.y > 1.0) {
            fastflip.play();
            cubeColor = { r: 0, g: 0, b: 0 };
            scene = 2; //
            subtitleFadeStatus = 1;
            acel3d = {x: 0.0, y: -0.01, z: 0.0};
            return;
          }
          
          if (acel3d.y < 0 && vel3d.y <= 0.05) {
            acel3d = {x: 0.0, y: 0.0, z: 0.0};
            vel3d.y = 0.05;
            flashStatus = 1;
            clearInterval(acelInterval);
          }
        }, 10);
        return;
      }
    }, 100 * sceneEdges);
  }
  
  stroke("white");
  strokeWeight(1);
  
  for(var i = 0;i<edges.length;i++) {
    var p2d1 = point3dTo2d(points[edges[i][0]]);
    var p2d2 = point3dTo2d(points[edges[i][1]]);
    
    if (i + 1 <= sceneEdges) {
      line(p2d1.x, p2d1.y, p2d2.x, p2d2.y);
    }
  }
}

function drawFace(face) {
  var p2d1 = point3dTo2d(points[face[0]]);
  var p2d2 = point3dTo2d(points[face[1]]);
  var p2d3 = point3dTo2d(points[face[2]]);
  var p2d4 = point3dTo2d(points[face[3]]);

  var faceNormal = faceVecNormal(face);
  costheta = cosVec1Vec2(faceNormal, viewcamera);

  if (costheta > 0.18) {
    var c;
    if (viewType === 2) {
      c = color(cubeColor.r, cubeColor.g, cubeColor.b);
      noStroke();
      fill(c);
      
      quad(p2d2.x, p2d2.y, p2d1.x, p2d1.y, p2d4.x, p2d4.y, p2d3.x, p2d3.y);
      
      stroke("white");
      strokeWeight(1);
      
      line(p2d1.x, p2d1.y, p2d2.x, p2d2.y);
      line(p2d2.x, p2d2.y, p2d3.x, p2d3.y);
      line(p2d3.x, p2d3.y, p2d4.x, p2d4.y);
      line(p2d4.x, p2d4.y, p2d1.x, p2d1.y);
    } else if(viewType === 3) {
      c = color(cubeColor.r*costheta, cubeColor.g*costheta, cubeColor.b*costheta);
      noStroke();
      fill(c);

      quad(p2d2.x, p2d2.y, p2d1.x, p2d1.y, p2d4.x, p2d4.y, p2d3.x, p2d3.y);
    } else {
      noStroke();
      noFill();
      strokeWeight(1);

      fillQuadTexture(p2d1, p2d2, p2d4, p2d3, costheta)
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

function changeRotation() {
  const axisSpeed = {
    min: -maxAxisSpeed,
    max: maxAxisSpeed,
  };
  const shadeColors = {
    min: 80,
    max: 250,
  };
  const steps = 100; // 500; // interpolation steps
  
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
  newCubeColor.r = randomBetween(shadeColors.min, shadeColors.max);
  newCubeColor.g = randomBetween(shadeColors.min, shadeColors.max);
  newCubeColor.b = randomBetween(shadeColors.min, shadeColors.max);
  
  acelCubeColor.r = (newCubeColor.r - cubeColor.r)/steps;
  acelCubeColor.g = (newCubeColor.g - cubeColor.g)/steps;
  acelCubeColor.b = (newCubeColor.b - cubeColor.b)/steps;
}

//Texture funcions
//Bresenham's line algorithm
function getLine(p0, p1) {
  let x0 = p0.x;
  let y0 = p0.y;
  const x1 = p1.x;
  const y1 = p1.y;
  
  const dx = abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  let e2;

  let i = 0;
  const arrayLine = [];
  
  while (true) {
    arrayLine.push({x: x0, y: y0});
    
    if (x0 == x1 && y0 == y1) break;
    e2 = 2 * error;
    if (e2 >= dy) {
        if (x0 == x1) break;
        error = error + dy;
        x0 = x0 + sx;
    }
    if (e2 <= dx) {
        if (y0 == y1) break;
        error = error + dx;
        y0 = y0 + sy;
    }
  }
  return arrayLine;
}

function fillQuadTexture(p0, p1, p2, p3, costehta) {
  fillTriangleTexture(p0, p1, p2, { x: 0, y: 0 }, {x: imgTexture.width - 1, y: 0 }, { x: 0, y: imgTexture.height - 1 }, costheta);
  fillTriangleTexture(p3, p2, p1, { x: imgTexture.width - 1, y: imgTexture.height - 1 }, { x: 0, y: imgTexture.height - 1 }, {x: imgTexture.width - 1, y: 0 }, costheta);
}

function fillTriangleTexture(p0, p1, p2, ptxt0, ptxt1, ptxt2, costheta) {
  var line1 = getLine(p0, p2);
  var line2 = getLine(p0, p1);
  
  const d2 = line2.length / line1.length;

  var lineTxt1 = getLine(ptxt0, ptxt2);
  var lineTxt2 = getLine(ptxt0, ptxt1);

  const dwhtext = lineTxt1.length / lineTxt2.length;
  const dline1 = lineTxt1.length / line1.length;
  const dline2 = lineTxt2.length / line2.length;

  const txtWTimes4 = imgTexture.width * 4;
  
  strokeWeight(1);
  for (let i=0; i<line1.length; i+=txtLinePrecision) {
    const pp0 = line1[Math.floor(i)];
    const pp1 = line2[Math.floor(i * d2)];

    const pp0tx = lineTxt1[Math.floor(i * dline1)];
    const pp1tx = lineTxt2[Math.floor(i * d2 * dwhtext * dline2)]
    

    const lineDraw = getLine(pp0, pp1);
    const lineTx = getLine(pp0tx, pp1tx);
    const ddrawtx = lineTx.length / lineDraw.length;
        
    for (let j=0;j<lineDraw.length;j+=txtPointPrecision) {
      const offset = lineTx[Math.floor(j*ddrawtx)].y * txtWTimes4 + lineTx[Math.floor(j*ddrawtx)].x * 4;
      
      const r = imgTexture.pixels[offset];
      const g = imgTexture.pixels[offset + 1];
      const b = imgTexture.pixels[offset + 2];
      const a = imgTexture.pixels[offset + 3];

      const c = color(r * costheta, g * costheta, b * costheta);
      stroke(c);
      c.setAlpha(a);

      point(lineDraw[j].x, lineDraw[j].y)
    }
  }
}
