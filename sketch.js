// Matrix Audio Visualizer
// A psychedelic visualization that turns audio into a floating matrix of text and shapes

let audioContext;
let analyser;
let dataArray;
let textParticles = [];
let font;
let gridSize = 15;
let phrases = [
  "PROBABILITY", "MATRIX", "DIMENSION", "LANGUAGE", "CYBORG", 
  "ALIEN", "SIGNAL", "QUANTUM", "NEURAL", "SYNTHESIS",
  "BYTECODE", "ENTROPY", "COSMIC", "FRACTAL", "ECHO"
];

// Visualization modes
const MATRIX_MODE = 0;
const ALIEN_MODE = 1;
let currentMode = MATRIX_MODE;

// 3D Objects
let matrixCubes = [];
let signalWaves = [];

// Alien mode objects
let alienStructures = [];
let dataChannels = [];
let cyberOrbs = [];

// Visual state
let hueShift = 0;
let zoomLevel = 0;
let rotationSpeed = 0.005;
let pulseIntensity = 0;

// Control panel integration
window.controlValues = {
  bassMultiplier: 1.0,
  midMultiplier: 1.0,
  highMultiplier: 1.0,
  rotationSpeed: 1.0,
  zoomLevel: 0,
  particleDensity: 1.0,
  colorMode: 0
};

function preload() {
  font = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1);
  textFont(font);
  textSize(16);
  textAlign(CENTER, CENTER);
  
  // Create start button
  let startButton = createButton('BEGIN TRANSMISSION');
  startButton.position(width/2 - 100, height/2 - 25);
  startButton.size(200, 50);
  startButton.style('background-color', '#0f0f0f');
  startButton.style('color', '#1fff4f');
  startButton.style('border', '2px solid #1fff4f');
  startButton.style('font-family', 'monospace');
  startButton.style('font-size', '16px');
  startButton.style('cursor', 'pointer');
  startButton.mousePressed(startAudio);
  
  // Initialize matrix cubes
  for (let i = 0; i < 200; i++) {
    matrixCubes.push({
      x: random(-width, width),
      y: random(-height, height),
      z: random(-1000, 1000),
      size: random(5, 30),
      rotX: random(TWO_PI),
      rotY: random(TWO_PI),
      rotZ: random(TWO_PI),
      spinX: random(-0.03, 0.03),
      spinY: random(-0.03, 0.03),
      spinZ: random(-0.03, 0.03),
      hue: random(360)
    });
  }
  
  // Initialize signal waves
  for (let i = 0; i < 5; i++) {
    signalWaves.push({
      amplitude: random(100, 300),
      frequency: random(0.01, 0.05),
      phase: random(TWO_PI),
      thickness: random(2, 8),
      hue: random(360)
    });
  }
  
  // Initialize alien mode structures
  initAlienMode();
  
  // Expose toggle function to window for button access
  window.toggleVisualizationMode = toggleVisualizationMode;
}

function initAlienMode() {
  // Create alien structures - geometric forms that will pulse with the beat
  for (let i = 0; i < 12; i++) {
    alienStructures.push({
      x: random(-width/2, width/2),
      y: random(-height/2, height/2),
      z: random(-500, 500),
      scale: random(0.5, 2),
      rotation: random(TWO_PI),
      rotSpeed: random(-0.02, 0.02),
      hue: random(360),
      complexity: floor(random(3, 8))  // How complex the structure will be
    });
  }
  
  // Create data channels - streams of binary/symbol data
  for (let i = 0; i < 20; i++) {
    dataChannels.push({
      x: random(-width, width),
      y: random(-height, height),
      z: random(-800, 800),
      width: random(10, 50),
      height: random(100, 500),
      speed: random(2, 8),
      density: random(0.05, 0.2),
      hue: random(360),
      symbols: []
    });
  }
  
  // Create cyber orbs - glowing spheres that orbit the center
  for (let i = 0; i < 15; i++) {
    let radius = random(100, 500);
    let angle = random(TWO_PI);
    cyberOrbs.push({
      radius: radius,
      angle: angle,
      elevation: random(-PI/3, PI/3),
      speed: random(0.005, 0.02),
      size: random(10, 40),
      hue: random(360),
      pulseRate: random(0.02, 0.1)
    });
  }
}

function toggleVisualizationMode() {
  currentMode = (currentMode === MATRIX_MODE) ? ALIEN_MODE : MATRIX_MODE;
}

function startAudio() {
  // Remove the button
  this.remove();
  
  // Initialize audio context
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  
  // Request microphone access
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Initialize text particles with density from control panel
      let particleCount = Math.floor(100 * controlValues.particleDensity);
      for (let i = 0; i < particleCount; i++) {
        textParticles.push(createTextParticle());
      }
      
      // Dispatch the audioStarted event to trigger other components
      setTimeout(() => {
        const event = new Event('audioStarted');
        document.dispatchEvent(event);
      }, 500);
    })
    .catch(err => {
      console.error('Microphone access error:', err);
      // Create a fallback message
      let errorMsg = createP('Microphone access denied. Please allow microphone access to experience the visualization.');
      errorMsg.position(width/2 - 200, height/2);
      errorMsg.style('color', '#ff3030');
      errorMsg.style('font-family', 'monospace');
    });
}

function createTextParticle() {
  return {
    text: random(phrases),
    x: random(-width/2, width/2),
    y: random(-height/2, height/2),
    z: random(-1500, -500),
    vx: random(-1, 1),
    vy: random(-1, 1),
    vz: random(2, 5),
    size: random(10, 30),
    opacity: random(0.5, 0.9),
    hue: random(360)
  };
}

function draw() {
  // Create a digital gradient background with subtle animation
  let bgHue = (frameCount * 0.1) % 360;
  
  // Different background styles based on mode
  if (currentMode === MATRIX_MODE) {
    background(bgHue, 20, 10);
    drawGrid();
  } else {
    background(bgHue, 40, 5);
    drawStarfield();
  }
  
  // If audio is initialized
  if (analyser) {
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate audio metrics with control panel multipliers
    let bassLevel = getAverageVolume(dataArray, 0, 10) * controlValues.bassMultiplier;
    let midLevel = getAverageVolume(dataArray, 100, 300) * controlValues.midMultiplier;
    let highLevel = getAverageVolume(dataArray, 300, 500) * controlValues.highMultiplier;
    
    // Adjust visual state based on audio and control panel
    hueShift = (hueShift + bassLevel / 200) % 360;
    zoomLevel = map(midLevel, 0, 200, 0, 500) + controlValues.zoomLevel;
    rotationSpeed = map(highLevel, 0, 200, 0.001, 0.01) * controlValues.rotationSpeed;
    pulseIntensity = map(bassLevel, 0, 200, 0, 1);
    
    // Apply color mode from control panel
    applyColorMode(controlValues.colorMode);
    
    // Apply camera transformations - slightly different for each mode
    if (currentMode === MATRIX_MODE) {
      translate(0, 0, zoomLevel);
      rotateX(frameCount * rotationSpeed * 0.3);
      rotateY(frameCount * rotationSpeed);
      rotateZ(frameCount * rotationSpeed * 0.2);
      
      // Draw Matrix mode elements
      drawMatrixCubes(bassLevel);
      drawSignalWaves(midLevel);
      drawTextMatrix(highLevel);
      
      // Draw frequency spectrum
      drawFrequencySpectrum(dataArray);
    } else {
      // Alien mode camera
      translate(0, 0, zoomLevel - 200);  // Push back a bit
      rotateX(sin(frameCount * 0.001) * 0.2);
      rotateY(frameCount * rotationSpeed * 0.5);
      
      // Draw Alien mode elements
      drawAlienStructures(bassLevel);
      drawDataChannels(midLevel);
      drawCyberOrbs(highLevel);
      
      // Draw alien control panel
      drawAlienInterface(dataArray);
    }
    
    // Notify that audio has started
    if (frameCount === 60) {  // After 1 second
      let event = new Event('audioStarted');
      document.dispatchEvent(event);
    }
  } else {
    // Default view when audio not started
    rotateX(frameCount * 0.005);
    rotateY(frameCount * 0.003);
    
    if (currentMode === MATRIX_MODE) {
      // Draw "start" state elements for matrix mode
      drawMatrixCubes(10);
    } else {
      // Draw "start" state elements for alien mode
      drawAlienStructures(10);
    }
    
    push();
    fill(120, 100, 100, 0.8);
    translate(0, 0, 200);
    text("AUDIO MATRIX VISUALIZATION", 0, -50);
    text("ALLOW MICROPHONE ACCESS TO BEGIN", 0, 50);
    pop();
  }
}

function drawGrid() {
  push();
  stroke(180, 50, 50, 0.2);
  strokeWeight(0.5);
  noFill();
  
  // Create perspective effect by scaling grid lines
  let gridSpacing = 50;
  let gridExtent = 2000;
  
  // Draw horizontal grid lines
  for (let z = -gridExtent; z <= gridExtent; z += gridSpacing) {
    beginShape();
    for (let x = -gridExtent; x <= gridExtent; x += 20) {
      vertex(x, 0, z);
    }
    endShape();
  }
  
  // Draw vertical grid lines
  for (let x = -gridExtent; x <= gridExtent; x += gridSpacing) {
    beginShape();
    for (let z = -gridExtent; z <= gridExtent; z += 20) {
      vertex(x, 0, z);
    }
    endShape();
  }
  
  pop();
}

function drawMatrixCubes(intensity) {
  push();
  noStroke();
  
  for (let cube of matrixCubes) {
    push();
    translate(cube.x, cube.y, cube.z);
    
    // Apply rotation
    rotateX(cube.rotX);
    rotateY(cube.rotY);
    rotateZ(cube.rotZ);
    
    // Update rotation based on audio intensity
    cube.rotX += cube.spinX * (1 + intensity/100);
    cube.rotY += cube.spinY * (1 + intensity/100);
    cube.rotZ += cube.spinZ * (1 + intensity/100);
    
    // Render with a color related to audio intensity
    let cubeHue = (cube.hue + hueShift) % 360;
    let cubeSize = cube.size * (1 + intensity/200);
    
    fill(cubeHue, 80, 80, 0.7);
    box(cubeSize);
    
    // Add wireframe effect
    stroke(cubeHue, 80, 90, 0.5);
    strokeWeight(1);
    noFill();
    box(cubeSize * 1.1);
    
    pop();
    
    // Reset position if cube goes too far
    cube.z += 2 + intensity/20;
    if (cube.z > 1000) {
      cube.z = -1000;
      cube.x = random(-width, width);
      cube.y = random(-height, height);
    }
  }
  
  pop();
}

function drawSignalWaves(intensity) {
  push();
  noFill();
  
  for (let wave of signalWaves) {
    stroke((wave.hue + hueShift) % 360, 80, 90, 0.7);
    strokeWeight(wave.thickness * (1 + intensity/200));
    
    beginShape();
    for (let x = -width; x <= width; x += 10) {
      let y = sin(x * wave.frequency + frameCount * 0.05 + wave.phase) * wave.amplitude;
      let z = cos(x * wave.frequency * 0.5 + frameCount * 0.03) * wave.amplitude;
      vertex(x, y, z);
    }
    endShape();
  }
  
  pop();
}

function drawTextMatrix(intensity) {
  if (!textParticles.length) return;
  
  push();
  for (let p of textParticles) {
    // Move particles along z-axis
    p.z += p.vz * (1 + intensity/100);
    p.x += p.vx;
    p.y += p.vy;
    
    // Reset particles that go out of view
    if (p.z > 500) {
      Object.assign(p, createTextParticle());
      p.z = -1500;
    }
    
    // Draw text
    push();
    translate(p.x, p.y, p.z);
    
    // Face text toward camera
    rotateY(atan2(-p.x, -p.z));
    rotateX(atan2(p.y, -p.z));
    
    // Adjust size based on z position for perspective effect
    let distance = map(p.z, -1500, 500, 0.5, 2);
    let pSize = p.size * distance;
    
    // Calculate opacity with distance falloff
    let pOpacity = p.opacity * map(abs(p.z), 0, 1500, 1, 0.1);
    
    fill((p.hue + hueShift) % 360, 70, 90, pOpacity);
    textSize(pSize);
    text(p.text, 0, 0);
    pop();
  }
  pop();
}

function drawFrequencySpectrum(dataArray) {
  push();
  translate(0, height/3, 0);
  rotateX(PI/2);
  
  noFill();
  strokeWeight(2);
  
  // Draw circular spectrum
  let radius = 200;
  let segments = 180;
  
  beginShape();
  for (let i = 0; i < segments; i++) {
    let angle = map(i, 0, segments, 0, TWO_PI);
    let index = floor(map(i, 0, segments, 0, dataArray.length));
    let r = radius + map(dataArray[index], 0, 255, 0, 100);
    
    // Get color from spectrum
    stroke((i + hueShift) % 360, 80, 90, 0.7);
    
    let x = r * cos(angle);
    let y = r * sin(angle);
    vertex(x, y, 0);
  }
  endShape(CLOSE);
  
  pop();
}

function getAverageVolume(dataArray, start, end) {
  let sum = 0;
  
  // Ensure indices are within bounds
  start = constrain(start, 0, dataArray.length - 1);
  end = constrain(end, 0, dataArray.length - 1);
  
  for (let i = start; i <= end; i++) {
    sum += dataArray[i];
  }
  
  return sum / (end - start + 1);
}

// Alien mode visualization functions
function drawStarfield() {
  push();
  stroke(200, 30, 100, 0.5);
  strokeWeight(1);
  
  // Draw distant stars
  for (let i = 0; i < 500; i++) {
    let x = random(-width, width);
    let y = random(-height, height);
    let z = random(-1000, -500);
    
    point(x, y, z);
  }
  
  // Draw nebula-like clouds
  noFill();
  for (let i = 0; i < 5; i++) {
    let nebHue = (frameCount * 0.2 + i * 30) % 360;
    stroke(nebHue, 70, 70, 0.1);
    strokeWeight(20);
    
    beginShape();
    for (let j = 0; j < 10; j++) {
      let angle = j / 10 * TWO_PI;
      let rad = 2000 + sin(frameCount * 0.01 + i) * 500;
      let x = cos(angle) * rad;
      let y = sin(angle) * rad;
      let z = -2000 + sin(frameCount * 0.005 + i * 100) * 500;
      curveVertex(x, y, z);
    }
    endShape(CLOSE);
  }
  pop();
}

function drawAlienStructures(intensity) {
  push();
  
  for (let structure of alienStructures) {
    push();
    translate(structure.x, structure.y, structure.z);
    
    // Rotate based on individual rotation speed
    rotateX(structure.rotation);
    rotateY(structure.rotation * 0.7);
    rotateZ(frameCount * structure.rotSpeed);
    
    // Update rotation
    structure.rotation += structure.rotSpeed * (1 + intensity/150);
    
    // Scale with audio intensity and breathing effect
    let breathe = sin(frameCount * 0.05) * 0.2 + 1;
    let currentScale = structure.scale * (1 + intensity/100) * breathe;
    scale(currentScale);
    
    // Draw alien geometry based on complexity
    noFill();
    strokeWeight(2);
    
    // Base color with audio-reactive hue shift
    let structHue = (structure.hue + hueShift * 2) % 360;
    
    // Draw layers of geometry with different colors
    for (let layer = 0; layer < 3; layer++) {
      let layerScale = 1 - layer * 0.1;
      let layerOpacity = map(layer, 0, 2, 0.8, 0.3);
      
      stroke(structHue + layer * 30, 80, 90, layerOpacity);
      
      // Different geometries based on complexity
      if (structure.complexity % 3 === 0) {
        // Dodecahedron-like structure
        beginShape();
        for (let a = 0; a < TWO_PI; a += TWO_PI / 10) {
          let r1 = 30 * layerScale;
          let r2 = 50 * layerScale;
          
          for (let b = 0; b < TWO_PI; b += TWO_PI / 5) {
            let x = cos(a) * (r1 + cos(b) * r2);
            let y = sin(a) * (r1 + cos(b) * r2);
            let z = sin(b) * r2;
            vertex(x, y, z);
          }
        }
        endShape(CLOSE);
      } else if (structure.complexity % 3 === 1) {
        // Crystalline structure
        beginShape(TRIANGLES);
        for (let i = 0; i < structure.complexity * 2; i++) {
          let theta1 = i * TWO_PI / (structure.complexity * 2);
          let theta2 = (i + 1) * TWO_PI / (structure.complexity * 2);
          
          let x1 = cos(theta1) * 50 * layerScale;
          let y1 = sin(theta1) * 50 * layerScale;
          let z1 = 30 * layerScale;
          
          let x2 = cos(theta2) * 50 * layerScale;
          let y2 = sin(theta2) * 50 * layerScale;
          let z2 = 30 * layerScale;
          
          vertex(0, 0, -50 * layerScale);
          vertex(x1, y1, z1);
          vertex(x2, y2, z2);
          
          vertex(0, 0, 50 * layerScale);
          vertex(x1, y1, -z1);
          vertex(x2, y2, -z2);
        }
        endShape();
      } else {
        // Toroidal structure
        for (let i = 0; i < structure.complexity; i++) {
          rotateX(PI / structure.complexity);
          torus(40 * layerScale, 10 * layerScale, 16, 6);
        }
      }
    }
    
    // Add glowing effect when audio intensity is high
    if (intensity > 100) {
      fill(structHue, 100, 100, map(intensity, 100, 200, 0.05, 0.2));
      sphere(60 * currentScale);
    }
    
    pop();
  }
  
  pop();
}

function drawDataChannels(intensity) {
  push();
  noStroke();
  
  for (let channel of dataChannels) {
    push();
    translate(channel.x, channel.y, channel.z);
    
    // Move channel towards center of screen
    channel.z += channel.speed * (1 + intensity/150);
    
    // Reset if too close
    if (channel.z > 500) {
      channel.z = -800;
      channel.x = random(-width, width);
      channel.y = random(-height, height);
      channel.symbols = []; // Clear symbols
    }
    
    // Generate new symbols based on density
    if (random() < channel.density * (1 + intensity/200)) {
      channel.symbols.push({
        char: random(['0', '1', '/', '\\', '
, '#', '%', '&', '*', '?', '!', '>', '<']),
        x: random(-channel.width/2, channel.width/2),
        y: -channel.height/2,
        size: random(10, 20),
        opacity: 1,
        hue: (channel.hue + random(-20, 20) + hueShift) % 360
      });
    }
    
    // Update and draw symbols
    for (let i = channel.symbols.length - 1; i >= 0; i--) {
      let symbol = channel.symbols[i];
      
      // Move symbol down channel
      symbol.y += 5 * (1 + intensity/200);
      symbol.opacity -= 0.01;
      
      // Remove faded symbols
      if (symbol.opacity <= 0 || symbol.y > channel.height/2) {
        channel.symbols.splice(i, 1);
        continue;
      }
      
      // Draw symbol
      fill(symbol.hue, 80, 90, symbol.opacity);
      textSize(symbol.size);
      text(symbol.char, symbol.x, symbol.y);
    }
    
    // Draw channel boundaries with glow
    noFill();
    strokeWeight(1);
    stroke(channel.hue, 80, 90, 0.3);
    rect(-channel.width/2, -channel.height/2, channel.width, channel.height);
    
    pop();
  }
  
  pop();
}

function drawCyberOrbs(intensity) {
  push();
  
  for (let orb of cyberOrbs) {
    // Calculate position
    orb.angle += orb.speed * (1 + intensity/200);
    
    let x = cos(orb.angle) * orb.radius;
    let y = sin(orb.elevation) * orb.radius;
    let z = sin(orb.angle) * orb.radius;
    
    push();
    translate(x, y, z);
    
    // Pulse with bass
    let pulseFactor = 1 + sin(frameCount * orb.pulseRate) * 0.3 * pulseIntensity;
    let orbSize = orb.size * pulseFactor;
    
    // Create glowing orb
    for (let i = 0; i < 4; i++) {
      let layerSize = orbSize * (1 - i * 0.1);
      let layerOpacity = map(i, 0, 3, 0.8, 0.1);
      
      fill((orb.hue + hueShift) % 360, 90, 90, layerOpacity);
      noStroke();
      sphere(layerSize);
    }
    
    // Add energy lines when audio is intense
    if (intensity > 80) {
      stroke((orb.hue + 180) % 360, 90, 90, map(intensity, 80, 200, 0.1, 0.5));
      strokeWeight(1);
      
      let lineLength = map(intensity, 80, 200, orb.size, orb.size * 5);
      
      for (let i = 0; i < 8; i++) {
        let angle = i * PI/4;
        let lineX = cos(angle) * lineLength;
        let lineY = sin(angle) * lineLength;
        line(0, 0, 0, lineX, lineY, 0);
      }
    }
    
    pop();
  }
  
  pop();
}

function drawAlienInterface(dataArray) {
  push();
  // Position the interface to follow the camera
  translate(0, 100, 200);
  rotateX(-PI/6);
  
  // Container
  noFill();
  stroke(140, 90, 90, 0.7);
  strokeWeight(2);
  rect(-300, -100, 600, 200, 10);
  
  // Draw audio waveform along the interface
  beginShape();
  noFill();
  stroke(140, 90, 90, 0.8);
  strokeWeight(1);
  
  for (let i = 0; i < 60; i++) {
    let index = floor(map(i, 0, 60, 0, dataArray.length - 1));
    let x = map(i, 0, 60, -290, 290);
    let y = map(dataArray[index], 0, 255, 50, -50);
    vertex(x, y);
  }
  endShape();
  
  // Draw frequency indicators
  for (let i = 0; i < 5; i++) {
    let x = map(i, 0, 4, -250, 250);
    let index = floor(map(i, 0, 4, 0, dataArray.length - 1));
    let intensity = map(dataArray[index], 0, 255, 0, 80);
    
    fill(i * 60, 90, 90, 0.7);
    rect(x - 20, 60, 40, -intensity);
    
    fill(i * 60, 90, 90, 0.9);
    textSize(10);
    text("FREQ-" + i, x, 80);
  }
  
  // Add some alien text
  fill(140, 90, 90, 0.8);
  textSize(14);
  text("ALIEN TRANSMISSION INTERCEPTED", 0, -80);
  
  // Cybernetic indicators - making it look like an alien dashboard
  for (let i = 0; i < 4; i++) {
    let x = map(i, 0, 3, -280, 280);
    fill((frameCount + i * 90) % 360, 90, 90, 0.5 + sin(frameCount * 0.05 + i) * 0.5);
    ellipse(x, -60, 10, 10);
  }
  
  pop();
}