let audioContext;
let analyser;
let dataArray;
let source;
let myFont;
let fairies = [];
let fairyCount = 8;

// Position and movement variables
let blueCircle = { x: 0, y: 0, z: -150, vx: 1.2, vy: 0.8, vz: 0.3, radius: 0, active: false, spawnTime: 0 };
let purpleCircle = { x: 0, y: 0, z: -100, vx: -0.9, vy: 1.1, vz: -0.2, radius: 0, active: false, spawnTime: 0 };
let greenCircle = { x: 0, y: 0, z: -50, vx: 0.7, vy: -1.0, vz: 0.4, radius: 0, active: false, spawnTime: 0 };
let luluSphere = { x: 0, y: 0, z: 150, vx: 0, vy: 0, vz: 0, radius: 0, active: true };

// Ocean friends!
let cosmicFish = { x: 0, y: 0, z: 50, vx: 1.5, vy: -0.7, vz: 0.2, size: 0, active: false, spawnTime: 0 };
let alienShip = { x: 0, y: 0, z: -200, vx: -0.8, vy: 0.5, vz: 0.4, size: 0, beamOn: false, beamTime: 0, active: false, spawnTime: 0 };

// Track time
let luluSpawnTimer = 0;
let luluSpawnInterval = 180;
let globalTimer = 0;

// Ocean background elements
let bubbles = [];
let seaweedPatches = [];
let jellyfishCount = 3;
let jellyfishes = [];

function preload() {
  myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
}

function startAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            
            for (let i = 0; i < fairyCount; i++) {
                fairies.push(new Fairy());
            }
            
            // Create ocean elements
            createOceanElements();
            
            // Start with just Lulu active
            repositionLulu();
            luluSphere.active = true;
            
            // Stagger appearances
            setTimeout(() => { randomlySpawnEntity(blueCircle); }, random(2000, 5000));
            setTimeout(() => { randomlySpawnEntity(purpleCircle); }, random(3000, 7000));
            setTimeout(() => { randomlySpawnEntity(greenCircle); }, random(4000, 9000));
            setTimeout(() => { randomlySpawnEntity(cosmicFish); }, random(6000, 10000));
            setTimeout(() => { randomlySpawnEntity(alienShip); }, random(8000, 15000));
        })
        .catch(err => {
            console.error('Error accessing audio interface:', err);
        });
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    textFont(myFont);
    colorMode(HSB, 360, 100, 100, 1);
}

function draw() {
    // Vibrant blue underwater background
    background(190, 70, 90, 0.2);
    
    if (!analyser) {
        push();
        textSize(18);
        textAlign(CENTER);
        fill(360, 0, 100);
        text("Click 'Start Audio Input' to begin", 0, 0);
        pop();
        return;
    }
    
    globalTimer++;
    
    analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    let avgFrequency = sum / dataArray.length;
    
    let audioFactor = map(avgFrequency, 0, 255, 1, 2);
    
    let waveform = [];
    for (let i = 0; i < dataArray.length; i++) {
        waveform[i] = map(dataArray[i], 0, 255, -1, 1);
    }
    
    // Draw underwater ambience
    drawOceanBackground(waveform, avgFrequency);
    
    // Random spawning logic
    manageEntityLifecycles(avgFrequency);
    
    updatePhysics(audioFactor);
    
    // Update sizes
    blueCircle.radius = min(windowHeight * 0.25, windowWidth * 0.25);
    purpleCircle.radius = min(windowHeight * 0.15, windowWidth * 0.15);
    greenCircle.radius = min(windowHeight * 0.08, windowWidth * 0.08);
    luluSphere.radius = map(avgFrequency, 0, 255, 30, 60);
    cosmicFish.size = map(dataArray[20], 0, 255, 40, 80);
    alienShip.size = map(dataArray[150], 0, 255, 30, 60);
    
    // Alien tractor beam effect
    alienShip.beamTime++;
    if (alienShip.beamTime > 180) {
        alienShip.beamOn = !alienShip.beamOn;
        alienShip.beamTime = 0;
    }
    
    // Draw entities only if active
    if (luluSphere.active) drawLulu(waveform, avgFrequency);
    if (blueCircle.active) drawBlueCircle(waveform);
    if (purpleCircle.active) drawPurpleCircle(waveform);
    if (greenCircle.active) drawGreenCircle(waveform);
    if (cosmicFish.active) drawCosmicFish(waveform, avgFrequency);
    if (alienShip.active) drawAlienShip(waveform, avgFrequency);
}

function createOceanElements() {
    // Create bubbles
    for (let i = 0; i < 50; i++) {
        bubbles.push({
            x: random(-width/2, width/2),
            y: random(-height/2, height/2),
            z: random(-300, 300),
            size: random(3, 12),
            speed: random(0.2, 1),
            wobble: random(0.01, 0.05)
        });
    }
    
    // Create seaweed patches
    for (let i = 0; i < 8; i++) {
        let patchX = random(-width/2 * 0.8, width/2 * 0.8);
        let patchZ = random(-300, 300);
        let patchSize = random(30, 80);
        let seaweedCount = floor(random(3, 8));
        
        let seaweeds = [];
        for (let j = 0; j < seaweedCount; j++) {
            seaweeds.push({
                x: patchX + random(-patchSize/2, patchSize/2),
                z: patchZ + random(-patchSize/2, patchSize/2),
                height: random(50, 150),
                segments: floor(random(5, 10)),
                phase: random(TWO_PI),
                speed: random(0.02, 0.05)
            });
        }
        
        seaweedPatches.push(seaweeds);
    }
    
    // Create jellyfish
    for (let i = 0; i < jellyfishCount; i++) {
        jellyfishes.push({
            x: random(-width/2 * 0.7, width/2 * 0.7),
            y: random(-height/2 * 0.7, -200),
            z: random(-200, 200),
            size: random(30, 60),
            tentacles: floor(random(5, 12)),
            phase: random(TWO_PI),
            pulseSpeed: random(0.03, 0.06),
            vx: random(-0.3, 0.3),
            vy: random(0.1, 0.4),
            vz: random(-0.3, 0.3)
        });
    }
}

function drawOceanBackground(waveform, avgFrequency) {
    // Draw water wave effect at the top
    push();
    translate(0, -height/2 + 100, -300);
    noFill();
    stroke(195, 70, 100, 0.3);
    strokeWeight(2);
    
    beginShape();
    for (let i = -width/2; i < width/2; i += 20) {
        let waveIndex = floor(map(i, -width/2, width/2, 0, waveform.length - 1));
        let y = waveform[waveIndex] * 20 + sin(i * 0.01 + frameCount * 0.02) * 10;
        vertex(i, y, 0);
    }
    endShape();
    pop();
    
    // Draw bubbles
    for (let bubble of bubbles) {
        push();
        translate(bubble.x, bubble.y, bubble.z);
        
        // Move bubbles upward
        bubble.y -= bubble.speed * (1 + avgFrequency / 200);
        bubble.x += sin(frameCount * bubble.wobble) * 0.5;
        
        // Reset if bubble goes out of view
        if (bubble.y < -height/2 - 50) {
            bubble.y = height/2 + 50;
            bubble.x = random(-width/2, width/2);
        }
        
        // Draw bubble
        noStroke();
        fill(195, 20, 100, 0.3);
        sphere(bubble.size);
        
        // Highlight
        push();
        translate(bubble.size * 0.3, -bubble.size * 0.3, bubble.size * 0.5);
        fill(195, 10, 100, 0.6);
        sphere(bubble.size * 0.2);
        pop();
        
        pop();
    }
    
    // Draw seaweed
    for (let patch of seaweedPatches) {
        for (let weed of patch) {
            push();
            translate(weed.x, height/2 - weed.height/2, weed.z);
            
            noStroke();
            
            // Base of seaweed
            fill(140, 80, 40, 0.7);
            
            let segmentHeight = weed.height / weed.segments;
            let segmentWidth = map(weed.height, 50, 150, 8, 15);
            
            for (let i = 0; i < weed.segments; i++) {
                let yOffset = i * segmentHeight - weed.height/2;
                let swayAmount = map(i, 0, weed.segments, 0, 30);
                let xOffset = sin(frameCount * weed.speed + weed.phase) * swayAmount;
                
                push();
                translate(xOffset, yOffset, 0);
                
                // Gradually thinner toward the top
                let segmentScale = map(i, 0, weed.segments, 1, 0.3);
                
                rotateX(sin(frameCount * weed.speed * 0.5 + i * 0.2) * 0.2);
                
                fill(140, 80 - i * 3, 40 + i * 4, 0.7);
                ellipsoid(segmentWidth * segmentScale, segmentHeight * 0.5, segmentWidth * 0.3 * segmentScale);
                pop();
            }
            
            pop();
        }
    }
    
    // Draw jellyfish
    for (let jelly of jellyfishes) {
        push();
        translate(jelly.x, jelly.y, jelly.z);
        
        // Move jellyfish
        jelly.x += jelly.vx + sin(frameCount * 0.02) * 0.5;
        jelly.y += jelly.vy;
        jelly.z += jelly.vz + cos(frameCount * 0.02) * 0.5;
        
        // Check boundaries
        let bounds = {
            x: width/2 * 0.8,
            y: height/2 * 0.8,
            z: 300
        };
        
        if (abs(jelly.x) > bounds.x) jelly.vx *= -1;
        if (jelly.y > bounds.y) jelly.y = -bounds.y;
        if (abs(jelly.z) > bounds.z) jelly.vz *= -1;
        
        // Pulse animation
        let pulseAmount = (sin(frameCount * jelly.pulseSpeed + jelly.phase) * 0.2 + 0.8);
        
        // Bell
        noStroke();
        fill(230, 70, 90, 0.6);
        push();
        scale(1, pulseAmount, 1);
        ellipsoid(jelly.size * 0.5, jelly.size * 0.7, jelly.size * 0.5);
        pop();
        
        // Glow
        fill(230, 30, 100, 0.2);
        sphere(jelly.size * 0.7);
        
        // Tentacles
        stroke(230, 70, 90, 0.4);
        strokeWeight(2);
        for (let i = 0; i < jelly.tentacles; i++) {
            let angle = map(i, 0, jelly.tentacles, 0, TWO_PI);
            
            beginShape();
            let lastX = 0;
            let lastY = jelly.size * 0.7 * pulseAmount;
            let lastZ = 0;
            
            for (let j = 0; j < 5; j++) {
                let segmentLength = map(j, 0, 5, jelly.size * 0.2, jelly.size * 0.5) * pulseAmount;
                let wobbleAmount = map(j, 0, 5, 5, 15);
                let wobbleX = sin(frameCount * 0.05 + i + j) * wobbleAmount;
                let wobbleZ = cos(frameCount * 0.05 + i + j) * wobbleAmount;
                
                let x = lastX + cos(angle) * wobbleX;
                let y = lastY + segmentLength;
                let z = lastZ + sin(angle) * wobbleZ;
                
                vertex(x, y, z);
                
                lastX = x;
                lastY = y;
                lastZ = z;
            }
            endShape();
        }
        
        pop();
    }
}

function manageEntityLifecycles(avgFrequency) {
    // Lulu's repositioning logic
    luluSpawnTimer++;
    if (luluSpawnTimer > luluSpawnInterval) {
        repositionLulu();
        luluSpawnTimer = 0;
        luluSpawnInterval = map(avgFrequency, 0, 255, 300, 120);
    }
    
    // Handle random entity spawning/despawning
    if (globalTimer % 300 === 0) { // Every ~5 seconds
        // Random chance to toggle entities
        if (random() < 0.3 && !blueCircle.active) randomlySpawnEntity(blueCircle);
        else if (random() < 0.2 && blueCircle.active) despawnEntity(blueCircle);
        
        if (random() < 0.3 && !purpleCircle.active) randomlySpawnEntity(purpleCircle);
        else if (random() < 0.2 && purpleCircle.active) despawnEntity(purpleCircle);
        
        if (random() < 0.3 && !greenCircle.active) randomlySpawnEntity(greenCircle);
        else if (random() < 0.2 && greenCircle.active) despawnEntity(greenCircle);
        
        if (random() < 0.4 && !cosmicFish.active) randomlySpawnEntity(cosmicFish);
        else if (random() < 0.15 && cosmicFish.active) despawnEntity(cosmicFish);
        
        if (random() < 0.25 && !alienShip.active) randomlySpawnEntity(alienShip);
        else if (random() < 0.2 && alienShip.active) despawnEntity(alienShip);
    }
    
    // Check lifetime of spawned entities
    if (blueCircle.active && globalTimer - blueCircle.spawnTime > 900) despawnEntity(blueCircle);
    if (purpleCircle.active && globalTimer - purpleCircle.spawnTime > 1200) despawnEntity(purpleCircle);
    if (greenCircle.active && globalTimer - greenCircle.spawnTime > 1500) despawnEntity(greenCircle);
    if (cosmicFish.active && globalTimer - cosmicFish.spawnTime > 2000) despawnEntity(cosmicFish);
    if (alienShip.active && globalTimer - alienShip.spawnTime > 1800) despawnEntity(alienShip);
}

function randomlySpawnEntity(entity) {
    const margin = 200;
    entity.x = random(-width/2 + margin, width/2 - margin);
    entity.y = random(-height/2 + margin, height/2 - margin);
    
    // Random velocity
    let speed = random(0.5, 2);
    let angle = random(TWO_PI);
    entity.vx = cos(angle) * speed;
    entity.vy = sin(angle) * speed;
    
    entity.active = true;
    entity.spawnTime = globalTimer;
}

function despawnEntity(entity) {
    entity.active = false;
}

function repositionLulu() {
    const margin = 150;
    luluSphere.x = random(-width/2 + margin, width/2 - margin);
    luluSphere.y = random(-height/2 + margin, height/2 - margin);
    luluSphere.z = random(100, 200);
    
    for (let fairy of fairies) {
        fairy.reset();
        fairy.pos.x = luluSphere.x + random(-100, 100);
        fairy.pos.y = luluSphere.y + random(-100, 100);
        fairy.pos.z = luluSphere.z + random(-20, 80);
    }
}

function updatePhysics(audioFactor) {
    // Only update active entities
    if (blueCircle.active) {
        blueCircle.x += blueCircle.vx * audioFactor;
        blueCircle.y += blueCircle.vy * audioFactor;
        blueCircle.z += blueCircle.vz * audioFactor * 0.5;
    }
    
    if (purpleCircle.active) {
        purpleCircle.x += purpleCircle.vx * audioFactor;
        purpleCircle.y += purpleCircle.vy * audioFactor;
        purpleCircle.z += purpleCircle.vz * audioFactor * 0.5;
    }
    
    if (greenCircle.active) {
        greenCircle.x += greenCircle.vx * audioFactor;
        greenCircle.y += greenCircle.vy * audioFactor;
        greenCircle.z += greenCircle.vz * audioFactor * 0.5;
    }
    
    if (cosmicFish.active) {
        cosmicFish.x += cosmicFish.vx * audioFactor;
        cosmicFish.y += cosmicFish.vy * audioFactor;
        cosmicFish.z += cosmicFish.vz * audioFactor * 0.5;
    }
    
    if (alienShip.active) {
        alienShip.x += alienShip.vx * audioFactor * 0.8;
        alienShip.y += alienShip.vy * audioFactor * 0.8;
        alienShip.z += alienShip.vz * audioFactor * 0.4;
    }
    
    const bounds = {
        x: width/2 * 0.8,
        y: height/2 * 0.8,
        z: 300
    };
    
    // Bounce checks for all active entities
    if (blueCircle.active) {
        if (abs(blueCircle.x) > bounds.x - blueCircle.radius * 0.5) {
            blueCircle.vx *= -1;
            blueCircle.x = sign(blueCircle.x) * (bounds.x - blueCircle.radius * 0.5);
        }
        if (abs(blueCircle.y) > bounds.y - blueCircle.radius * 0.5) {
            blueCircle.vy *= -1;
            blueCircle.y = sign(blueCircle.y) * (bounds.y - blueCircle.radius * 0.5);
        }
        if (abs(blueCircle.z) > bounds.z) {
            blueCircle.vz *= -1;
            blueCircle.z = sign(blueCircle.z) * bounds.z;
        }
    }
    
    if (purpleCircle.active) {
        if (abs(purpleCircle.x) > bounds.x - purpleCircle.radius * 0.5) {
            purpleCircle.vx *= -1;
            purpleCircle.x = sign(purpleCircle.x) * (bounds.x - purpleCircle.radius * 0.5);
        }
        if (abs(purpleCircle.y) > bounds.y - purpleCircle.radius * 0.5) {
            purpleCircle.vy *= -1;
            purpleCircle.y = sign(purpleCircle.y) * (bounds.y - purpleCircle.radius * 0.5);
        }
        if (abs(purpleCircle.z) > bounds.z) {
            purpleCircle.vz *= -1;
            purpleCircle.z = sign(purpleCircle.z) * bounds.z;
        }
    }
    
    if (greenCircle.active) {
        if (abs(greenCircle.x) > bounds.x - greenCircle.radius * 0.5) {
            greenCircle.vx *= -1;
            greenCircle.x = sign(greenCircle.x) * (bounds.x - greenCircle.radius * 0.5);
        }
        if (abs(greenCircle.y) > bounds.y - greenCircle.radius * 0.5) {
            greenCircle.vy *= -1;
            greenCircle.y = sign(greenCircle.y) * (bounds.y - greenCircle.radius * 0.5);
        }
        if (abs(greenCircle.z) > bounds.z) {
            greenCircle.vz *= -1;
            greenCircle.z = sign(greenCircle.z) * bounds.z;
        }
    }
    
    if (cosmicFish.active) {
        if (abs(cosmicFish.x) > bounds.x - cosmicFish.size) {
            cosmicFish.vx *= -1;
            cosmicFish.x = sign(cosmicFish.x) * (bounds.x - cosmicFish.size);
        }
        if (abs(cosmicFish.y) > bounds.y - cosmicFish.size) {
            cosmicFish.vy *= -1;
            cosmicFish.y = sign(cosmicFish.y) * (bounds.y - cosmicFish.size);
        }
        if (abs(cosmicFish.z) > bounds.z) {
            cosmicFish.vz *= -1;
            cosmicFish.z = sign(cosmicFish.z) * bounds.z;
        }
    }
    
    if (alienShip.active) {
        if (abs(alienShip.x) > bounds.x - alienShip.size) {
            alienShip.vx *= -1;
            alienShip.x = sign(alienShip.x) * (bounds.x - alienShip.size);
        }
        if (abs(alienShip.y) > bounds.y - alienShip.size) {
            alienShip.vy *= -1;
            alienShip.y = sign(alienShip.y) * (bounds.y - alienShip.size);
        }
        if (abs(alienShip.z) > bounds.z) {
            alienShip.vz *= -1;
            alienShip.z = sign(alienShip.z) * bounds.z;
        }
    }
}

function drawLulu(waveform, avgFrequency) {
    push();
    translate(luluSphere.x, luluSphere.y, luluSphere.z);
    
    push();
    rotateX(PI/2);
    rotateZ(frameCount * 0.01);
    noFill();
    strokeWeight(3);
    
    let ringPulse = map(avgFrequency, 0, 255, 0.9, 1.1);
    let ringRadius = 80 * ringPulse;
    
    let ringColor1 = color(290, 80, 90, 0.8);
    let ringColor2 = color(320, 90, 90, 0.8);
    
    for (let i = 0; i < 360; i += 5) {
        let inter = map(i, 0, 360, 0, 1);
        let c = lerpColor(ringColor1, ringColor2, inter);
        stroke(c);
        
        let angle = radians(i);
        let x1 = ringRadius * cos(angle);
        let y1 = ringRadius * sin(angle);
        let x2 = ringRadius * cos(angle + radians(5));
        let y2 = ringRadius * sin(angle + radians(5));
        
        let wiggle = map(waveform[i % waveform.length], -1, 1, -5, 5);
        line(x1, y1, x2 + wiggle, y2);
    }
    pop();
    
    push();
    rotateX(PI/2 + sin(frameCount * 0.02) * 0.2);
    rotateZ(frameCount * 0.01);
    noFill();
    strokeWeight(2);
    stroke(50, 90, 90, 0.7);
    torus(60 * ringPulse, 4, 24, 12);
    pop();
    
    push();
    noStroke();
    
    let bassLevel = map(dataArray[1], 0, 255, 0, 1);
    let midLevel = map(dataArray[100], 0, 255, 0, 1);
    
    let smileAmount = map(bassLevel, 0, 1, 0, 1);
    
    ambientMaterial(280, 80, 90);
    
    ambientLight(50, 50, 50);
    pointLight(320, 90, 100, 0, 100, 100);
    pointLight(180, 90, 100, 0, -100, 100);
    
    rotateY(frameCount * 0.02);
    rotateX(frameCount * 0.01);
    
    sphere(luluSphere.radius);
    
    push();
    translate(0, -10, luluSphere.radius);
    fill(0);
    
    let eyeSize = 6 + midLevel * 4;
    ellipse(-12, 0, eyeSize, eyeSize * (1 + midLevel));
    ellipse(12, 0, eyeSize, eyeSize * (1 + midLevel));
    
    translate(0, 15, 0);
    noFill();
    stroke(0);
    strokeWeight(2);
    arc(0, 0, 20, 15 * smileAmount, 0, PI);
    pop();
    
    pop();
    
    for (let fairy of fairies) {
        fairy.update(avgFrequency);
        fairy.display();
    }
    
    pop();
}

function drawBlueCircle(waveform) {
    push();
    translate(blueCircle.x, blueCircle.y, blueCircle.z);
    stroke("blue");
    strokeWeight(3);
    noFill();
    
    beginShape();
    for (let i = 0; i < waveform.length; i += 6) {
        let angle = map(i, 0, waveform.length, 0, TWO_PI);
        let r = blueCircle.radius + map(waveform[i], -1, 1, -20, 20);
        let x = r * cos(angle);
        let y = r * sin(angle);
        vertex(x, y, 0);
    }
    endShape(CLOSE);
    pop();
}

function drawPurpleCircle(waveform) {
    push();
    translate(purpleCircle.x, purpleCircle.y, purpleCircle.z);
    stroke("purple");
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < waveform.length; i += 8) {
        let angle = map(i, 0, waveform.length, 0, TWO_PI);
        let r = purpleCircle.radius + map(waveform[i], -1, 1, -15, 15);
        let x = r * cos(angle);
        let y = r * sin(angle);
        vertex(x, y, 0);
    }
    endShape(CLOSE);
    pop();
}

function drawGreenCircle(waveform) {
    push();
    translate(greenCircle.x, greenCircle.y, greenCircle.z);
    stroke("green");
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < waveform.length; i += 10) {
        let angle = map(i, 0, waveform.length, 0, TWO_PI);
        let r = greenCircle.radius + map(waveform[i], -1, 1, -10, 10);
        let x = r * cos(angle);
        let y = r * sin(angle);
        vertex(x, y, 0);
    }
    endShape(CLOSE);
    pop();
}

function drawCosmicFish(waveform, avgFrequency) {
    push();
    translate(cosmicFish.x, cosmicFish.y, cosmicFish.z);
    
    let fishAngle = atan2(cosmicFish.vy, cosmicFish.vx);
    rotateZ(fishAngle);
    rotateY(sin(frameCount * 0.1) * 0.2);
    
    let fishHue = map(dataArray[30], 0, 255, 160, 200);
    
    noStroke();
    fill(fishHue, 80, 90, 0.8);
    ellipsoid(cosmicFish.size * 0.8, cosmicFish.size * 0.4, cosmicFish.size * 0.3);
    
    push();
    translate(-cosmicFish.size * 0.7, 0, 0);
    rotateY(sin(frameCount * 0.2) * 0.5);
    fill(fishHue, 85, 95, 0.8);
    cone(cosmicFish.size * 0.4, cosmicFish.size * 0.6, 8, 1);
    pop();
    
    push();
    translate(cosmicFish.size * 0.4, cosmicFish.size * 0.1, cosmicFish.size * 0.2);
    fill(0);
    sphere(cosmicFish.size * 0.1);
    pop();
    
    push();
    fill(fishHue + 20, 70, 95, 0.7);
    translate(0, 0, cosmicFish.size * 0.3);
    rotateX(PI/2);
    rotateY(sin(frameCount * 0.15) * 0.3);
    triangle(0, 0, cosmicFish.size * 0.3, cosmicFish.size * 0.4, -cosmicFish.size * 0.3, cosmicFish.size * 0.4);
    pop();
    
    push();
    fill(fishHue + 20, 70, 95, 0.7);
    translate(0, 0, -cosmicFish.size * 0.3);
    rotateX(PI/2);
    rotateY(sin(frameCount * 0.15 + PI) * 0.3);
    triangle(0, 0, cosmicFish.size * 0.3, cosmicFish.size * 0.4, -cosmicFish.size * 0.3, cosmicFish.size * 0.4);
    pop();
    
    for (let i = 0; i < 3; i++) {
        push();
        translate(-cosmicFish.size * (0.9 + i * 0.2), 
                 sin(frameCount * 0.1 + i) * cosmicFish.size * 0.1, 
                 cos(frameCount * 0.1 + i) * cosmicFish.size * 0.1);
        fill(200, 80, 100, 0.5 - i * 0.1);
        sphere(cosmicFish.size * (0.08 - i * 0.02));
        pop();
    }
    
    pop();
}

function drawAlienShip(waveform, avgFrequency) {
    push();
    translate(alienShip.x, alienShip.y, alienShip.z);
    
    rotateY(frameCount * 0.01);
    
    noStroke();
    fill(280, 70, 50, 0.9);
    ellipsoid(alienShip.size * 1.2, alienShip.size * 0.4, alienShip.size * 1.2);
    
    push();
    translate(0, -alienShip.size * 0.2, 0);
    fill(200, 90, 80, 0.7);
    sphere(alienShip.size * 0.5);
    pop();
    
    for (let i = 0; i < 12; i++) {
        let angle = map(i, 0, 12, 0, TWO_PI);
        let blinkRate = (i % 3 == 0) ? 5 : (i % 3 == 1) ? 7 : 11;
        let lightBrightness = sin(frameCount * 0.1 + i * 0.5) * 0.5 + 0.5;
        
        push();
        rotateY(angle);
        translate(alienShip.size * 0.8, 0, 0);
        fill(i * 30 % 360, 80, 90, lightBrightness);
        sphere(alienShip.size * 0.06);
        pop();
    }
    
    if (alienShip.beamOn) {
        let beamBrightness = (sin(frameCount * 0.2) * 0.3 + 0.7) * map(dataArray[50], 0, 255, 0.3, 1);
        
        push();
        translate(0, alienShip.size * 0.4, 0);
        noFill();
        stroke(120, 90, 100, beamBrightness);
        strokeWeight(2);
        
        for (let i = 0; i < 5; i++) {
            let coneSize = map(i, 0, 4, 0.1, 1);
            let yOffset = map(i, 0, 4, 0, alienShip.size * 3);
            let dia = alienShip.size * coneSize;
            
            ellipse(0, yOffset, dia, dia * 0.3);
        }
        
        stroke(120, 40, 100, beamBrightness * 0.5);
        line(0, 0, 0, alienShip.size * 3);
        pop();
    }
    
    pop();
}

function sign(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
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
        this.vel.x += (luluSphere.x - this.pos.x) * 0.03;
        this.vel.y += (luluSphere.y - this.pos.y) * 0.03;
        this.vel.z += (luluSphere.z - this.pos.z) * 0.03;
        
        this.vel.x += random(-0.1, 0.1);
        this.vel.y += random(-0.1, 0.1);
        this.vel.z += random(-0.05, 0.05);
        
        this.vel.limit(2 + audioLevel/100);
        
        this.pos.add(this.vel);
        
        this.lifespan -= 1.5;
        
        if (this.lifespan < 0) {
            this.reset();
            this.pos.x = luluSphere.x + random(-80, 80);
            this.pos.y = luluSphere.y + random(-80, 80);
            this.pos.z = luluSphere.z + random(-40, 80);
        }
    }
    
    display() {
        push();
        translate(this.pos.x, this.pos.y, this.pos.z);
        
        noStroke();
        
        fill(this.hue, 80, 90, this.lifespan/600);
        ellipse(0, 0, this.size * 4);
        
        fill(this.hue, 40, 100, this.lifespan/255);
        ellipse(0, 0, this.size);
        
        fill(60, 100, 100, this.lifespan/255);
        ellipse(0, 0, this.size/2);
        
        pop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}