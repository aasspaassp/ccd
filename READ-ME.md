// Integration Guide: The Psychedelic Matrix Audio Visualizer

/*
This guide explains how to integrate all components of the visualization system
and provides tips for using it during live performances.
*/

// 1. SETUP INSTRUCTIONS

/*
To set up the complete visualization system:

1. Create a folder for your project
2. Add these files to your folder:
   - index.html (HTML structure with embedded CSS)
   - sketch.js (Main p5.js visualization code)
   - control-panel.js (Performance control panel)
   - text-generator.js (Text generation and display)

3. Open index.html in a web browser
4. Click "START AUDIO INPUT" to grant microphone access
5. Use on-screen controls or keyboard shortcuts to control the visualization
*/

// 2. KEYBOARD SHORTCUTS

/*
The system includes several keyboard shortcuts:

M - Switch between Matrix and Alien visualization modes
C - Toggle Control Panel
T - Toggle Text Generator
SPACE - Reset all controls to default values
1-4 - Activate visualization presets (Chill, Energetic, Trippy, Ambient)
0-9 - Display specific text phrases from your performance library
*/

// 3. PERFORMANCE TIPS

/*
Tips for live performances:

- Set up multiple scenes by saving presets in the control panel
- Practice transitioning between Matrix and Alien visualization modes
- Use the Text Generator to display lyrics or themes that match your audio
- For quieter/ambient sections, use the "Chill" or "Ambient" presets
- For high-energy drops, quickly switch to "Energetic" or "Trippy" presets
- If using specific audio samples, choreograph text phrases to match
- Adjust Bass/Mid/High multipliers to enhance specific elements of your sound
- For dramatic moments, use the Zoom control to create depth effects
*/

// 4. MIDI CONTROLLER INTEGRATION

/*
The system includes basic MIDI controller support:

- Connect a MIDI controller before starting the visualization
- The system will automatically detect available MIDI devices
- Note events (key presses) control visual effects:
  * Low notes affect bass visualizations
  * Mid notes change color schemes
  * High notes trigger special effects
- Control change messages (knobs/sliders) adjust parameters:
  * CC#1 (mod wheel) controls rotation speed
  * Other CCs can be mapped to specific visualization parameters
  
To extend MIDI functionality, modify the onMIDIMessage function in sketch.js
*/

// 5. ADDING CUSTOM TEXT

/*
To add your own text phrases for the performance:

1. Open text-generator.js
2. Find the "performanceTexts" array
3. Add your own phrases or lyrics as strings in this array
4. During performance, press numeric keys 1-9 to display specific phrases
*/

// 6. CREATING CUSTOM VISUALS

/*
To create custom visualization elements:

1. Study the visualization functions in sketch.js
2. For Matrix mode, modify drawMatrixCubes(), drawSignalWaves(), or drawTextMatrix()
3. For Alien mode, modify drawAlienStructures(), drawDataChannels(), or drawCyberOrbs()
4. Create new visualization elements by following the pattern of existing ones
5. Add your new functions to the appropriate visualization mode in the draw() function
*/

// 7. TROUBLESHOOTING

/*
Common issues and solutions:

- If audio input isn't working, check your browser's microphone permissions
- If the visualization is slow/laggy, reduce the particle density in the control panel
- If colors aren't displaying correctly, try switching color modes
- For better performance on slower devices, reduce the number of particles
- If text isn't displaying, make sure the text generator is toggled on (T key)
*/

// 8. EXTENDING THE SYSTEM

/*
Ideas for extending the system:

- Add audio file playback support instead of just microphone input
- Create additional visualization modes beyond Matrix and Alien
- Implement a recording feature to save performances as video
- Add network capabilities to synchronize multiple instances
- Create a library of preset visual scenes for different music styles
*/