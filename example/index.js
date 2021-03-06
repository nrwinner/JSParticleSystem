let canvas;
let scene;

/**
 * Show or hide the play & pause button
 */
function toggleControls() {
  const el = document.getElementsByClassName('controls')[0];
  if (!el.classList.contains('controls--visible')) {
    el.classList.add('controls--visible');
  } else {
    el.classList.remove('controls--visible');
  }
}

/**
 * Switch the actively highlighted system menu bar
 *
 * @param {MouseEvent} event
 */
function toggleParticleSystem(event) {
  document.getElementsByClassName('particle-switcher__button--active')[0].classList.remove('particle-switcher__button--active');
  event.srcElement.classList.add('particle-switcher__button--active');

  const highlightElement = document.getElementsByClassName('particle-switcher__highlight')[0];
  highlightElement.style = `transform: translateX(${event.srcElement.offsetLeft}px)`;
}

/**
 * Fired on body load, triggers the first simulation
 */
function onload() {
  canvas = document.getElementById('particles');

  activateRain();
}

/**
 * If there is a current scene, start it
 */
function play() {
  if (scene) {
    scene.start();
  }
}

/**
 * If there is a current scene, stop it
 */
function pause() {
  if (scene) {
    scene.stop();
  }
}

/**
 * Activate the insects simulation
 */
function activateInsects() {
  cleanUpFromPreviousScene();

  const config = {
    emitter: {
      x: 200,
      y: 200,
      width: 200,
      height: 200,
      emitPerTick: 1,
      numberOfEmissions: 100,
    },
    particle: {
      size: () => ({ w: random(2, 3), h: random(2, 3) }),
      speed: () => random(6, 10),
      shape: 'circle',
      color: 'black',
      vector: () => random(0, 360),
      animation: (p) => {
        if (!p.animationState) {
          p.animationState = { tickCount: 0, direction: [-1, 1][random(0, 1)] };
        }

        if (p.animationState.tickCount >= 35) {
          p.animationState.direction *= -1;
          p.animationState.tickCount = 5;
        } else if (p.animationState.tickCount >= 5) {
          p.vector += (12 * p.animationState.direction);
        }

        p.animationState.tickCount++;

        p.calculateLinearMove();
      }
    },
    systemOptions: { startAtTick: 100 }
  }

  canvas.style.backgroundColor = 'white';

  scene = CreateParticleScene(canvas); 
  scene.addSystem(CreateParticleSystem(config));
  scene.start();
}

/**
 * Activate the rain simulation
 */
function activateRain() {
  cleanUpFromPreviousScene();

  const skyBoxEmitter = {
    x: 0,
    y: 0,
    width: 900,
    height: 0,
    emitPerTick: 5,
  }

  const rainParticle = {
    size: { w: 1, h: 5 },
    speed: () =>  Math.floor(Math.random() * 18) + 10,
    vector: 0,
    color: 'white',
    shape: 'line'
  }

  canvas.style.backgroundColor = 'black';

  let config = {
    particle: rainParticle,
    emitter: skyBoxEmitter,
    systemOptions: { startAtTick: 200 }
  }

  scene = CreateParticleScene(canvas); 
  scene.addSystem(CreateParticleSystem(config));
  scene.start();
}

/**
 * Activate the snow simulation
 */
function activateSnow() {
  cleanUpFromPreviousScene();

  const skyBoxEmitterTop = {
    x: 0,
    y: 0,
    width: 900,
    height: 0,
    emitPerTick: 1,
  }

  const skyBoxEmitterLeft = {
    x: 0,
    y: 0,
    width: 0,
    height: 600,
    emitPerTick: 1,
    emissionFrequency: 50
  }

  const snowParticle = {
    size: () => { return { w: random(1, 2) } },
    speed: () =>  random(1, 4),
    vector: () => random(18, 22),
    color: 'white',
    shape: 'circle',
  }

  canvas.style.backgroundColor = 'black';

  const configTop = {
    particle: snowParticle,
    emitter: skyBoxEmitterTop,
    systemOptions: { startAtTick: 200 }
  }

  const configLeft = {
    particle: snowParticle,
    emitter: skyBoxEmitterLeft,
    systemOptions: { startAtTick: 100 }
  }

  scene = CreateParticleScene(canvas); 
  scene.addSystem(CreateParticleSystem(configTop));
  scene.addSystem(CreateParticleSystem(configLeft));
  scene.start();
}

/**
 * Activate the on-click burst animation
 *
 */
function activateBurst() {
  cleanUpFromPreviousScene();
  
  canvas.style.backgroundColor = 'white';

  scene = CreateParticleScene(canvas);
  scene.start();
  
  
  canvas.addEventListener('click', canvasClickHandler);
}

/**
 * Handle click events on the canvas pertaining to the burst animation
 * 
 * @param {MouseEvent} event
 */
function canvasClickHandler(event) {

  const burstConfig = {
    emitter: {
      x: event.pageX - event.currentTarget.getBoundingClientRect().left,
      y: event.pageY - event.currentTarget.getBoundingClientRect().top,
      width: 0,
      height: 0,
      numberOfEmissions: 1,
      emitPerTick: () => random(6, 20)
    },
    particle: {
      size: () => ({ w: random(2, 5) }),
      speed: () => random(5, 10),
      vector: () => random(0, 360),
      color: () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 1)`,
      shape: 'circle',
      animation: (p) => {
        if (!p.animationState) {
          let [r, g, b, a] = p.color.match(/[0-9]*/g).map(x => parseInt(x)).filter(x => !Number.isNaN(x));

          p.animationState = { r, g, b, a };
          p.animationState.direction = [-1, 1][random(0, 1)];
        } else {
          p.animationState.a -= 0.02;

          p.color = `rgba(${p.animationState.r}, ${p.animationState.g}, ${p.animationState.b}, ${p.animationState.a})`
          p.vector += (5 * p.animationState.direction);
        }

        if (p.animationState.a <= 0) {
          p.dead = true;
        }

        p.calculateLinearMove();
      }
    }
  }
  
  if (scene.running) {
    scene.addSystem(CreateParticleSystem(burstConfig)); 
  }
}

/**
 * Stop the existing scene and remove any click-event handlers that may have been added if the ParticleBurst animation was started
 */
function cleanUpFromPreviousScene() {
  if (scene) {
    scene.stop();
    canvas.removeEventListener('click', canvasClickHandler);
  }
}

/**
 * A simple function for generating a number between min inclusive & max inclusive
 *
 * @param {number} min the inclusive lower bound
 * @param {number} max the inclusive upper bound
 * @returns
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}