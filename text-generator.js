// Text Generator for Audio Visualization
// This component generates and displays AI-inspired text for the visualization

// Text generation variables
let textGenerator = {
    active: false,
    container: null,
    displayTime: 5000,  // How long each text stays visible (ms)
    fadeTime: 1000,     // Fade in/out time (ms)
    nextTextTime: 0,
    textQueue: [],
    
    // Collection of text fragments for generation
    fragments: {
      subjects: [
        "AI", "cyborgs", "algorithms", "neural networks", "quantum particles", 
        "data streams", "consciousness", "machines", "organic systems", "synthetic beings"
      ],
      verbs: [
        "process", "interpret", "create", "transform", "evolve", 
        "merge with", "transcend", "redefine", "calculate", "dream of"
      ],
      objects: [
        "reality", "perception", "information", "patterns", "dimensions",
        "possibility spaces", "the void", "abstract concepts", "emotional states", "human experience"
      ],
      adjectives: [
        "infinite", "quantum", "digital", "emergent", "synthetic",
        "cybernetic", "fractal", "neural", "probabilistic", "non-deterministic"
      ],
      concepts: [
        "when probability collapses into being",
        "as language creates reality",
        "where consciousness meets code",
        "in the space between signal and noise",
        "beyond the binary of existence",
        "as patterns emerge from chaos",
        "where algorithms dream",
        "in the quantum foam of possibility",
        "as meaning emerges from randomness",
        "when systems become self-aware"
      ]
    },
    
    // Initialize the text generator with HTML container
    init: function() {
      // Create container element if it doesn't exist
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'text-display';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '50';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';
        document.body.appendChild(this.container);
      }
      
      // Pre-generate some texts
      for (let i = 0; i < 5; i++) {
        this.textQueue.push(this.generateText());
      }
      
      this.active = true;
      this.update();
      
      // Expose toggle function to window
      window.toggleTextGenerator = this.toggle.bind(this);
    },
    
    // Generate a random text pattern
    generateText: function() {
      // Choose a generation pattern randomly
      const pattern = Math.floor(Math.random() * 5);
      
      let text;
      switch (pattern) {
        case 0:
          // Subject + verb + object
          text = this.randomFrom('subjects') + " " + 
                 this.randomFrom('verbs') + " " + 
                 this.randomFrom('objects');
          break;
        case 1:
          // Adjective + subject + concept
          text = this.randomFrom('adjectives') + " " + 
                 this.randomFrom('subjects') + " " + 
                 this.randomFrom('concepts');
          break;
        case 2:
          // Philosophical statement
          text = this.randomFrom('concepts');
          break;
        case 3:
          // Command
          text = this.randomFrom('verbs') + " the " + 
                 this.randomFrom('adjectives') + " " + 
                 this.randomFrom('objects');
          break;
        case 4:
          // Question
          text = "can " + this.randomFrom('subjects') + " " + 
                 this.randomFrom('verbs') + " " + 
                 this.randomFrom('objects') + "?";
          break;
      }
      
      // Formatting
      if (Math.random() > 0.5) {
        text = text.toUpperCase();
      }
      
      return text;
    },
    
    // Pick a random entry from one of the fragment arrays
    randomFrom: function(category) {
      const array = this.fragments[category];
      return array[Math.floor(Math.random() * array.length)];
    },
    
    // Display text with fade in/out animation
    displayText: function(text) {
      // Create text element
      const textElem = document.createElement('div');
      textElem.innerText = text;
      textElem.style.fontFamily = 'monospace';
      textElem.style.fontSize = '24px';
      textElem.style.fontWeight = 'bold';
      textElem.style.color = '#1fff4f';
      textElem.style.textShadow = '0 0 10px rgba(31, 255, 79, 0.7)';
      textElem.style.padding = '20px';
      textElem.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      textElem.style.borderRadius = '5px';
      textElem.style.maxWidth = '80%';
      textElem.style.textAlign = 'center';
      textElem.style.opacity = '0';
      textElem.style.transform = 'translateY(20px)';
      textElem.style.transition = `opacity ${this.fadeTime}ms ease, transform ${this.fadeTime}ms ease`;
      
      // Add to container
      this.container.appendChild(textElem);
      
      // Trigger fade in
      setTimeout(() => {
        textElem.style.opacity = '1';
        textElem.style.transform = 'translateY(0)';
      }, 10);
      
      // Schedule fade out and removal
      setTimeout(() => {
        textElem.style.opacity = '0';
        textElem.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          if (textElem.parentNode) {
            textElem.parentNode.removeChild(textElem);
          }
        }, this.fadeTime);
      }, this.displayTime);
    },
    
    // Main update loop
    update: function() {
      if (!this.active) return;
      
      const currentTime = Date.now();
      
      // Check if it's time to display new text
      if (currentTime > this.nextTextTime) {
        // Get the next text from queue and display it
        if (this.textQueue.length > 0) {
          const text = this.textQueue.shift();
          this.displayText(text);
        }
        
        // Add a new text to the queue
        this.textQueue.push(this.generateText());
        
        // Schedule next text with some randomness
        const randomDelay = Math.random() * 3000 + 2000; // 2-5 seconds
        this.nextTextTime = currentTime + randomDelay;
      }
      
      // Continue the loop
      requestAnimationFrame(this.update.bind(this));
    },
    
    // Toggle the text generator on/off
    toggle: function() {
      this.active = !this.active;
      
      if (this.active) {
        this.update();
        this.container.style.display = 'flex';
      } else {
        this.container.style.display = 'none';
      }
      
      return this.active;
    },
    
    // Add custom text from external source
    addCustomText: function(text) {
      this.textQueue.push(text);
    }
  };
  
  // Sample lyrics/phrases that could be used during your performance
  const performanceTexts = [
    "The signal emerges from the noise",
    "Language as probability matrix",
    "Consciousness encoded in electronic signals",
    "WHERE ALGORITHMS DREAM OF ELECTRIC SHEEP",
    "Synthetic neurological pathways forming",
    "The space between human and machine",
    "TRANSMISSION RECEIVED FROM THE VOID",
    "Alien patterns in familiar structures",
    "Neural networks mirroring brain patterns",
    "The boundary between organic and digital dissolves"
  ];
  
  // Function to add performance texts during your show
  function queuePerformanceText(index) {
    if (textGenerator.active && index < performanceTexts.length) {
      textGenerator.addCustomText(performanceTexts[index]);
      return true;
    }
    return false;
  }
  
  // Initialize when the document is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Add button to HTML
    const textButton = document.createElement('button');
    textButton.innerText = 'TOGGLE TEXT';
    textButton.style.position = 'fixed';
    textButton.style.bottom = '20px';
    textButton.style.right = '20px';
    textButton.style.padding = '5px 10px';
    textButton.style.background = 'rgba(0, 0, 0, 0.7)';
    textButton.style.color = '#1fff4f';
    textButton.style.border = '1px solid #1fff4f';
    textButton.style.fontFamily = 'monospace';
    textButton.style.cursor = 'pointer';
    textButton.onclick = () => textGenerator.toggle();
    
    document.body.appendChild(textButton);
    
    // Initialize after audio starts
    document.addEventListener('audioStarted', () => {
      textGenerator.init();
      
      // Add keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Numbers 1-9 can trigger specific performance texts
        if (e.key >= '1' && e.key <= '9') {
          const index = parseInt(e.key) - 1;
          queuePerformanceText(index);
        }
        
        // T key toggles text generator
        if (e.key === 't' || e.key === 'T') {
          textGenerator.toggle();
        }
      });
    });
  });