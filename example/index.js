let canvas;
let scene;

const rainParticle = {
  size: { w: 1, h: 5 },
  speed: () =>  Math.floor(Math.random() * 18) + 10,
  vector: 0,
  color: 'white',
  shape: 'line'
}

const snowParticle = {
  size: () => { return { w: random(1, 2) } },
  speed: () =>  random(2, 4),
  vector: 0,
  color: 'white',
  shape: 'circle'
}

const skyBoxEmitter = {
  x: 0,
  y: 0,
  width: 600,
  height: 0,
  emitPerTick: 2,
}

function onload() {
  canvas = document.getElementById('particles');

  activateDefault();
}

function pause() {
  if (scene) {
    scene.stop();
  }
}

function play() {
  if (scene) {
    scene.start();
  }
}

function activateDefault() {
  if (scene) {
    scene.stop();
    canvas.removeEventListener('click', canvasClickHandler);
  }

  canvas.style.backgroundColor = 'white';

  scene = CreateParticleScene(canvas); 
  scene.addSystem(CreateParticleSystem(canvas));
  scene.start();
}

function activateRain() {

  if (scene) {
    scene.stop();
    canvas.removeEventListener('click', canvasClickHandler);
  }

  canvas.style.backgroundColor = 'black';

  let config = {
    particle: rainParticle,
    emitter: skyBoxEmitter
  }

  scene = CreateParticleScene(canvas); 
  scene.addSystem(CreateParticleSystem(canvas, config));
  scene.start();
}

function activateSnow() {
  if (scene) {
    scene.stop();
    canvas.removeEventListener('click', canvasClickHandler);
  }

  canvas.style.backgroundColor = 'black';

  const config = {
    particle: snowParticle,
    emitter: skyBoxEmitter
  }

  scene = CreateParticleScene(canvas); 
  scene.addSystem(CreateParticleSystem(canvas, config));
  scene.start();
}

function activateCanvasClick() {
  if (scene) {
    scene.stop();
    canvas.removeEventListener('click', canvasClickHandler);
  }
  
  canvas.style.backgroundColor = 'white';

  scene = CreateParticleScene(canvas);
  scene.start();
  
  
  canvas.addEventListener('click', canvasClickHandler);
}

function canvasClickHandler() {

  const clickConfig = {
    emitter: {  
      x: event.pageX,
      y: event.pageY,
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
          p.animationState.speed = p.speed;
          p.animationState.vector = p.vector;
        } else {
          p.animationState.a -= 0.02;
          p.animationState.speed -= 0.2;
          p.animationState.vector = p.animationState.vector + 5;

          p.color = `rgba(${p.animationState.r}, ${p.animationState.g}, ${p.animationState.b}, ${p.animationState.a})`
          // p.speed = p.animationState.speed;
          p.vector = p.animationState.vector;
        }

        if (p.animationState.a <= 0) {
          p.dead = true;
        }

        p.calculateLinearMove();
      }
    }
  }
  
  scene.addSystem(CreateParticleSystem(canvas, clickConfig)); 
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}