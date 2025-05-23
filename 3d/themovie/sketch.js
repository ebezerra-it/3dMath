/*
Developed by Eduardo Bezerra
Date: 09/13/2024
edubbulhoes@gmail.com
linkedin: www.linkedin.com/in/ebezerra-it
*/
const canvas2d = { x: 600, y: 600 };
const viewcamera = { x: 0, y: 0, z: -5 };
const maxAxisSpeed = 0.1; 

// Movie parameters
let startMovie = false;
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
const imageName = "cubetxt3.jpg";
const imageSize = 128;
const txtLinePrecision = 2;
const txtPointPrecision = 2;
const txtPointSize = 6.0; 

// Subtitle parametes
let sceneSubtitle = "";
let subtitleColor = { r: 0, g: 0, b: 0 };
let subtitlePosition = { x: 0, y: 0 };
let font;

const fontFile = 'PixelifySans-VariableFont_wght.ttf';

let subtitleFadeStatus = 0; // 0: not triggered; 1: triggered; 2: fading
let subtitleShowtime = 1000; // -1: indefinitely
let subtitleFontSize = 30;
let movietitleFontSize = 40;
let fontSize = subtitleFontSize;
let movietitleTrigger = true; 

// Localization parameters
const defaultLanguage = 'EN-US';
var language;

const acceptedParamsLanguages = [
  {language: 'EN-US', alias: ['EN-US', 'EN', 'US', 'INGLÊS', 'INGLES', 'ENGLISH']}, 
  {language: 'PT-BR', alias: ['PT-BR', 'PT', 'BR', 'PORTUGUÊS', 'PORTUGUES', 'PORTUGUESE']}]

const localizated_messages = [
  {
    code: 'BACK_BTN',
    localizations: [
      { language: 'EN-US', message: '&#10094; Back', screen_offset: undefined},
      { language: 'PT-BR', message: '&#10094; Voltar', screen_offset: undefined},
    ]
  },
  {
    code: 'DEV',
    localizations: [
      { language: 'EN-US', message: 'Developed by', screen_offset: {x: 10, y: 10}},
      { language: 'PT-BR', message: 'Desenvolvido por', screen_offset: {x: 10, y: 10}},
    ]
  },
  {
    code: 'CLICK_START',
    localizations: [
      { language: 'EN-US', message: 'Click to start', screen_offset: {x: canvas2d.x/2-150, y: canvas2d.y/2}},
      { language: 'PT-BR', message: 'Clique para iniciar', screen_offset: {x: canvas2d.x/2-200, y: canvas2d.y/2}},
    ]
  },
  {
    code: 'MOVIE_TITLE',
    localizations: [
      { language: 'EN-US', message: 'The Cube', screen_offset: { x: canvas2d.x/2 - 100, y: canvas2d.y/2 }},
      { language: 'PT-BR', message: 'O Cubo', screen_offset: { x: canvas2d.x/2 - 80, y: canvas2d.y/2 }},
    ]
  },
  {
    code: 'SCENE_POINTS',
    localizations: [
      { language: 'EN-US', message: "Points define the cube's\nhidden structure", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
      { language: 'PT-BR', message: 'Pontos revelam a estrutura\noculta do cubo', screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
    ]
  },
  {
    code: 'SCENE_EDGES',
    localizations: [
      { language: 'EN-US', message: "Connecting points to form\nthe edges", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
      { language: 'PT-BR', message: "Conectando os pontos para\nformar as arestas", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
    ]
  },
  {
    code: 'SCENE_NO_BACKLINES',
    localizations: [
      { language: 'EN-US', message: "Unveiling essentials by hiding\nthe back", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
      { language: 'PT-BR', message: "Desvendando o essencial ao ocultar\na parte de trás.", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
    ]
  },
  {
    code: 'SCENE_SOLID',
    localizations: [
      { language: 'EN-US', message: "The cube comes alive in color", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
      { language: 'PT-BR', message: "O cubo ganha vida em cores", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
    ]
  },
  {
    code: 'SCENE_SHADE',
    localizations: [
      { language: 'EN-US', message: "Light and shadow shape the cube", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
      { language: 'PT-BR', message: "Luz e sombra moldam a forma do cubo", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
    ]
  },
  {
    code: 'SCENE_TEXTURE',
    localizations: [
      { language: 'EN-US', message: "Metallic texture adds sleek\nrefinement", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
      { language: 'PT-BR', message: "A textura metálica adiciona um\ntoque de sofisticação", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 + 170 }},
    ]
  },
  {
    code: 'ENDING',
    localizations: [
      { language: 'EN-US', message: "Thank you for watching...", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 }},
      { language: 'PT-BR', message: "Obrigado por assistir...", screen_offset: { x: canvas2d.x/2, y: canvas2d.y/2 }},
    ]
  },
]

var DEVBY, CLICK_START, MOVIE_TITLE, SCENE_POINTS, SCENE_EDGES, SCENE_NO_BACKLINES, SCENE_SOLID, SCENE_SHADE, SCENE_TEXTURE, ENDING;

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
var gl;
var txt;


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
  const glcanvas = document.getElementById('glcanvas');
  cnv = createCanvas(canvas2d.x, canvas2d.y, WEBGL, glcanvas);
}

function setup() {
  const userLanguage = String(new URLSearchParams(window.location.search).get('language')).toUpperCase().trim();
  language = defaultLanguage;
  acceptedParamsLanguages.every(paramLanguage => {
    if (paramLanguage.alias.find(alias => alias == userLanguage)) {
      language = paramLanguage.language;
      return false;
    }
    return true;
  });

  const btnBack = document.getElementById("back");
  btnBack.innerHTML = getLocalizatedMessage('BACK_BTN', '&#10094; Back', undefined).message;

  DEVBY = getLocalizatedMessage('DEV', 'Developed by', {x: 10, y: 10});
  CLICK_START = getLocalizatedMessage('CLICK_START', 'Click to start', {x: canvas2d.x/2-150, y: canvas2d.y/2});
  MOVIE_TITLE = getLocalizatedMessage('MOVIE_TITLE', 'The Cube', { x: canvas2d.x/2 - 100, y: canvas2d.y/2 });
  SCENE_POINTS = getLocalizatedMessage('SCENE_POINTS', "Points define the cube's hidden structure", { x: canvas2d.x/2 - 200, y: canvas2d.y/2 + 170 });
  SCENE_EDGES = getLocalizatedMessage('SCENE_EDGES', "Connecting points to form the edges", { x: canvas2d.x/2 - 170, y: canvas2d.y/2 + 170 });
  SCENE_NO_BACKLINES = getLocalizatedMessage('SCENE_NO_BACKLINES', "Unveiling essentials by hiding the back", { x: canvas2d.x/2 - 200, y: canvas2d.y/2 + 170 });
  SCENE_SOLID = getLocalizatedMessage('SCENE_SOLID', "The cube comes alive in color", { x: canvas2d.x/2 - 150, y: canvas2d.y/2 + 170 });
  SCENE_SHADE = getLocalizatedMessage('SCENE_SHADE', "Light and shadow shape the cube", { x: canvas2d.x/2 - 150, y: canvas2d.y/2 + 170 });
  SCENE_TEXTURE = getLocalizatedMessage('SCENE_TEXTURE', "Metallic texture adds sleek refinement", { x: canvas2d.x/2 - 200, y: canvas2d.y/2 + 170 });
  ENDING = getLocalizatedMessage('ENDING', "Thank you for watching...", { x: canvas2d.x/2 - 150, y: canvas2d.y/2 });

  var a = createA('https://www.linkedin.com/in/ebezerra-it', DEVBY.message + ' Eduardo Bezerra', '_blank');
  a.position(DEVBY.screen_offset.x, DEVBY.screen_offset.y);
  a.style('font-size', '12px');
  a.style('font-family', 'arial');
  a.style('text-decoration', 'none');
  a.style('font-weight', 'normal');
  a.style('color', '#ffffff'); 

  createMyCanvas();
  createSubtitleCanvas();

  txt.mouseClicked(() => {
    if (!startMovie) {
      startMovie = true;
      createSubtitleCanvas();
      music.volume(1);
      music.play();

      txt.mouseClicked(() => {});
    }
  });
  
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

  frameRate(30); //needed for flash effect
  subtitleFadeStatus = 1;
}

function createSubtitleCanvas() {
  if (txt) txt.remove();

  txt = createGraphics(canvas2d.x, canvas2d.y);
  txt.elt.style.display = "block";
  txt.elt.style.position = "absolute";  
  txt.elt.style.top = "100px";
  txt.elt.style.left = 0;
  txt.elt.style.zIndex = 10;
  txt.background(color(255,255,255,0));
}


async function draw() {
  background(0);

  if (!startMovie) {
    txt.textFont(font);
    txt.textSize(40);
    txt.fill('gray');
    txt.text(CLICK_START.message, CLICK_START.screen_offset.x, CLICK_START.screen_offset.y);

    return;
  }
  
  rotateCube();
  
  if (flashStatus === 2) return;
  
  showSubtitle(sceneSubtitle, subtitlePosition, fontSize, 10, subtitleShowtime, 10);
  
  switch (scene) {
    case -1: // movie title
      subtitlePosition = { x: MOVIE_TITLE.screen_offset.x, y: MOVIE_TITLE.screen_offset.y };;
      sceneSubtitle = MOVIE_TITLE.message;
      fontSize = movietitleFontSize;

      if (movietitleTrigger) {
        setTimeout(() => {
          createSubtitleCanvas();
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
      subtitlePosition = { x: SCENE_POINTS.screen_offset.x, y: SCENE_POINTS.screen_offset.y };
      sceneSubtitle = SCENE_POINTS.message;
      drawPoints();
      break;
      
    case 1: // edges
      subtitlePosition = { x: SCENE_EDGES.screen_offset.x, y: SCENE_EDGES.screen_offset.y };
      sceneSubtitle = SCENE_EDGES.message;
      if (sceneEdges < edges.length) drawPoints();
      drawEdges();
      break;
      
    case 2: // no backlines
      subtitlePosition = { x: SCENE_NO_BACKLINES.screen_offset.x, y: SCENE_NO_BACKLINES.screen_offset.y };
      sceneSubtitle = SCENE_NO_BACKLINES.message;
      viewType = 2;
      drawCube();
      if (flashStatus === 1) {
        setTimeout(() => {
          createSubtitleCanvas();
          txt.elt.style.visibility = 'hidden';
          stormsound.play();
          flashStatus = 2;
          subtitleFadeStatus = 1;
          flashEffect(() => {
            scene = 3;
            txt.elt.style.visibility = 'visible';
            changeRotation();
            flashStatus = 1;
          }, 15, 20);
        }, 3000);
        flashStatus = 0;
      }
      break;
      
    case 3: // solid w/ color
      subtitlePosition = { x: SCENE_SOLID.screen_offset.x, y: SCENE_SOLID.screen_offset.y };
      sceneSubtitle = SCENE_SOLID.message;
      viewType = 2;
      cubeColor = { r: 4, g: 170, b: 109 };
      drawCube();
      
      if (flashStatus === 1) {
        setTimeout(() => {
          createSubtitleCanvas();
          txt.elt.style.visibility = 'hidden';
          stormsound.play();
          subtitleFadeStatus = 1;
          flashStatus = 2;
          flashEffect(() => {
            scene = 4;
            flashStatus = 1;
            txt.elt.style.visibility = 'visible';
          }, 15, 20);
        }, 10000);
        flashStatus = 0;
      }
      break;

    case 4: // solid w/ light & shading
      subtitlePosition = { x: SCENE_SHADE.screen_offset.x, y: SCENE_SHADE.screen_offset.y };
      sceneSubtitle = SCENE_SHADE.message;
      viewType = 3;
      drawCube();
      
      if (flashStatus === 1) {
        setTimeout(() => {
          createSubtitleCanvas();
          txt.elt.style.visibility = 'hidden';
          stormsound.play();
          subtitleFadeStatus = 1;
          flashStatus = 2;
          
          flashEffect(() => {
            scene = 5;
            flashStatus = 1;
            createMyCanvas();
            gl = cnv.GL;
            txt.elt.style.visibility = 'visible';
          }, 30, 20);
        }, 15000);
        flashStatus = 0;
      }
      break;

    case 5: // texture
      subtitlePosition = { x: SCENE_TEXTURE.screen_offset.x, y: SCENE_TEXTURE.screen_offset.y };
      sceneSubtitle = SCENE_TEXTURE.message
      viewType = 4;
      drawCube();
      
      if (flashStatus === 1) {
        setTimeout(() => {
          createSubtitleCanvas();
          txt.elt.style.visibility = 'hidden';
          stormsound.play();
          subtitleShowtime = 38000;
          subtitleFadeStatus = 1;
          flashStatus = 2;
          flashEffect(() => {
            scene = 6;
            flashStatus = 1;
            createMyCanvas();
            createSubtitleCanvas();
            txt.elt.style.visibility = 'visible';
            
            tmrMusicVolume = setInterval(() => {
              let vol = music.volume();
              if (vol === 1) {
                clearInterval(tmrMusicVolume);
                return;
              }
              
              vol += 0.05;
              music.volume(vol);
            }, 500);
          }, 15, 20);
        }, 15000);
        flashStatus = 0;
      }
      break;

    case 6: // ending
      subtitlePosition = { x: ENDING.screen_offset.x, y: ENDING.screen_offset.y };
      sceneSubtitle = ENDING.message;
      break;
  }
}

function showSubtitle(textSubtitle, position, size, fadeSteps, showTime, fadeOutSteps) {
  txt.textStyle(NORMAL);
  txt.textFont(font);
  txt.textSize(size);
  txt.textAlign(CENTER);
  txt.fill(color(subtitleColor.r, subtitleColor.g, subtitleColor.b));
  txt.text(textSubtitle, position.x, position.y);

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
                createSubtitleCanvas();
              }
            }, 100);
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
    x: Math.round(p3d.x*(viewcamera.z + p3d.z) / viewcamera.z * zoomcamera),
    y: Math.round(p3d.y*(viewcamera.z + p3d.z) / viewcamera.z * zoomcamera),
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
      strokeWeight(txtPointSize);

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



function fillQuadTexture(p0, p1, p2, p3, costheta) {
  const pointsArray = [
    ...fillTriangleTexture(p0, p1, p2, imgTexture.pixels, imgTexture.width, { x: 0, y: 0 }, {x: imgTexture.width - 1, y: 0 }, { x: 0, y: imgTexture.height - 1 }, costheta),
    ...fillTriangleTexture(p3, p2, p1, imgTexture.pixels, imgTexture.width, { x: imgTexture.width - 1, y: imgTexture.height - 1 }, { x: 0, y: imgTexture.height - 1 }, {x: imgTexture.width - 1, y: 0 }, costheta),
  ]; 
  
  webglDrawPointsArray(pointsArray);
}

function fillTriangleTexture(p0, p1, p2, myTexture, myTextureWidth, ptxt0, ptxt1, ptxt2, costheta) {
  
  const getLine = (p0, p1) => {
    let x0 = p0.x;
    let y0 = p0.y;
    const x1 = p1.x;
    const y1 = p1.y;

    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;
    let e2;

    let i = 0;
    let endLine = false;
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
    
  const line1 = getLine(p0, p2);
  const line2 = getLine(p0, p1);

  const d2 = line2.length / line1.length;

  const lineTxt1 = getLine(ptxt0, ptxt2);
  const lineTxt2 = getLine(ptxt0, ptxt1);

  const dwhtext = lineTxt1.length / lineTxt2.length;
  const dline1 = lineTxt1.length / line1.length;
  const dline2 = lineTxt2.length / line2.length;

  const txtWTimes4 = myTextureWidth * 4;
  
  let ii = 0, jj = 0;
  const myTriangle = [];
  
  for (let i=0; i<line1.length; i+=txtLinePrecision) {
    ii++;
    const pp0 = line1[Math.floor(i)];
    const pp1 = line2[Math.floor(i * d2)];

    const pp0tx = lineTxt1[Math.floor(i * dline1)];
    const pp1tx = lineTxt2[Math.floor(i * d2 * dwhtext * dline2)]
    

    const lineDraw = getLine(pp0, pp1);
    const lineTx = getLine(pp0tx, pp1tx);
    const ddrawtx = lineTx.length / lineDraw.length;
        
    for (let j=0;j<lineDraw.length;j+=txtPointPrecision) {
      jj++;
      const ddrawtxTimesJ = Math.floor(j*ddrawtx);
      const offset = lineTx[ddrawtxTimesJ].y * txtWTimes4 + lineTx[ddrawtxTimesJ].x * 4;
      
      const r = myTexture[offset] * costheta;
      const g = myTexture[offset + 1] * costheta;
      const b = myTexture[offset + 2] * costheta;
      const a = myTexture[offset + 3];

      myTriangle.push({
        x: lineDraw[j].x, 
        y: lineDraw[j].y,
        r,
        g,
        b,
        a
      });
    }
  }

  return myTriangle;
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
      normalize(pointsData[i].x, 0, canvas2d.x/2), 
      normalize(pointsData[i].y, 0, canvas2d.y/2),  
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
      'gl_PointSize = ' + txtPointSize.toFixed(1) + ';' +
    '}';

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
  gl.drawArrays(gl.POINTS, 0, points.length/3); 
}

function getLocalizatedMessage(messageCode, defaultMessage, defaultScreenOffset) {
  var messages = localizated_messages.find(loc_message => loc_message.code === messageCode)
  if (messages) {
    var localizated_message = messages.localizations.find(msg => msg.language === language);

    if (localizated_message)
      return localizated_message;
  } 
  
  return {
    message: defaultMessage, 
    screen_offset: defaultScreenOffset
  }
}