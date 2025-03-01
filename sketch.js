// Audio reactive visualization with cyborg witch elf Lulu
let mic;
let fft;
let audioStarted = false;

// Particle system
let particles = [];
let particleCount = 120;

// Bounds for movement
let bounds = {
  x: 0,
  y: 0,
  z: 0,
  width: 800,
  height: 600,
  depth: 500
};

// Lulu (our cyborg witch elf)
let lulu = {
  x: 0,
  y: 0,
  z: 150,
  radius: 50,
  rotation: 0,
  thoughtText: "",
  thoughtTimer: 0,
  eyeSize: 8,
  mouthCurve: 0.5,
  energyLevel: 0,
  targetX: 0,
  targetY: 0,
  targetZ: 150,
  movementSpeed: 0.05
};

// Wave circles that respond to audio
let waveCircles = [];

// Cybernetic aura particles
let auraParticles = [];

// Fairies that orbit around Lulu
let fairies = [];
let fairyCount = 8;

// Familiar crystal companion
let familiar = {
  x: 80,
  y: 30,
  z: 180,
  size: 15,
  floatPhase: 0,
  floatSpeed: 0.05
};

// Digital thoughts for Lulu
const thoughts = [
  "1011010101...",
  "COMPUTING...",
  "SIGNAL DETECTED",
  "NEW PATTERN",
  "ANALYZING WAVES",
  "FREQUENCY SHIFT",
  "CYBERNETIC SPELL",
  "SYNTHESIZING...",
  "DIGITAL ALCHEMY",
  "RECALIBRATING",
  "QUANTUM WEAVE",
  "CODE ENCHANTMENT"
];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
  
  // Update bounds based on canvas size
  updateBounds();
  
  // Setup audio analyzer
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 1024);
  
  // Create particle system
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  // Create initial aura particles
  for (let i = 0; i < 20; i++) {
    auraParticles.push(createAuraParticle());
  }
  
  // Create fairies
  for (let i = 0; i < fairyCount; i++) {
    fairies.push(new Fairy());
  }
  
  // Find new target for Lulu
  findNewTarget();
  
  // Setup start button click handler
  document.getElementById('startButton').addEventListener('click', startAudio);
}

function updateBounds() {
  bounds = {
    x: -width/3,
    y: -height/3,
    z: -300,
    width: width*2/3,
    height: height*2/3,
    depth: 600
  };
}

function createAuraParticle() {
  return {
    angle: random(TWO_PI),
    distance: random(70, 100),
    size: random(3, 8),
    speed: random(0.01, 0.03),
    color: color(random(220, 320), 80, 90, 0.8)
  };
}

function startAudio() {
  if (audioStarted) return;
  
  // Start the audio input
  userStartAudio();
  mic.start();
  fft.setInput(mic);
  audioStarted = true;
  
  // Hide the start button
  document.getElementById('startButton').style.display = 'none';
}

function findNewTarget() {
  // Find a new random location for Lulu within bounds
  lulu.targetX = random(bounds.x, bounds.x + bounds.width);
  lulu.targetY = random(bounds.y, bounds.y + bounds.height);
  lulu.targetZ = random(bounds.z + 200, bounds.z + bounds.depth - 100);
  
  // Set movement speed based on distance
  const dist = sqrt(
    pow(lulu.targetX - lulu.x, 2) + 
    pow(lulu.targetY - lulu.y, 2) + 
    pow(lulu.targetZ - lulu.z, 2)
  );
  
  // Faster movement for longer distances
  lulu.movementSpeed = map(dist, 0, 500, 0.02, 0.05);
}

function draw() {
  // Dark space background
  background(230, 50, 10, 0.2);
  
  // Subtle digital grid effect
  drawGrid();
  
  if (audioStarted) {
    // Analyze the audio
    fft.analyze();
    
    // Get different frequency ranges
    const bass = fft.getEnergy("bass");
    const mid = fft.getEnergy("mid");
    const high = fft.getEnergy("treble");
    
    // Save overall energy level
    lulu.energyLevel = (bass + mid + high) / 300;
    
    // Update based on audio
    updateWithAudio(bass, mid, high);
  }
  
  // Update particle system
  for (let particle of particles) {
    particle.update(lulu.energyLevel);
    particle.display();
  }
  
  // Update everything
  updateWaveCircles();
  updateLulu();
  updateAura();
  updateFamiliar();
  
  // Update fairies
  for (let fairy of fairies) {
    fairy.update(lulu.energyLevel);
  }
  
  // Draw everything
  drawWaveCircles();
  drawLulu();
  drawAura();
  
  // Draw fairies
  for (let fairy of fairies) {
    fairy.display();
  }
  
  drawFamiliar();
}

function drawGrid() {
  push();
  stroke(280, 50, 80, 0.1);
  strokeWeight(0.5);
  
  // Draw boundary box (for debugging if needed)
  // noFill();
  // stroke(255, 0, 0, 0.3);
  // box(bounds.width, bounds.height, bounds.depth);
  
  // Draw regular grid
  stroke(280, 50, 80, 0.1);
  for (let x = -width/2; x < width/2; x += 50) {
    line(x, -height/2, x, height/2);
  }
  for (let y = -height/2; y < height/2; y += 50) {
    line(-width/2, y, width/2, y);
  }
  pop();
}

function updateWithAudio(bass, mid, high) {
  // Create wave circles based on bass hits
  if (bass > 200 && frameCount % 5 === 0) {
    createWaveCircle(bass);
  }
  
  // Affect Lulu's appearance based on audio
  lulu.eyeSize = 8 + map(high, 0, 255, 0, 6);
  lulu.mouthCurve = 0.5 + map(mid, 0, 255, 0, 0.5);
  lulu.rotation += map(mid, 0, 255, 0.01, 0.05);
  
  // Occasionally generate thoughts based on sound
  if (random() < map(high, 0, 255, 0.001, 0.02) && lulu.thoughtTimer <= 0) {
    lulu.thoughtText = random(thoughts);
    lulu.thoughtTimer = 120;
  }
  
  // Affect aura based on mid frequencies
  if (mid > 200) {
    for (let p of auraParticles) {
      p.size = random(5, 12);
      p.speed = random(0.01, 0.05);
    }
  }
  
  // Add sparkles based on high frequencies
  if (high > 220 && frameCount % 10 === 0) {
    for (let i = 0; i < 3; i++) {
      auraParticles.push({
        angle: random(TWO_PI),
        distance: random(60, 100),
        size: random(2, 5),
        speed: random(0.03, 0.08),
        color: color(random(0, 60), 80, 100, 0.9)
      });
    }
  }
  
  // Keep aura particle count manageable
  if (auraParticles.length > 50) {
    auraParticles.splice(0, auraParticles.length - 50);
  }
  
  // High energy might trigger Lulu to find a new location
  if (lulu.energyLevel > 0.7 && frameCount % 180 === 0) {
    findNewTarget();
  }
}

function createWaveCircle(intensity) {
  let hue = random(160, 320);
  let intensityNorm = map(intensity, 0, 255, 0, 1);
  
  waveCircles.push({
    radius: 20,
    speed: 2 + intensityNorm * 3,
    opacity: 0.8,
    color: color(hue, 80, 90, 0.6),
    thickness: 2 + intensityNorm * 4,
    wobble: intensityNorm * 0.2
  });
}

function updateWaveCircles() {
  for (let i = waveCircles.length - 1; i >= 0; i--) {
    let wave = waveCircles[i];
    wave.radius += wave.speed;
    wave.opacity -= 0.01;
    
    if (wave.opacity <= 0) {
      waveCircles.splice(i, 1);
    }
  }
}

function updateLulu() {
  // Move Lulu toward target position
  lulu.x += (lulu.targetX - lulu.x) * lulu.movementSpeed;
  lulu.y += (lulu.targetY - lulu.y) * lulu.movementSpeed;
  lulu.z += (lulu.targetZ - lulu.z) * lulu.movementSpeed;
  
  // Check if Lulu has arrived at target
  let distToTarget = dist(lulu.x, lulu.y, lulu.z, lulu.targetX, lulu.targetY, lulu.targetZ);
  if (distToTarget < 10 && random() < 0.01) {
    findNewTarget();
  }
  
  // Decrease thought timer
  if (lulu.thoughtTimer > 0) {
    lulu.thoughtTimer--;
  }
  
  // Occasionally generate new thoughts
  if (lulu.thoughtTimer <= 0 && random() < 0.005) {
    lulu.thoughtText = random(thoughts);
    lulu.thoughtTimer = 120;
  }
}

function updateAura() {
  for (let p of auraParticles) {
    p.angle += p.speed;
  }
}

function updateFamiliar() {
  familiar.floatPhase += familiar.floatSpeed;
  
  // Update familiar position relative to Lulu
  familiar.x = 80 * cos(familiar.floatPhase * 0.3);
  familiar.y = 30 + sin(familiar.floatPhase) * 10;
  familiar.z = 180 + sin(familiar.floatPhase * 0.2) * 20;
}

function drawWaveCircles() {
  push();
  noFill();
  for (let wave of waveCircles) {
    stroke(wave.color);
    strokeWeight(wave.thickness);
    
    beginShape();
    for (let i = 0; i < TWO_PI; i += 0.1) {
      let r = wave.radius + sin(i * 8 + frameCount * 0.1) * wave.wobble * wave.radius;
      let x = r * cos(i);
      let y = r * sin(i);
      vertex(x, y, 0);
    }
    endShape(CLOSE);
  }
  pop();
}

function drawLulu() {
  push();
  translate(lulu.x, lulu.y, lulu.z);
  
  // Add some bobbing and rotation based on energy level
  rotateY(lulu.rotation);
  rotateX(sin(frameCount * 0.05) * 0.1);
  
  // Draw magic circle underneath
  push();
  rotateX(PI/2);
  noFill();
  stroke(290, 80, 90, 0.3 + lulu.energyLevel * 0.2);
  strokeWeight(2);
  circle(0, 0, lulu.radius * 2.2);
  
  // Inner circle
  stroke(320, 90, 90, 0.2 + lulu.energyLevel * 0.3);
  circle(0, 0, lulu.radius * 1.6);
  pop();
  
  // Main head with color affected by energy
  noStroke();
  fill(280 + lulu.energyLevel * 40, 80, 90);
  sphere(lulu.radius);
  
  // Magical ring around head
  push();
  rotateX(PI/2 + sin(frameCount * 0.02) * 0.2);
  rotateZ(frameCount * 0.01);
  noFill();
  strokeWeight(2);
  stroke(50, 90, 90, 0.7);
  torus(60, 4, 24, 12);
  pop();
  
  // Cybernetic details
  push();
  fill(220, 90, 80);
  // Ear implants
  translate(-lulu.radius * 0.8, 0, 0);
  box(10, 15, 5);
  translate(lulu.radius * 1.6, 0, 0);
  box(10, 15, 5);
  // Circuit lines
  translate(-lulu.radius * 0.8, -lulu.radius * 0.5, lulu.radius * 0.7);
  rotateY(PI/4);
  box(lulu.radius * 1.2, 2, 2);
  pop();
  
  // Eyes that glow with energy
  fill(0);
  push();
  translate(-15, -10, lulu.radius - 1);
  ellipse(0, 0, lulu.eyeSize, lulu.eyeSize * 1.5);
  pop();
  
  push();
  translate(15, -10, lulu.radius - 1);
  ellipse(0, 0, lulu.eyeSize, lulu.eyeSize * 1.5);
  pop();
  
  // Digital glow in eyes - pulses with energy
  fill(180 - lulu.energyLevel * 30, 100, 100);
  push();
  translate(-15, -10, lulu.radius);
  ellipse(0, 0, lulu.eyeSize * 0.5 + lulu.energyLevel * 2, lulu.eyeSize * 0.5 + lulu.energyLevel * 2);
  pop();
  
  push();
  translate(15, -10, lulu.radius);
  ellipse(0, 0, lulu.eyeSize * 0.5 + lulu.energyLevel * 2, lulu.eyeSize * 0.5 + lulu.energyLevel * 2);
  pop();
  
  // Mouth that reacts to energy
  push();
  translate(0, 15, lulu.radius - 1);
  fill(0);
  arc(0, 0, 20, 15 * lulu.mouthCurve, 0, PI);
  pop();
  
  // Witch hat
  push();
  translate(0, -lulu.radius - 15, 0);
  fill(280, 70, 30);
  rotateX(PI/12);
  
  // Hat base
  push();
  cylinder(lulu.radius * 0.8, 5);
  pop();
  
  // Hat cone
  push();
  translate(0, -20, 0);
  cone(lulu.radius * 0.5, 40);
  pop();
  
  // Magic runes on hat - glow with energy
  push();
  translate(0, -30, 12);
  fill(30 + lulu.energyLevel * 20, 100, 100, 0.7 + lulu.energyLevel * 0.3);
  rotateX(PI/2);
  textSize(14 + lulu.energyLevel * 4);
  text("✧", 0, 0);
  pop();
  pop();
  
  // Thought bubble
  if (lulu.thoughtTimer > 0) {
    push();
    translate(lulu.radius * 1.2, -lulu.radius * 1.2, 0);
    
    // Bubble with pulsing glow
    fill(255, 255, 255, 80 + sin(frameCount * 0.1) * 20);
    ellipse(0, 0, 100, 50);
    
    // Text that glows with energy
    fill(100 + lulu.energyLevel * 50, 255, 100 + lulu.energyLevel * 100);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(lulu.thoughtText, 0, 0);
    pop();
  }
  
  pop();
}

function drawAura() {
  push();
  translate(lulu.x, lulu.y, lulu.z);
  
  for (let p of auraParticles) {
    let x = cos(p.angle) * p.distance;
    let y = sin(p.angle) * p.distance;
    let z = sin(p.angle * 2) * 20;
    
    push();
    translate(x, y, z);
    noStroke();
    fill(p.color);
    sphere(p.size);
    pop();
  }
  pop();
}

function drawFamiliar() {
  push();
  translate(lulu.x + familiar.x, lulu.y + familiar.y, lulu.z + familiar.z);
  
  // Small crystal familiar that pulses with the beat
  fill(120, 90, 90, 0.8);
  
  // Rotate to make it sparkle
  rotateX(frameCount * 0.05);
  rotateY(frameCount * 0.07);
  
  // Scale with energy
  const scale = 1 + lulu.energyLevel * 0.3;
  
  // Crystal shape
  beginShape();
  vertex(0, -familiar.size * scale, 0);
  vertex(familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, familiar.size * 0.7 * scale);
  vertex(-familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, familiar.size * 0.7 * scale);
  vertex(0, -familiar.size * scale, 0);
  
  vertex(0, -familiar.size * scale, 0);
  vertex(familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, -familiar.size * 0.7 * scale);
  vertex(-familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, -familiar.size * 0.7 * scale);
  vertex(0, -familiar.size * scale, 0);
  
  vertex(familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, familiar.size * 0.7 * scale);
  vertex(0, familiar.size * scale, 0);
  vertex(-familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, familiar.size * 0.7 * scale);
  
  vertex(familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, -familiar.size * 0.7 * scale);
  vertex(0, familiar.size * scale, 0);
  vertex(-familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, -familiar.size * 0.7 * scale);
  
  vertex(familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, familiar.size * 0.7 * scale);
  vertex(0, familiar.size * scale, 0);
  vertex(familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, -familiar.size * 0.7 * scale);
  
  vertex(-familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, familiar.size * 0.7 * scale);
  vertex(0, familiar.size * scale, 0);
  vertex(-familiar.size * 0.7 * scale, familiar.size * 0.3 * scale, -familiar.size * 0.7 * scale);
  endShape(CLOSE);
  
  // Glow effect that pulses with energy
  fill(120 + lulu.energyLevel * 30, 90, 100, 0.3 + lulu.energyLevel * 0.2);
  sphere(familiar.size * 1.2 * (1 + lulu.energyLevel * 0.2));
  
  pop();
}

class Particle {
  constructor() {
    this.reset();
  }
  
  reset() {
    // Random position within bounds
    this.pos = createVector(
      random(bounds.x, bounds.x + bounds.width),
      random(bounds.y, bounds.y + bounds.height),
      random(bounds.z, bounds.z + bounds.depth)
    );
    
    // Random velocity
    this.vel = p5.Vector.random3D().mult(random(0.2, 1.5));
    
    // Appearance
    this.size = random(1, 4);
    this.hue = random(180, 360);
    this.opacity = random(0.1, 0.6);
  }
  
  update(energyLevel) {
    // Update position
    this.pos.add(this.vel);
    
    // Check bounds and bounce
    if (this.pos.x < bounds.x || this.pos.x > bounds.x + bounds.width) {
      this.vel.x *= -1;
      this.pos.x = constrain(this.pos.x, bounds.x, bounds.x + bounds.width);
    }
    
    if (this.pos.y < bounds.y || this.pos.y > bounds.y + bounds.height) {
      this.vel.y *= -1;
      this.pos.y = constrain(this.pos.y, bounds.y, bounds.y + bounds.height);
    }
    
    if (this.pos.z < bounds.z || this.pos.z > bounds.z + bounds.depth) {
      this.vel.z *= -1;
      this.pos.z = constrain(this.pos.z, bounds.z, bounds.z + bounds.depth);
    }
    
    // Get slightly attracted to Lulu
    let distToLulu = dist(this.pos.x, this.pos.y, this.pos.z, lulu.x, lulu.y, lulu.z);
    if (distToLulu < 300) {
      let force = map(distToLulu, 0, 300, 0.01, 0);
      this.vel.x += (lulu.x - this.pos.x) * force;
      this.vel.y += (lulu.y - this.pos.y) * force;
      this.vel.z += (lulu.z - this.pos.z) * force;
    }
    
    // Add some energy-based velocity changes
    this.vel.mult(1 + energyLevel * 0.01);
    
    // Limit velocity
    this.vel.limit(2 + energyLevel * 3);
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    fill(this.hue, 80, 90, this.opacity);
    sphere(this.size);
    pop();
  }
}

class Fairy {
  constructor() {
    this.reset();
    this.pos = createVector(0, 0, 0);
  }
  
  reset() {
    this.vel = p5.Vector.random3D().mult(1);
    this.size = random(2, 6);
    this.hue = random(280, 330);
    this.lifespan = 255;
    this.maxLife = random(100, 200);
  }
  
  update(audioLevel) {
    // Attracted to Lulu
    this.vel.x += (lulu.x - this.pos.x) * 0.03;
    this.vel.y += (lulu.y - this.pos.y) * 0.03;
    this.vel.z += (lulu.z - this.pos.z) * 0.03;
    
    // Random movement
    this.vel.x += random(-0.1, 0.1);
    this.vel.y += random(-0.1, 0.1);
    this.vel.z += random(-0.05, 0.05);
    
    // Limit velocity but respond to audio level
    this.vel.limit(2 + audioLevel * 2);
    
    this.pos.add(this.vel);
    
    this.lifespan -= 1.5;
    
    if (this.lifespan < 0) {
      this.reset();
      this.pos.x = lulu.x + random(-80, 80);
      this.pos.y = lulu.y + random(-80, 80);
      this.pos.z = lulu.z + random(-40, 80);
    }
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    
    noStroke();
    
    // Outer glow
    fill(this.hue, 80, 90, this.lifespan/600);
    ellipse(0, 0, this.size * 4);
    
    // Brighter center
    fill(this.hue, 40, 100, this.lifespan/255);
    ellipse(0, 0, this.size);
    
    // Brightest core
    fill(60, 100, 100, this.lifespan/255);
    ellipse(0, 0, this.size/2);
    
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateBounds();
}