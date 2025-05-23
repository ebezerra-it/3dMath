/*
Developed by Eduardo Bulhões
Date: 26/10/2023
edubbulhoes@gmail.com
linkedin: www.linkedin.com/in/ebezerra-it
*/
const canvas2d = { x: 800, y: 600 };
const viewcamera = { x: 0, y: 0, z: -100 };
const explodeTimer = 10000; // milliseconds
const maxAxisSpeed = 0.05;
const explodingSteps = 20;
const explodingRadius = 50;
const stepzoom = 5, minzoom = 5, maxzoom = 20;

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
      { language: 'EN-US', message: 'Click to start!', screen_offset: {x: canvas2d.x/2-60, y: canvas2d.y/2+200}},
      { language: 'PT-BR', message: 'Clique para começar!', screen_offset: {x: canvas2d.x/2-100, y: canvas2d.y/2+200}},
    ]
  },
  {
    code: 'AXIS_SPEED',
    localizations: [
      { language: 'EN-US', message: 'Axis speed', screen_offset: {x: 0, y: 10}},
      { language: 'PT-BR', message: 'Velocidade dos eixos', screen_offset: {x: 0, y: 10}},
    ]
  },
]

var CLICK_START;
var AXIS_SPEED;

const defaultLanguage = 'EN-US';
var language;

var pointsFigure1 = [];
var facesFigure1 = [];

var pointsFigure2 = [];
var facesFigure2 = [];

var myPoints = [];
var myFaces = [];
var destPoints = [];
var destFaces = [];
var destStep = [];

var figure; // 1-LELÊ; 2-I LOVE YOU!/TE AMO!!!
var explodingStatus = 0;

var zoomcamera = 8;
var rot3d = {x: 0.0, y: 0.0, z: 0.0};
var newVel3d = {x: 0.0, y: 0.0, z: 0.0};
var vel3d = {x: 0.0, y: 0.0, z: 0.0};
var acel3d = {x: 0.0, y: 0.0, z: 0.0};
var start = false;

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

  const devBy = getLocalizatedMessage('DEV', 'Developed by', {x: 10, y: 10});

  var a = createA('https://www.linkedin.com/in/ebezerra-it', devBy.message + ' Eduardo Bezerra', '_blank');
  a.position(devBy.screen_offset.x, devBy.screen_offset.y);
  a.style('font-size', '12px');
  a.style('font-family', 'arial');
  a.style('text-decoration', 'none');
  a.style('font-weight', 'normal');
  a.style('color', '#ffffff'); 
  

  CLICK_START = getLocalizatedMessage('CLICK_START', 'Click to start!', {x: canvas2d.x/2-60, y: canvas2d.y/2+200});
  AXIS_SPEED = getLocalizatedMessage('AXIS_SPEED', 'Axis speed', {x: 0, y: 10}); 

  const cnv = createCanvas(canvas2d.x, canvas2d.y);
  cnv.mouseClicked(() => {
    start = !start;
    if (start) changeRotation();
  });
  
  cnv.mouseWheel((event) => {
    if (event.deltaY < 0) {
      if (zoomcamera - stepzoom < minzoom) 
        zoomcamera = minzoom;
      else zoomcamera -= stepzoom;
    } else if (event.deltaY > 0) {
      if (zoomcamera + stepzoom > maxzoom) 
        zoomcamera = maxzoom;
      else zoomcamera += stepzoom;
    }
  }); 

  //FIGURE 1
  var lPoints = [
    {x:  0, y:  0, z:  1}, //0
    {x:  0, y:  0, z: -1}, //6
    {x:  0, y: 10, z: -1}, //7
    {x:  0, y: 10, z:  1}, //1
    
    {x:  0, y: 10, z:  1}, //1
    {x:  0, y: 10, z: -1}, //7
    {x:  6, y: 10, z: -1}, //8
    {x:  6, y: 10, z:  1}, //2
    
    {x:  6, y: 10, z:  1}, //2
    {x:  6, y: 10, z: -1}, //8
    {x:  6, y:  8, z: -1}, //9
    {x:  6, y:  8, z:  1}, //3
    
    {x:  6, y:  8, z:  1}, //3
    {x:  6, y:  8, z: -1}, //9
    {x:  2, y:  8, z: -1}, //10
    {x:  2, y:  8, z:  1}, //4
    
    {x:  2, y:  8, z:  1}, //4
    {x:  2, y:  8, z: -1}, //10
    {x:  2, y:  0, z: -1}, //11
    {x:  2, y:  0, z:  1}, //5
    
    {x:  2, y:  0, z:  1}, //5
    {x:  2, y:  0, z: -1}, //11
    {x:  0, y:  0, z: -1}, //6
    {x:  0, y:  0, z:  1}, //0
    
    {x:  2, y:  0, z:  1}, //5
    {x:  2, y:  0, z: -1}, //11
    {x:  0, y:  0, z: -1}, //6
    {x:  0, y:  0, z:  1}, //0
    
    {x:  2, y:  0, z:  1}, //5
    {x:  2, y:  0, z: -1}, //11
    {x:  0, y:  0, z: -1}, //6
    {x:  0, y:  0, z:  1}, //0
    
    {x:  2, y:  0, z:  1}, //5
    {x:  2, y:  0, z: -1}, //11
    {x:  0, y:  0, z: -1}, //6
    {x:  0, y:  0, z:  1}, //0
    
    {x:  2, y:  0, z:  1}, //5
    {x:  2, y:  0, z: -1}, //11
    {x:  0, y:  0, z: -1}, //6
    {x:  0, y:  0, z:  1}, //0
  ];
  
  var ePoints = [
    {x:  0, y:  0, z:  1}, //0
    {x:  0, y:  0, z: -1}, //12
    {x:  0, y: 10, z: -1}, //13
    {x:  0, y: 10, z:  1}, //1
    
    {x:  0, y: 10, z:  1}, //1
    {x:  0, y: 10, z: -1}, //13
    {x:  6, y: 10, z: -1}, //14
    {x:  6, y: 10, z:  1}, //2
    
    {x:  6, y: 10, z:  1}, //2
    {x:  6, y: 10, z: -1}, //14
    {x:  6, y:  8, z: -1}, //15
    {x:  6, y:  8, z:  1}, //3
    
    {x:  6, y:  8, z:  1}, //3
    {x:  6, y:  8, z: -1}, //15
    {x:  2, y:  8, z: -1}, //16
    {x:  2, y:  8, z:  1}, //4
    
    {x:  2, y:  8, z:  1}, //4
    {x:  2, y:  8, z: -1}, //16
    {x:  2, y:  6, z: -1}, //17
    {x:  2, y:  6, z:  1}, //5
    
    {x:  2, y:  6, z:  1}, //5
    {x:  2, y:  6, z: -1}, //17
    {x:  5, y:  6, z: -1}, //18
    {x:  5, y:  6, z:  1}, //6
    
    {x:  5, y:  6, z:  1}, //6
    {x:  5, y:  6, z: -1}, //18
    {x:  5, y:  4, z: -1}, //19
    {x:  5, y:  4, z:  1}, //7
    
    {x:  5, y:  4, z:  1}, //7
    {x:  5, y:  4, z: -1}, //19
    {x:  2, y:  4, z: -1}, //20
    {x:  2, y:  4, z:  1}, //8
    
    {x:  2, y:  4, z:  1}, //8
    {x:  2, y:  4, z: -1}, //20
    {x:  2, y:  2, z: -1}, //21
    {x:  2, y:  2, z:  1}, //9
    
    {x:  2, y:  2, z:  1}, //9
    {x:  2, y:  2, z: -1}, //21
    {x:  6, y:  2, z: -1}, //22
    {x:  6, y:  2, z:  1}, //10
    
    {x:  6, y:  2, z:  1}, //10
    {x:  6, y:  2, z: -1}, //22
    {x:  6, y:   0, z: -1}, //23
    {x:  6, y:   0, z:  1}, //11
    
    {x:  6, y:   0, z:  1}, //11
    {x:  6, y:   0, z: -1}, //23
    {x:  0, y:   0, z: -1}, //12
    {x:  0, y:   0, z:  1}, //0
  ] 
  
  var accentPoints = [
    {x:  0, y:   0, z:  1}, //0
    {x:  0, y:   0, z: -1}, //6
    {x:  1, y:   0, z: -1}, //7
    {x:  1, y:   0, z:  1}, //1
    
    {x:  1, y:   0, z:  1}, //1
    {x:  1, y:   0, z: -1}, //7
    {x:  2, y:   1, z: -1}, //8
    {x:  2, y:   1, z:  1}, //2
    
    {x:  2, y:   1, z:  1}, //2
    {x:  2, y:   1, z: -1}, //8
    {x:  3, y:   0, z: -1}, //9
    {x:  3, y:   0, z:  1}, //3
    
    {x:  3, y:   0, z:  1}, //3
    {x:  3, y:   0, z: -1}, //9
    {x:  4, y:   0, z: -1}, //10
    {x:  4, y:   0, z:  1}, //4
    
    {x:  4, y:   0, z:  1}, //4
    {x:  4, y:   0, z: -1}, //10
    {x:  2, y:   2, z: -1}, //11
    {x:  2, y:   2, z:  1}, //5
    
    {x:  2, y:   2, z:  1}, //5
    {x:  2, y:   2, z: -1}, //11
    {x:  0, y:   0, z: -1}, //6
    {x:  0, y:   0, z:  1}, //0
  ];
  
  /*var heartPoints2 = [
    {x:  2, y:   0, z:  1}, //0
    {x:  2, y:   0, z: -1}, //10
    {x:  2, y:  -2, z: -1}, //11
    {x:  2, y:  -2, z:  1}, //1
    
    {x:  2, y:  -2, z:  1}, //1
    {x:  2, y:  -2, z: -1}, //11
    {x:  5, y:  -5, z: -1}, //12
    {x:  5, y:  -5, z:  1}, //2
    
    {x:  5, y:  -5, z:  1}, //2
    {x:  5, y:  -5, z: -1}, //12
    {x:  8, y:  -2, z: -1}, //13
    {x:  8, y:  -2, z:  1}, //3
    
    {x:  8, y:  -2, z:  1}, //3
    {x:  8, y:  -2, z: -1}, //13
    {x:  8, y:   0, z: -1}, //14
    {x:  8, y:   0, z:  1}, //4
    
    {x:  8, y:   0, z:  1}, //4
    {x:  8, y:   0, z: -1}, //14
    {x:  7, y:   1, z: -1}, //15
    {x:  7, y:   1, z:  1}, //5
    
    {x:  7, y:   1, z:  1}, //5
    {x:  7, y:   1, z: -1}, //15
    {x:  6, y:   1, z: -1}, //16
    {x:  6, y:   1, z:  1}, //6
    
    {x:  6, y:   1, z:  1}, //6
    {x:  6, y:   1, z: -1}, //16
    {x:  5, y:   0, z: -1}, //17
    {x:  5, y:   0, z:  1}, //7
    
    {x:  5, y:   0, z:  1}, //7
    {x:  5, y:   0, z: -1}, //17
    {x:  4, y:   1, z: -1}, //18
    {x:  4, y:   1, z:  1}, //8
    
    {x:  4, y:   1, z:  1}, //8
    {x:  4, y:   1, z: -1}, //18
    {x:  3, y:   1, z: -1}, //19
    {x:  3, y:   1, z:  1}, //9
    
    {x:  3, y:   1, z:  1}, //9
    {x:  3, y:   1, z: -1}, //19
    {x:  2, y:   0, z: -1}, //10
    {x:  2, y:   0, z:  1}, //0
  ];*/


  var heartPoints = [
    { x: 0.0,     y: 0.0,    z: 1},  // 0
    { x: 0.0,     y: 0.0,    z: -1}, // 26
    { x: 35.97,   y: 34.85,  z: -1}, // 27
    { x: 35.97,   y: 34.85,  z: 1},  // 1

    { x: 35.97,   y: 34.85,  z: 1},  // 1
    { x: 35.97,   y: 34.85,  z: -1}, // 27
    { x: 82.97,   y: 80.85,  z: -1}, // 28
    { x: 82.97,   y: 80.85,  z: 1},  // 2

    { x: 82.97,   y: 80.85,  z: 1},  // 2
    { x: 82.97,   y: 80.85,  z: -1}, // 28
    { x: 180.25,  y: 175.85, z: -1}, // 29
    { x: 180.25,  y: 175.85, z: 1},  // 3

    { x: 180.25,  y: 175.85, z: 1},  // 3
    { x: 180.25,  y: 175.85, z: -1}, // 29
    { x: 130.97,  y: 127.85, z: -1}, // 30
    { x: 130.97,  y: 127.85, z: 1},  // 4

    { x: 130.97,  y: 127.85, z: 1},  // 4
    { x: 130.97,  y: 127.85, z: -1}, // 30  
    { x: 218.97,  y: 222.85, z: -1}, // 31
    { x: 218.97,  y: 222.85, z: 1},  // 5

    { x: 218.97,  y: 222.85, z: 1},  // 5
    { x: 218.97,  y: 222.85, z: -1}, // 31
    { x: 234.97,  y: 270.85, z: -1}, // 32
    { x: 234.97,  y: 270.85, z: 1},  // 6

    { x: 234.97,  y: 270.85, z: 1},  // 6
    { x: 234.97,  y: 270.85, z: -1}, // 32
    { x: 235.97,  y: 321.85, z: -1}, // 33
    { x: 235.97,  y: 321.85, z: 1},  // 7

    { x: 235.97,  y: 321.85, z: 1},  // 7
    { x: 235.97,  y: 321.85, z: -1}, // 33
    { x: 220.97,  y: 370.85, z: -1}, // 34
    { x: 220.97,  y: 370.85, z: 1},  // 8

    { x: 220.97,  y: 370.85, z: 1},  // 8
    { x: 220.97,  y: 370.85, z: -1}, // 34
    { x: 187.97,  y: 408.85, z: -1}, // 35
    { x: 187.97,  y: 408.85, z: 1},  // 9

    { x: 187.97,  y: 408.85, z: 1},  // 9
    { x: 187.97,  y: 408.85, z: -1}, // 35
    { x: 138.97,  y: 429.85, z: -1}, // 36
    { x: 138.97,  y: 429.85, z: 1},  // 10

    { x: 138.97,  y: 429.85, z: 1},  // 10
    { x: 138.97,  y: 429.85, z: -1}, // 36
    { x: 81.97,   y: 426.85, z: -1}, // 37
    { x: 81.97,   y: 426.85, z: 1},  // 11

    { x: 81.97,   y: 426.85, z: 1},  // 11
    { x: 81.97,   y: 426.85, z: -1}, // 37
    { x: 36.97,   y: 399.85, z: -1}, // 38
    { x: 36.97,   y: 399.85, z: 1},  // 12

    { x: 36.97,   y: 399.85, z: 1},  // 12
    { x: 36.97,   y: 399.85, z: -1}, // 38
    { x: 0.0,     y: 350.85, z: -1}, // 39 (topo do "V")
    { x: 0.0,     y: 350.85, z: 1},  // 13 (topo do "V")

    { x: 0.0,     y: 350.85, z: 1},  // 13 (topo do "V")
    { x: 0.0,     y: 350.85, z: -1}, // 39 (topo do "V")
    { x: -36.97,  y: 399.85, z: -1}, // 40
    { x: -36.97,  y: 399.85, z: 1},  // 14

    { x: -36.97,  y: 399.85, z: 1},  // 14
    { x: -36.97,  y: 399.85, z: -1}, // 40
    { x: -81.97,  y: 426.85, z: -1}, // 41
    { x: -81.97,  y: 426.85, z: 1},  // 15

    { x: -81.97,  y: 426.85, z: 1},  // 15
    { x: -81.97,  y: 426.85, z: -1}, // 41
    { x: -138.97, y: 429.85, z: -1}, // 42
    { x: -138.97, y: 429.85, z: 1},  // 16

    { x: -138.97, y: 429.85, z: 1},  // 16
    { x: -138.97, y: 429.85, z: -1}, // 42
    { x: -187.97, y: 408.85, z: -1}, // 43
    { x: -187.97, y: 408.85, z: 1},  // 17

    { x: -187.97, y: 408.85, z: 1},  // 17
    { x: -187.97, y: 408.85, z: -1}, // 43
    { x: -220.97, y: 370.85, z: -1}, // 44
    { x: -220.97, y: 370.85, z: 1},  // 18

    { x: -220.97, y: 370.85, z: 1},  // 18
    { x: -220.97, y: 370.85, z: -1}, // 44
    { x: -235.97, y: 321.85, z: -1}, // 45
    { x: -235.97, y: 321.85, z: 1},  // 19

    { x: -235.97, y: 321.85, z: 1},  // 19
    { x: -235.97, y: 321.85, z: -1}, // 45
    { x: -234.97, y: 270.85, z: -1}, // 46
    { x: -234.97, y: 270.85, z: 1},  // 20

    { x: -234.97, y: 270.85, z: 1},  // 20
    { x: -234.97, y: 270.85, z: -1}, // 46
    { x: -218.97, y: 222.85, z: -1}, // 47
    { x: -218.97, y: 222.85, z: 1},  // 21

    { x: -218.97, y: 222.85, z: 1},  // 21
    { x: -218.97, y: 222.85, z: -1}, // 47
    { x: -130.97, y: 127.85, z: -1}, // 48
    { x: -130.97, y: 127.85, z: 1},  // 22

    { x: -130.97, y: 127.85, z: 1},  // 22
    { x: -130.97, y: 127.85, z: -1}, // 48
    { x: -180.25, y: 175.85, z: -1}, // 49
    { x: -180.25, y: 175.85, z: 1},  // 23

    { x: -180.25, y: 175.85, z: 1},  // 23
    { x: -180.25, y: 175.85, z: -1}, // 49
    { x: -82.97,  y: 80.85,  z: -1}, // 50
    { x: -82.97,  y: 80.85,  z: 1},  // 24

    { x: -82.97,  y: 80.85,  z: 1},  // 24
    { x: -82.97,  y: 80.85,  z: -1}, // 50
    { x: -35.97,  y: 34.85,  z: -1}, // 51
    { x: -35.97,  y: 34.85,  z: 1},  // 25
    
    { x: -35.97,  y: 34.85,  z: 1},  // 25
    { x: -35.97,  y: 34.85,  z: -1}, // 51
    { x: 0.0,     y: 0.0,    z: -1}, // 26
    { x: 0.0,     y: 0.0,    z: 1},  // 0

  ]

  var tPoints = [
    {x:  0, y:  0, z:  1}, //0
    {x:  0, y:  0, z: -1}, //8
    {x:  0, y:  2, z: -1}, //9
    {x:  0, y:  2, z:  1}, //1
    
    {x:  0, y:  2, z:  1}, //1
    {x:  0, y:  2, z: -1}, //9
    {x:  3, y:  2, z: -1}, //10
    {x:  3, y:  2, z:  1}, //2
    
    {x:  3, y:  2, z:  1}, //2
    {x:  3, y:  2, z: -1}, //10
    {x:  3, y: 10, z: -1}, //11
    {x:  3, y: 10, z:  1}, //3
    
    {x:  3, y: 10, z:  1}, //3
    {x:  3, y: 10, z: -1}, //11
    {x:  5, y: 10, z: -1}, //12
    {x:  5, y: 10, z:  1}, //4
    
    {x:  5, y: 10, z:  1}, //4
    {x:  5, y: 10, z: -1}, //12
    {x:  5, y:  2, z: -1}, //13
    {x:  5, y:  2, z:  1}, //5
    
    {x:  5, y:  2, z:  1}, //5
    {x:  5, y:  2, z: -1}, //13
    {x:  8, y:  2, z: -1}, //14
    {x:  8, y:  2, z:  1}, //6
    
    {x:  8, y:  2, z:  1}, //6
    {x:  8, y:  2, z: -1}, //14
    {x:  8, y:   0, z: -1}, //15
    {x:  8, y:   0, z:  1}, //7
    
    {x:  8, y:   0, z:  1}, //7
    {x:  8, y:   0, z: -1}, //15
    {x:  0, y:   0, z: -1}, //8
    {x:  0, y:   0, z:  1}, //0
  ];
  
  var aPoints = [

    //Outter
    {x:  3, y:   0, z:  1}, //0
    {x:  3, y:   0, z: -1}, //8
    {x:  6, y:   0, z: -1}, //9
    {x:  6, y:   0, z:  1}, //1

    {x:  6, y:   0, z:  1}, //1
    {x:  6, y:   0, z: -1}, //9
    {x:  9, y:  10, z: -1}, //10
    {x:  9, y:  10, z:  1}, //2

    {x:  9, y:  10, z:  1}, //2
    {x:  9, y:  10, z: -1}, //10
    {x:  7, y:  10, z: -1}, //11
    {x:  7, y:  10, z:  1}, //3

    {x:  7, y:  10, z:  1}, //3
    {x:  7, y:  10, z: -1}, //11
    {x:  6, y:   7, z: -1}, //12
    {x:  6, y:   7, z:  1}, //4

    {x:  6, y:   7, z:  1}, //4
    {x:  6, y:   7, z: -1}, //12
    {x:  3, y:   7, z: -1}, //13
    {x:  3, y:   7, z:  1}, //5

    {x:  3, y:   7, z:  1}, //5
    {x:  3, y:   7, z: -1}, //13
    {x:  2, y:  10, z: -1}, //14
    {x:  2, y:  10, z:  1}, //6

    {x:  2, y:  10, z:  1}, //6
    {x:  2, y:  10, z: -1}, //14
    {x:  0, y:  10, z: -1}, //15
    {x:  0, y:  10, z:  1}, //7

    {x:  0, y:  10, z:  1}, //7
    {x:  0, y:  10, z: -1}, //15
    {x:  3, y:   0, z: -1}, //8
    {x:  3, y:   0, z:  1}, //0

    //Inner
    {x:  4, y:   2, z:  1}, //16
    {x:  4, y:   2, z: -1}, //20
    {x:  5, y:   2, z: -1}, //21
    {x:  5, y:   2, z:  1}, //17

    {x:  5, y:   2, z:  1}, //17
    {x:  5, y:   2, z: -1}, //21
    {x:  5.5, y:   5, z: -1}, //22
    {x:  5.5, y:   5, z:  1}, //18

    {x:  5.5, y:   5, z:  1}, //18
    {x:  5.5, y:   5, z: -1}, //22
    {x:  3.5, y:   5, z: -1}, //23
    {x:  3.5, y:   5, z:  1}, //19

    {x:  3.5, y:   5, z:  1}, //19
    {x:  3.5, y:   5, z: -1}, //23
    {x:  4, y:   2, z: -1}, //20
    {x:  4, y:   2, z:  1}, //16
  ];
  
  var mPoints = [
    {x:  0, y:   0, z:  1}, //0
    {x:  0, y:   0, z: -1}, //12
    {x:  2, y:   0, z: -1}, //13
    {x:  2, y:   0, z:  1}, //1

    {x:  2, y:   0, z:  1}, //1
    {x:  2, y:   0, z: -1}, //13
    {x:  4, y:   3, z: -1}, //14
    {x:  4, y:   3, z:  1}, //2

    {x:  4, y:   3, z:  1}, //2
    {x:  4, y:   3, z: -1}, //14
    {x:  6, y:   0, z: -1}, //15
    {x:  6, y:   0, z:  1}, //3

    {x:  6, y:   0, z:  1}, //3
    {x:  6, y:   0, z: -1}, //15
    {x:  8, y:   0, z: -1}, //16
    {x:  8, y:   0, z:  1}, //4

    {x:  8, y:   0, z:  1}, //4
    {x:  8, y:   0, z: -1}, //16
    {x:  8, y:  10, z: -1}, //17
    {x:  8, y:  10, z:  1}, //5

    {x:  8, y:  10, z:  1}, //5
    {x:  8, y:  10, z: -1}, //17
    {x:  6, y:  10, z: -1}, //18
    {x:  6, y:  10, z:  1}, //6

    {x:  6, y:  10, z:  1}, //6
    {x:  6, y:  10, z: -1}, //18
    {x:  6, y:   3, z: -1}, //19
    {x:  6, y:   3, z:  1}, //7

    {x:  6, y:   3, z:  1}, //7
    {x:  6, y:   3, z: -1}, //19
    {x:  4, y:   6, z: -1}, //20
    {x:  4, y:   6, z:  1}, //8

    {x:  4, y:   6, z:  1}, //8
    {x:  4, y:   6, z: -1}, //20
    {x:  2, y:   3, z: -1}, //21
    {x:  2, y:   3, z:  1}, //9

    {x:  2, y:   3, z:  1}, //9
    {x:  2, y:   3, z: -1}, //21
    {x:  2, y:  10, z: -1}, //22
    {x:  2, y:  10, z:  1}, //10

    {x:  2, y:  10, z:  1}, //10
    {x:  2, y:  10, z: -1}, //22
    {x:  0, y:  10, z: -1}, //23
    {x:  0, y:  10, z:  1}, //11

    {x:  0, y:  10, z:  1}, //11
    {x:  0, y:  10, z: -1}, //23
    {x:  0, y:   0, z: -1}, //12
    {x:  0, y:   0, z:  1}, //0
  ];
  
  var oPoints = [
    
    //Outter O
    {x:  2, y:   0, z:  1}, //0
    {x:  2, y:   0, z: -1}, //8
    {x:  6, y:   0, z: -1}, //9
    {x:  6, y:   0, z:  1}, //1
    
    {x:  6, y:   0, z:  1}, //1
    {x:  6, y:   0, z: -1}, //9
    {x:  8, y:   2, z: -1}, //10
    {x:  8, y:   2, z:  1}, //2
    
    {x:  8, y:   2, z:  1}, //2
    {x:  8, y:   2, z: -1}, //10
    {x:  8, y:   8, z: -1}, //11
    {x:  8, y:   8, z:  1}, //3
    
    {x:  8, y:   8, z:  1}, //3
    {x:  8, y:   8, z: -1}, //11
    {x:  6, y:  10, z: -1}, //12
    {x:  6, y:  10, z:  1}, //4
    
    {x:  6, y:  10, z:  1}, //4
    {x:  6, y:  10, z: -1}, //12
    {x:  2, y:  10, z: -1}, //13
    {x:  2, y:  10, z:  1}, //5
    
    {x:  2, y:  10, z:  1}, //5
    {x:  2, y:  10, z: -1}, //13
    {x:  0, y:   8, z: -1}, //14
    {x:  0, y:   8, z:  1}, //6
    
    {x:  0, y:   8, z:  1}, //6
    {x:  0, y:   8, z: -1}, //14
    {x:  0, y:   2, z: -1}, //15
    {x:  0, y:   2, z:  1}, //7
    
    {x:  0, y:   2, z:  1}, //7
    {x:  0, y:   2, z: -1}, //15
    {x:  2, y:   0, z: -1}, //8
    {x:  2, y:   0, z:  1}, //0


    // Inner o    
    {x:  3, y:   2, z:  1}, //16
    {x:  3, y:   2, z: -1}, //24
    {x:  5, y:   2, z: -1}, //25
    {x:  5, y:   2, z:  1}, //17
    
    {x:  5, y:   2, z:  1}, //17
    {x:  5, y:   2, z: -1}, //25
    {x:  6, y:   3, z: -1}, //26
    {x:  6, y:   3, z:  1}, //18
    
    {x:  6, y:   3, z:  1}, //18
    {x:  6, y:   3, z: -1}, //26
    {x:  6, y:   7, z: -1}, //27
    {x:  6, y:   7, z:  1}, //19
    
    {x:  6, y:   7, z:  1}, //19
    {x:  6, y:   7, z: -1}, //27
    {x:  5, y:   8, z: -1}, //28
    {x:  5, y:   8, z:  1}, //20
    
    {x:  5, y:   8, z:  1}, //20
    {x:  5, y:   8, z: -1}, //28
    {x:  3, y:   8, z: -1}, //29
    {x:  3, y:   8, z:  1}, //21
    
    {x:  3, y:   8, z:  1}, //21
    {x:  3, y:   8, z: -1}, //29
    {x:  2, y:   7, z: -1}, //30
    {x:  2, y:   7, z:  1}, //22
    
    {x:  2, y:   7, z:  1}, //22
    {x:  2, y:   7, z: -1}, //30
    {x:  2, y:   3, z: -1}, //31
    {x:  2, y:   3, z:  1}, //23
    
    {x:  2, y:   3, z:  1}, //23
    {x:  2, y:   3, z: -1}, //31
    {x:  3, y:   2, z: -1}, //24
    {x:  3, y:   2, z:  1}, //16
      
  ];
  
  var exclamationPoints = [
    {x:  0, y:  0, z:  1}, //0
    {x:  0, y:  0, z: -1}, //4
    {x:  0, y:  7, z: -1}, //5
    {x:  0, y:  7, z:  1}, //1
    
    {x:  0, y:  7, z:  1}, //1
    {x:  0, y:  7, z: -1}, //5
    {x:  2, y:  7, z: -1}, //6
    {x:  2, y:  7, z:  1}, //2
    
    {x:  2, y:  7, z:  1}, //2
    {x:  2, y:  7, z: -1}, //6
    {x:  2, y:  0, z: -1}, //7
    {x:  2, y:  0, z:  1}, //3
    
    {x:  2, y:  0, z:  1}, //3
    {x:  2, y:  0, z: -1}, //7
    {x:  0, y:  0, z: -1}, //4
    {x:  0, y:  0, z:  1}, //0
    
    {x:  0, y:  8, z:  1}, //8
    {x:  0, y:  8, z: -1}, //12
    {x:  0, y: 10, z: -1}, //13
    {x:  0, y: 10, z:  1}, //9
    
    {x:  0, y: 10, z:  1}, //9
    {x:  0, y: 10, z: -1}, //13
    {x:  2, y: 10, z: -1}, //14
    {x:  2, y: 10, z:  1}, //10
    
    {x:  2, y: 10, z:  1}, //10
    {x:  2, y: 10, z: -1}, //14
    {x:  2, y:  8, z: -1}, //15
    {x:  2, y:  8, z:  1}, //11
    
    {x:  2, y:  8, z:  1}, //11
    {x:  2, y:  8, z: -1}, //15
    {x:  0, y:  8, z: -1}, //12
    {x:  0, y:  8, z:  1}, //8
  ];
  
  var iPoints = [
    
    {x:  0, y:   0, z:  1}, //0
    {x:  0, y:   0, z: -1}, //4
    {x:  2, y:   0, z: -1}, //5
    {x:  2, y:   0, z:  1}, //1
    
    {x:  2, y:   0, z:  1}, //1
    {x:  2, y:   0, z: -1}, //5
    {x:  2, y:  10, z: -1}, //6
    {x:  2, y:  10, z:  1}, //2
    
    {x:  2, y:  10, z:  1}, //2
    {x:  2, y:  10, z: -1}, //6
    {x:  0, y:  10, z: -1}, //7
    {x:  0, y:  10, z:  1}, //3
    
    {x:  0, y:  10, z:  1}, //3
    {x:  0, y:  10, z: -1}, //7
    {x:  0, y:   0, z: -1}, //4
    {x:  0, y:   0, z:  1}, //0

  ];
  
  var vPoints = [
    {x:  0, y:   0, z:  1}, //0
    {x:  0, y:   0, z: -1}, //7
    {x:  2, y:   0, z: -1}, //8
    {x:  2, y:   0, z:  1}, //1
    
    {x:  2, y:   0, z:  1}, //1
    {x:  2, y:   0, z: -1}, //8
    {x:  4, y:   7, z: -1}, //9
    {x:  4, y:   7, z:  1}, //2
    
    {x:  4, y:   7, z:  1}, //2
    {x:  4, y:   7, z: -1}, //9
    {x:  6, y:   0, z: -1}, //10
    {x:  6, y:   0, z:  1}, //3
    
    {x:  6, y:   0, z:  1}, //3
    {x:  6, y:   0, z: -1}, //10
    {x:  8, y:   0, z: -1}, //11
    {x:  8, y:   0, z:  1}, //4
    
    {x:  8, y:   0, z:  1}, //4
    {x:  8, y:   0, z: -1}, //11
    {x:  5, y:  10, z: -1}, //12
    {x:  5, y:  10, z:  1}, //5
    
    {x:  5, y:  10, z:  1}, //5
    {x:  5, y:  10, z: -1}, //12
    {x:  3, y:  10, z: -1}, //13
    {x:  3, y:  10, z:  1}, //6
    
    {x:  3, y:  10, z:  1}, //6
    {x:  3, y:  10, z: -1}, //13
    {x:  0, y:   0, z: -1}, //7
    {x:  0, y:   0, z:  1}, //0
  ];
  
  var uPoints = [
    {x:  0, y:   0, z:  1},  //0
    {x:  0, y:   0, z: -1},  //12
    {x:  2, y:   0, z: -1},  //13
    {x:  2, y:   0, z:  1},  //1
    
    {x:  2, y:   0, z:  1},  //1
    {x:  2, y:   0, z: -1},  //13
    {x:  2, y:   7, z: -1},  //14
    {x:  2, y:   7, z:  1},  //2
    
    {x:  2, y:   7, z:  1},  //2
    {x:  2, y:   7, z: -1},  //14
    {x:  3, y:   8, z: -1},  //15
    {x:  3, y:   8, z:  1},  //3
    
    {x:  3, y:   8, z:  1},  //3
    {x:  3, y:   8, z: -1},  //15
    {x:  5, y:   8, z: -1},  //16
    {x:  5, y:   8, z:  1},  //4
    
    {x:  5, y:   8, z:  1},  //4
    {x:  5, y:   8, z: -1},  //16
    {x:  6, y:   7, z: -1},  //17
    {x:  6, y:   7, z:  1},  //5
    
    {x:  6, y:   7, z:  1},  //5
    {x:  6, y:   7, z: -1},  //17
    {x:  6, y:   0, z: -1},  //18
    {x:  6, y:   0, z:  1},  //6
    
    {x:  6, y:   0, z:  1},  //6
    {x:  6, y:   0, z: -1},  //18
    {x:  8, y:   0, z: -1},  //19
    {x:  8, y:   0, z:  1},  //7
    
    {x:  8, y:   0, z:  1},  //7
    {x:  8, y:   0, z: -1},  //19
    {x:  8, y:   8, z: -1},  //20
    {x:  8, y:   8, z:  1},  //8
    
    {x:  8, y:   8, z:  1},  //8
    {x:  8, y:   8, z: -1},  //20
    {x:  6, y:  10, z: -1},  //21
    {x:  6, y:  10, z:  1},  //9
    
    {x:  6, y:  10, z:  1},  //9
    {x:  6, y:  10, z: -1},  //21
    {x:  2, y:  10, z: -1},  //22
    {x:  2, y:  10, z:  1},  //10
    
    {x:  2, y:  10, z:  1},  //10
    {x:  2, y:  10, z: -1},  //22
    {x:  0, y:   8, z: -1},  //23
    {x:  0, y:   8, z:  1},  //11
    
    {x:  0, y:   8, z:  1},  //11
    {x:  0, y:   8, z: -1},  //23
    {x:  0, y:   0, z: -1},  //12
    {x:  0, y:   0, z:  1},  //0
    
  ];

  var yPoints = [
    {x:  0, y:   0, z:  1},  //0
    {x:  0, y:   0, z: -1},  //9
    {x:  2, y:   0, z: -1},  //10
    {x:  2, y:   0, z:  1},  //1
    
    {x:  2, y:   0, z:  1},  //1
    {x:  2, y:   0, z: -1},  //10
    {x:  3, y:   4, z: -1},  //11
    {x:  3, y:   4, z:  1},  //2
    
    {x:  3, y:   4, z:  1},  //2
    {x:  3, y:   4, z: -1},  //11
    {x:  4, y:   0, z: -1},  //12
    {x:  4, y:   0, z:  1},  //3
    
    {x:  4, y:   0, z:  1},  //3
    {x:  4, y:   0, z: -1},  //12
    {x:  6, y:   0, z: -1},  //13
    {x:  6, y:   0, z:  1},  //4
    
    {x:  6, y:   0, z:  1},  //4
    {x:  6, y:   0, z: -1},  //13
    {x:  4, y:   6, z: -1},  //14
    {x:  4, y:   6, z:  1},  //5
    
    {x:  4, y:   6, z:  1},  //5
    {x:  4, y:   6, z: -1},  //14
    {x:  4, y:  10, z: -1},  //15
    {x:  4, y:  10, z:  1},  //6
    
    {x:  4, y:  10, z:  1},  //6
    {x:  4, y:  10, z: -1},  //15
    {x:  2, y:  10, z: -1},  //16
    {x:  2, y:  10, z:  1},  //7
    
    {x:  2, y:  10, z:  1}, //7
    {x:  2, y:  10, z: -1}, //16
    {x:  2, y:   6, z: -1}, //17
    {x:  2, y:   6, z:  1}, //8
    
    {x:  2, y:   6, z:  1}, //8
    {x:  2, y:   6, z: -1}, //17
    {x:  0, y:   0, z: -1}, //9
    {x:  0, y:   0, z:  1}, //0
    
  ];
  
  var dotPoints = [
    {x:  0, y:   0, z:  1},  //0
    {x:  0, y:   0, z: -1},  //4
    {x:  2, y:   0, z: -1},  //5
    {x:  2, y:   0, z:  1},  //1

    {x:  2, y:   0, z:  1},  //1
    {x:  2, y:   0, z: -1},  //5
    {x:  2, y:   2, z: -1},  //6
    {x:  2, y:   2, z:  1},  //2

    {x:  2, y:   2, z:  1},  //2
    {x:  2, y:   2, z: -1},  //6
    {x:  0, y:   2, z: -1},  //7
    {x:  0, y:   2, z:  1},  //3

    {x:  0, y:   2, z:  1},  //3
    {x:  0, y:   2, z: -1},  //7
    {x:  0, y:   0, z: -1},  //4
    {x:  0, y:   0, z:  1},  //0
  ];
  
  invertFigureY(heartPoints);
  invertFigureY(accentPoints);

  // center itens
  lPoints = centerFigure(lPoints);
  ePoints = centerFigure(ePoints);

  tPoints = centerFigure(tPoints);
  aPoints = centerFigure(aPoints);
  mPoints = centerFigure(mPoints);
  oPoints = centerFigure(oPoints);
  vPoints = centerFigure(vPoints);
  yPoints = centerFigure(yPoints);
  uPoints = centerFigure(uPoints);
  iPoints = centerFigure(iPoints);
  dotPoints = centerFigure(dotPoints);
  accentPoints = centerFigure(accentPoints);
  exclamationPoints = centerFigure(exclamationPoints);
  heartPoints = centerFigure(scaleFigurez(scaleFigurex(scaleFigurey(heartPoints,1/8),1/8),6));

  pointsFigure1 = [
    //...translateFigure(scaleFigure(heartPoints2,10), {x: -9, y: -5, z: 0}), 
    ...translateFigure(heartPoints, {x:    0, y:   -8, z: 0}),
    ...translateFigure(lPoints,      {x: -18, y:   -2, z: 0}), 
    ...translateFigure(ePoints,      {x: -10, y:   -2, z: 0}), 
    ...translateFigure(lPoints,      {x:  -2, y:   -2, z: 0}), 
    ...translateFigure(ePoints,      {x:   6, y:   -2, z: 0}), 
    ...translateFigure(accentPoints, {x:   6, y:    5, z: 0}),
    ...translateFigure(dotPoints,    {x:  14, y: -6.5, z: 0}),
    ...translateFigure(dotPoints,    {x:  18, y: -6.5, z: 0}),
    ...translateFigure(dotPoints,    {x:  22, y: -6.5, z: 0}),
  ];
  
  pointsFigure1 = centerFigure(pointsFigure1); 

  for (i = 0; i<pointsFigure1.length; i+=4) {
    facesFigure1.push([i, i+1, i+2, i+3]);
  }
  
  if (language == 'EN-US') {
    pointsFigure2 = [
      ...translateFigure(iPoints, {x:-5, y: 0, z: 0}),
      ...translateFigure(lPoints, {x: 8, y: 0, z: 0}),
      ...translateFigure(oPoints, {x:16, y: 0, z: 0}),
      ...translateFigure(vPoints, {x:25, y: 0, z: 0}),
      ...translateFigure(ePoints, {x:33, y: 0, z: 0}),
      ...translateFigure(yPoints, {x:47, y: 0, z: 0}),
      ...translateFigure(oPoints, {x:55, y: 0, z: 0}),
      ...translateFigure(uPoints, {x:65, y: 0, z: 0}),
      ...translateFigure(exclamationPoints, {x: 73, y: 0, z: 0}),
    ];  
  } else {
    pointsFigure2 = [
      ...translateFigure(ePoints, {x: -27, y: 0, z: 0}),
      ...translateFigure(uPoints, {x: -18, y: 0, z: 0}),
      ...translateFigure(tPoints, {x:  -2, y: 0, z: 0}), 
      ...translateFigure(ePoints, {x:   6, y: 0, z: 0}),
      ...translateFigure(aPoints, {x:  22, y: 0, z: 0}),
      ...translateFigure(mPoints, {x:  32, y: 0, z: 0}),
      ...translateFigure(oPoints, {x:  42, y: 0, z: 0}),
      ...translateFigure(exclamationPoints, {x: 50, y: 0, z: 0}),
    ]  
  } 
  
  pointsFigure2 = centerFigure(pointsFigure2); 

  for (i = 0; i<pointsFigure2.length; i+=4) {
    facesFigure2.push([i, i+1, i+2, i+3]);
  } 
  
  // Equalize figures faces
  if (facesFigure1.length > facesFigure2.length) {
    const diffSize = facesFigure1.length - facesFigure2.length;
    const lenFigure = pointsFigure2.length;
    for (i = 0; i< diffSize; i++) {
      pointsFigure2.push(cloneObject(pointsFigure2[lenFigure - 4]));
      pointsFigure2.push(cloneObject(pointsFigure2[lenFigure - 3]));
      pointsFigure2.push(cloneObject(pointsFigure2[lenFigure - 2]));
      pointsFigure2.push(cloneObject(pointsFigure2[lenFigure - 1]));
      facesFigure2.push([lenFigure + (i*4+3), lenFigure + (i*4+2), lenFigure + (i*4+1), lenFigure + (i*4+0)]);
    }
  } else if (facesFigure1.length < facesFigure2.length) {
    const diffSize = facesFigure2.length - facesFigure1.length;
    const lenFigure = pointsFigure1.length;
    for (i = 0; i< diffSize; i++) {
      pointsFigure1.push(cloneObject(pointsFigure1[lenFigure - 4]));
      pointsFigure1.push(cloneObject(pointsFigure1[lenFigure - 3]));
      pointsFigure1.push(cloneObject(pointsFigure1[lenFigure - 2]));
      pointsFigure1.push(cloneObject(pointsFigure1[lenFigure - 1]));
      facesFigure1.push([lenFigure + (i*4+3), lenFigure + (i*4+2), lenFigure + (i*4+1), lenFigure + (i*4+0)]);
    }
  } 
  
  figure   = 1;
  myPoints = [...pointsFigure1];
  myFaces  = [...facesFigure1];

  
  for (i = 0; i< myPoints.length; i++) destStep.push({ x: 0, y: 0, z: 0});
  
  setInterval(() => {
    if (start && explodingStatus === 0) {
      explode()
    }
  }, explodeTimer);
 }

function centerFigure(points) {
  var maxx=0, maxy=0, maxz=0;
  var minx=0, miny=0, minz=0;
  
  for (var i = 0; i<points.length; i++) {
    points[i] = inverty(points[i]);
    maxx = maxx > points[i].x ? maxx : points[i].x;
    minx = minx < points[i].x ? minx : points[i].x;
    
    maxy = maxy > points[i].y ? maxy : points[i].y;
    miny = miny < points[i].y ? miny : points[i].y;
    
    maxz = maxz > points[i].z ? maxz : points[i].z;
    minz = minz < points[i].z ? minz : points[i].z;
  }
  
  const veccenter = { 
    x: (maxx + minx) / 2,
    y: (maxy + miny) / 2,
    z: (maxz + minz) / 2,
  }

  for (i = 0; i<points.length; i++) {
    points[i] = vectorDiff(points[i], veccenter);
  }
  
  return points;
}


function draw() {
  background(0);
  drawElements();
  credits();
  
  if (start) { 
    rotateAll();
  } else {
      textSize(24);
      fill("white");
      text(CLICK_START.message, CLICK_START.screen_offset.x, CLICK_START.screen_offset.y);
  }
}

function credits() {
  // Show axis speed
  textSize(10);
  strokeWeight(0);
  stroke("white");
  fill("white");
  textStyle(NORMAL);
  text(AXIS_SPEED.message +' x: ' + Math.round(vel3d.x*1000)/1000 + ' y: ' + Math.round(vel3d.y*1000)/1000 + ' z: ' + Math.round(vel3d.z*1000)/1000, AXIS_SPEED.screen_offset.x, AXIS_SPEED.screen_offset.y);
}

function keyPressed() {
  switch(keyCode) {
    case 32:
      start = !start;
      if (start) changeRotation();
      break;
    case 107: //KEYPAD "+"
      zoomcamera = zoomcamera >= maxzoom ? maxzoom : zoomcamera + stepzoom;
      break;
    case 109: //KEYPAD "-"
      zoomcamera = zoomcamera <= minzoom ? minzoom : zoomcamera - stepzoom;
      break;
    case 13: //ENTER
      if (start && explodingStatus === 0) explode();
      break;
  }
}

function explode() {

  if (explodingStatus !== 0) return;
  var randomBetween = (min, max) => Math.round(Math.random() * (max - min)*100)/100 + min;

  // const explodingRadius = 20;
  for (var i=0; i<myFaces.length;i++) {
    const dest = {
      x: randomBetween(-explodingRadius, explodingRadius),
      y: randomBetween(-explodingRadius, explodingRadius),
      z: randomBetween(-explodingRadius, explodingRadius),
    }
    
    for (var j=0; j< myFaces[i].length; j++) {
      destPoints[myFaces[i][j]] = vectorAdd(myPoints[myFaces[i][j]], dest);
    }
  }
  explodingStatus = 1;
}

function rebuildFigure() {
  figure = figure === 1 ? 2 : 1;
  
  if (figure === 1) {
    destPoints = [...pointsFigure1];
  } else {
    destPoints = [...pointsFigure2];
  }
  
  for (var j=0;j<myPoints.length;j++) {
    destStep[j] = {
      x: (destPoints[j].x - myPoints[j].x) / explodingSteps,
      y: (destPoints[j].y - myPoints[j].y) / explodingSteps,
      z: (destPoints[j].z - myPoints[j].z) / explodingSteps,
    }
  }
  
  explodingStatus = -1;
}

function rotateAll() {
  rot3d.x += vel3d.x;
  rot3d.y += vel3d.y;
  rot3d.z += vel3d.z;

  for (i = 0; i<myPoints.length; i++) {
    myPoints[i]   = rotate3d(myPoints[i],  vel3d);
    if (explodingStatus != 0) destPoints[i] = rotate3d(destPoints[i],  vel3d);
  }
  
  vel3d.x += acel3d.x;
  vel3d.y += acel3d.y;
  vel3d.z += acel3d.z;
  
  if (Math.abs(vel3d.x) > maxAxisSpeed || Math.abs(vel3d.y) > maxAxisSpeed || Math.abs(vel3d.z) > maxAxisSpeed)
    changeRotation();
  
  if (explodingStatus !== 0) {
    for (i=0; i<myPoints.length; i++) {
      destStep[i] = {
        x: (destPoints[i].x - myPoints[i].x) / explodingSteps,
        y: (destPoints[i].y - myPoints[i].y) / explodingSteps,
        z: (destPoints[i].z - myPoints[i].z) / explodingSteps,
      }
      myPoints[i] = vectorAdd(myPoints[i], destStep[i]);

      if (checkVectorEndTransition(i, myPoints[i], destPoints[i], destStep[i])) {
          if (explodingStatus === 1) rebuildFigure(); 
          else {
            explodingStatus = 0;
            for(j=0; j<destStep.length; j++) {
              destStep[j] = { x: 0, y: 0, z: 0 };
            }
          }
          break;
      }
    }
  }
}

function checkVectorEndTransition(idx, vec1, vec2, step) {
  const d = Math.sqrt(Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2) + Math.pow(vec1.z - vec2.z, 2));
  return (Math.round(d*100)/100 == 0);
}

function point3dTo2d(p3d) {
  return { 
    x: Math.round(p3d.x*(viewcamera.z + p3d.z) / viewcamera.z * zoomcamera + canvas2d.x/2),
    y: Math.round(p3d.y*(viewcamera.z + p3d.z) / viewcamera.z * zoomcamera + canvas2d.y/2),
  }
}

function drawElements() {
  for(var i = 0;i<myFaces.length;i++) {
    drawFace(myPoints, myFaces[i]);
  }
}


function drawFace(points, face) {
    var p2d1 = point3dTo2d(points[face[0]]);
    var p2d2 = point3dTo2d(points[face[1]]);
    var p2d3 = point3dTo2d(points[face[2]]);
    var p2d4 = point3dTo2d(points[face[3]]);

    stroke("white");
    strokeWeight(1);
    line(p2d1.x, p2d1.y, p2d2.x, p2d2.y);
    line(p2d2.x, p2d2.y, p2d3.x, p2d3.y);
    line(p2d3.x, p2d3.y, p2d4.x, p2d4.y);
    line(p2d4.x, p2d4.y, p2d1.x, p2d1.y);
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

function invertFigureY(points) {
  for (let i=0;i<points.length;i++)
    points[i] = inverty(points[i]);
}

function translateFigure(points, vector) {
  const newPoints = [];
  for(var i = 0; i<points.length; i++)
    newPoints.push(vectorAdd(points[i], vector));
  
  return newPoints;
}

function scaleFigure(points, scalar) {
  const newPoints = [];
  for(var i = 0; i<points.length; i++)
    newPoints.push(scalarVector(points[i], scalar));
  
  return newPoints;

}

function scaleFigurex(points, scalar) {
  const newPoints = [];
  for(var i = 0; i<points.length; i++)
    newPoints.push(scalarVectorx(points[i], scalar));
  
  return newPoints;

}

function scaleFigurey(points, scalar) {
  const newPoints = [];
  for(var i = 0; i<points.length; i++)
    newPoints.push(scalarVectory(points[i], scalar));
  
  return newPoints;

}

function scaleFigurez(points, scalar) {
  const newPoints = [];
  for(var i = 0; i<points.length; i++)
    newPoints.push(scalarVectorz(points[i], scalar));
  
  return newPoints;

}

function invertx (vector) {
    return { 
    x: -vector.x,
    y: vector.y,
    z: vector.z,
  }
}
function inverty (vector) {
    return { 
    x: vector.x,
    y: -vector.y,
    z: vector.z,
  }
}
function invertz (vector) {
    return { 
    x: vector.x,
    y: vector.y,
    z: -vector.z,
  }
}

function scalarVector(vector, scalar) {
  return { 
    x: vector.x * scalar,
    y: vector.y * scalar,
    z: vector.z * scalar,
  }
}

function scalarVectorx(vector, scalar) {
  return { 
    x: vector.x * scalar,
    y: vector.y,
    z: vector.z
  }
}

function scalarVectory(vector, scalar) {
  return { 
    x: vector.x,
    y: vector.y * scalar,
    z: vector.z
  }
}

function scalarVectorz(vector, scalar) {
  return { 
    x: vector.x,
    y: vector.y,
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

function vectorAdd(vec1, vec2) {
  return {
    x: vec1.x + vec2.x,
    y: vec1.y + vec2.y,
    z: vec1.z + vec2.z,
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
  const steps = 250; // interpolation steps
  
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
}

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
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