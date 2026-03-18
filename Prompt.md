Comprehensive Prompt for Futuristic Matrix Wave Animation Feature
Feature Overview
Add an immersive 3D matrix-style wave animation background to the practice session page that creates a futuristic, interactive visual experience with moving particles, wave patterns, and dynamic visual feedback based on the AI's state.

Technical Requirements
1. Core Animation Component
Create a MatrixWave component that renders a canvas-based animation with:

3D particle system with depth (z-index) perception

Wave motion patterns affecting particle positions

Grid lines that undulate like waves

Connecting lines between nearby particles (neural network effect)

Floating binary characters for matrix aesthetic

2. Visual Effects
Particle Properties:

Size variation based on depth (closer = larger)

Opacity gradients for depth perception

Color palette: cyan/teal (#00FFC8, #00C8FF) with varying opacity

Glowing radial gradients for each particle

Grid System:

Horizontal and vertical lines with wave distortion

Line opacity that varies with wave position

Subtle color shifts based on time

Background:

Dark gradient background (navy to black)

Smooth transitions

Non-intrusive but visually engaging

3. State-Based Intensity
The animation should respond to the AI's current state:

State	Intensity	Visual Characteristics
Idle	20%	Subtle movement, low opacity
Listening	80%	Increased particle speed, brighter connections, pulsing effect
Thinking	60%	Medium intensity, organized wave patterns
Speaking	70%	Rhythmic pulses synchronized with speech, radial waves
4. Performance Optimizations
Use requestAnimationFrame for smooth 60fps animation

Implement particle pooling instead of recreating

Debounce resize events

Clean up animation frames on unmount

Use will-change CSS property

Limit particle count based on device performance (detect via FPS)