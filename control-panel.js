// Performance Control Panel
// Provides a set of controls for live manipulation of the visualization

// Control panel configuration
const controlPanel = {
    active: false,
    container: null,
    controls: {},
    values: {
      bassMultiplier: 1.0,
      midMultiplier: 1.0,
      highMultiplier: 1.0,
      rotationSpeed: 1.0,
      zoomLevel: 0,
      particleDensity: 1.0,
      colorMode: 0  // 0: normal, 1: inverted, 2: monochrome, 3: psychedelic
    },
  
    init: function() {
      // Create container element if it doesn't exist
      if (!this.container) {
        this.createPanel();
      }
      
      this.active = true;
      this.updateControls();
      
      // Expose toggle function to window
      window.toggleControlPanel = this.toggle.bind(this);
    },
    
    createPanel: function() {
      // Create main container
      this.container = document.createElement('div');
      this.container.id = 'control-panel';
      this.container.style.position = 'fixed';
      this.container.style.bottom = '20px';
      this.container.style.left = '20px';
      this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      this.container.style.padding = '15px';
      this.container.style.borderRadius = '5px';
      this.container.style.border = '1px solid #1fff4f';
      this.container.style.color = '#1fff4f';
      this.container.style.fontFamily = 'monospace';
      this.container.style.fontSize = '12px';
      this.container.style.zIndex = '100';
      this.container.style.display = 'none';
      this.container.style.maxWidth = '300px';
      
      // Add header with minimize button
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.marginBottom = '10px';
      
      const title = document.createElement('div');
      title.textContent = 'CONTROL PANEL';
      title.style.fontWeight = 'bold';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'X';
      closeBtn.style.background = 'none';
      closeBtn.style.border = 'none';
      closeBtn.style.color = '#1fff4f';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = this.toggle.bind(this);
      
      header.appendChild(title);
      header.appendChild(closeBtn);
      this.container.appendChild(header);
      
      // Create control elements
      this.addSlider('bassMultiplier', 'BASS BOOST', 0, 3, 1, 0.1);
      this.addSlider('midMultiplier', 'MID BOOST', 0, 3, 1, 0.1);
      this.addSlider('highMultiplier', 'HIGH BOOST', 0, 3, 1, 0.1);
      this.addSlider('rotationSpeed', 'ROTATION', 0, 5, 1, 0.1);
      this.addSlider('zoomLevel', 'ZOOM', -500, 500, 0, 10);
      this.addSlider('particleDensity', 'PARTICLES', 0.1, 3, 1, 0.1);
      
      // Create color mode selector
      const colorModeGroup = document.createElement('div');
      colorModeGroup.style.marginTop = '15px';
      colorModeGroup.style.marginBottom = '10px';
      
      const colorModeLabel = document.createElement('div');
      colorModeLabel.textContent = 'COLOR MODE:';
      colorModeLabel.style.marginBottom = '5px';
      colorModeGroup.appendChild(colorModeLabel);
      
      const colorModes = [
        { value: 0, label: 'NORMAL' },
        { value: 1, label: 'INVERTED' },
        { value: 2, label: 'MONOCHROME' },
        { value: 3, label: 'PSYCHEDELIC' }
      ];
      
      const colorBtnsContainer = document.createElement('div');
      colorBtnsContainer.style.display = 'flex';
      colorBtnsContainer.style.flexWrap = 'wrap';
      colorBtnsContainer.style.gap = '5px';
      
      colorModes.forEach(mode => {
        const btn = document.createElement('button');
        btn.textContent = mode.label;
        btn.style.flex = '1';
        btn.style.minWidth = '120px';
        btn.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        btn.style.color = '#1fff4f';
        btn.style.border = '1px solid #1fff4f';
        btn.style.padding = '5px';
        btn.style.cursor = 'pointer';
        btn.style.borderRadius = '3px';
        
        btn.onclick = () => {
          this.values.colorMode = mode.value;
          this.updateColorModeButtons();
          this.applyChanges();
        };
        
        colorBtnsContainer.appendChild(btn);
        this.controls['colorMode_' + mode.value] = btn;
      });
      
      colorModeGroup.appendChild(colorBtnsContainer);
      this.container.appendChild(colorModeGroup);
      
      // Add preset buttons
      const presetGroup = document.createElement('div');
      presetGroup.style.marginTop = '15px';
      
      const presetLabel = document.createElement('div');
      presetLabel.textContent = 'PRESETS:';
      presetLabel.style.marginBottom = '5px';
      presetGroup.appendChild(presetLabel);
      
      const presets = [
        { name: 'CHILL', settings: {
          bassMultiplier: 1.0, midMultiplier: 0.8, highMultiplier: 0.6,
          rotationSpeed: 0.5, zoomLevel: -100, particleDensity: 0.8, colorMode: 0
        }},
        { name: 'ENERGETIC', settings: {
          bassMultiplier: 1.5, midMultiplier: 1.2, highMultiplier: 1.8,
          rotationSpeed: 2.0, zoomLevel: 0, particleDensity: 1.5, colorMode: 3
        }},
        { name: 'TRIPPY', settings: {
          bassMultiplier: 2.5, midMultiplier: 1.0, highMultiplier: 2.0,
          rotationSpeed: 3.0, zoomLevel: 200, particleDensity: 2.0, colorMode: 3
        }},
        { name: 'AMBIENT', settings: {
          bassMultiplier: 0.5, midMultiplier: 1.0, highMultiplier: 0.5,
          rotationSpeed: 0.3, zoomLevel: -300, particleDensity: 1.0, colorMode: 2
        }}
      ];
      
      const presetBtnsContainer = document.createElement('div');
      presetBtnsContainer.style.display = 'flex';
      presetBtnsContainer.style.flexWrap = 'wrap';
      presetBtnsContainer.style.gap = '5px';
      
      presets.forEach(preset => {
        const btn = document.createElement('button');
        btn.textContent = preset.name;
        btn.style.flex = '1';
        btn.style.minWidth = '120px';
        btn.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        btn.style.color = '#1fff4f';
        btn.style.border = '1px solid #1fff4f';
        btn.style.padding = '5px';
        btn.style.cursor = 'pointer';
        btn.style.borderRadius = '3px';
        
        btn.onclick = () => {
          this.loadPreset(preset.settings);
        };
        
        presetBtnsContainer.appendChild(btn);
      });
      
      presetGroup.appendChild(presetBtnsContainer);
      this.container.appendChild(presetGroup);
      
      // Add reset button
      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'RESET ALL';
      resetBtn.style.width = '100%';
      resetBtn.style.marginTop = '15px';
      resetBtn.style.padding = '8px';
      resetBtn.style.backgroundColor = 'rgba(80, 0, 0, 0.8)';
      resetBtn.style.color = '#ffffff';
      resetBtn.style.border = '1px solid #ff3030';
      resetBtn.style.borderRadius = '3px';
      resetBtn.style.cursor = 'pointer';
      
      resetBtn.onclick = () => {
        this.resetToDefaults();
      };
      
      this.container.appendChild(resetBtn);
      
      // Add keyboard shortcut hints
      const shortcutsInfo = document.createElement('div');
      shortcutsInfo.style.marginTop = '15px';
      shortcutsInfo.style.fontSize = '10px';
      shortcutsInfo.style.color = '#aaffaa';
      shortcutsInfo.innerHTML = 'KEYBOARD SHORTCUTS:<br>' +
                               'C: Toggle Control Panel<br>' +
                               'M: Switch Visualization Mode<br>' +
                               'T: Toggle Text Generator<br>' +
                               '1-4: Load Presets<br>' +
                               'SPACE: Reset All';
      
      this.container.appendChild(shortcutsInfo);
      
      // Append to document
      document.body.appendChild(this.container);
    },
    
    addSlider: function(id, label, min, max, defaultValue, step) {
      const controlGroup = document.createElement('div');
      controlGroup.style.marginBottom = '10px';
      
      // Create label with value display
      const labelRow = document.createElement('div');
      labelRow.style.display = 'flex';
      labelRow.style.justifyContent = 'space-between';
      labelRow.style.marginBottom = '3px';
      
      const labelElem = document.createElement('div');
      labelElem.textContent = label;
      
      const valueElem = document.createElement('div');
      valueElem.id = `${id}-value`;
      valueElem.textContent = defaultValue.toFixed(1);
      
      labelRow.appendChild(labelElem);
      labelRow.appendChild(valueElem);
      controlGroup.appendChild(labelRow);
      
      // Create slider
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = min;
      slider.max = max;
      slider.value = defaultValue;
      slider.step = step;
      slider.style.width = '100%';
      slider.style.appearance = 'none';
      slider.style.height = '6px';
      slider.style.borderRadius = '3px';
      slider.style.background = '#333';
      slider.style.outline = 'none';
      
      // Custom slider styling
      slider.style.setProperty('--thumb-color', '#1fff4f');
      slider.style.setProperty('--track-color', '#333');
      
      // Add CSS for slider thumb and track
      const style = document.createElement('style');
      style.textContent = `
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #1fff4f;
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #1fff4f;
          cursor: pointer;
          border: none;
        }
      `;
      document.head.appendChild(style);
      
      // Add event listener
      slider.oninput = () => {
        const value = parseFloat(slider.value);
        this.values[id] = value;
        valueElem.textContent = value.toFixed(1);
        this.applyChanges();
      };
      
      controlGroup.appendChild(slider);
      this.container.appendChild(controlGroup);
      
      this.controls[id] = slider;
    },
    
    updateControls: function() {
      // Update all control values to match the current state
      for (const [id, value] of Object.entries(this.values)) {
        const control = this.controls[id];
        const valueElem = document.getElementById(`${id}-value`);
        
        if (control && control.type === 'range') {
          control.value = value;
          if (valueElem) {
            valueElem.textContent = value.toFixed(1);
          }
        }
      }
      
      this.updateColorModeButtons();
    },
    
    updateColorModeButtons: function() {
      // Highlight the active color mode button
      for (let i = 0; i < 4; i++) {
        const btn = this.controls[`colorMode_${i}`];
        if (btn) {
          if (i === this.values.colorMode) {
            btn.style.backgroundColor = 'rgba(0, 80, 40, 0.8)';
            btn.style.color = '#ffffff';
          } else {
            btn.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
            btn.style.color = '#1fff4f';
          }
        }
      }
    },
    
    applyChanges: function() {
      // Pass control values to the visualization
      if (window.applyControlValues) {
        window.applyControlValues(this.values);
      }
    },
    
    loadPreset: function(settings) {
      // Apply preset settings
      for (const [key, value] of Object.entries(settings)) {
        if (key in this.values) {
          this.values[key] = value;
        }
      }
      
      this.updateControls();
      this.applyChanges();
    },
    
    resetToDefaults: function() {
      this.values = {
        bassMultiplier: 1.0,
        midMultiplier: 1.0,
        highMultiplier: 1.0,
        rotationSpeed: 1.0,
        zoomLevel: 0,
        particleDensity: 1.0,
        colorMode: 0
      };
      
      this.updateControls();
      this.applyChanges();
    },
    
    toggle: function() {
      this.active = !this.active;
      this.container.style.display = this.active ? 'block' : 'none';
      return this.active;
    }
  };
  
  // Initialize when the document is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Add show panel button to HTML
    const panelButton = document.createElement('button');
    panelButton.innerText = 'CONTROLS';
    panelButton.style.position = 'fixed';
    panelButton.style.bottom = '20px';
    panelButton.style.left = '20px';
    panelButton.style.padding = '5px 10px';
    panelButton.style.background = 'rgba(0, 0, 0, 0.7)';
    panelButton.style.color = '#1fff4f';
    panelButton.style.border = '1px solid #1fff4f';
    panelButton.style.fontFamily = 'monospace';
    panelButton.style.cursor = 'pointer';
    panelButton.style.zIndex = '99';
    panelButton.onclick = () => controlPanel.toggle();
    
    document.body.appendChild(panelButton);
    
    // Initialize panel after audio starts
    document.addEventListener('audioStarted', () => {
      controlPanel.init();
      
      // Add keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // C key toggles control panel
        if (e.key === 'c' || e.key === 'C') {
          controlPanel.toggle();
        }
        
        // Space key resets to defaults
        if (e.key === ' ') {
          controlPanel.resetToDefaults();
        }
        
        // Number keys 1-4 load presets
        if (e.key >= '1' && e.key <= '4') {
          const presetButtons = document.querySelectorAll('#control-panel > div:nth-child(4) > div:nth-child(2) > button');
          const index = parseInt(e.key) - 1;
          if (presetButtons && presetButtons[index]) {
            presetButtons[index].click();
          }
        }
      });
    });
  });
  
  // Connect the control panel to the visualization
  window.applyControlValues = function(values) {
    // This function will be defined in the main sketch to receive control panel values
    if (window.controlValues) {
      window.controlValues = values;
    }
  };