import { Renderer } from 'pixi.js';
import { app } from './app/app';
import { Debug } from './debug/debug';
import './style.css';

export const renderer = new Renderer({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundAlpha: 0,
});

const init = async (): Promise<void> => {
  // Hot reload
  if (import.meta.hot) {
    import.meta.hot.accept(() => {});
  }

  document.body.appendChild(renderer.view as HTMLCanvasElement);

  window.onresize = (): void => {
    renderer.resize(window.innerWidth, window.innerHeight);
  };

  await app.init();

  let lastTime = performance.now();
  let lastFrame = -1;

  const maxFps = 60;

  const minElapsedMS = 1000 / maxFps;
  const maxElapsedMS = 100;

  if (import.meta.env.DEV) {
    new Debug();
  }

  requestAnimationFrame(animate);
  function animate(currentTime = performance.now()): void {
    let elapsedMS = currentTime - lastTime;

    if (elapsedMS > maxElapsedMS) {
      elapsedMS = maxElapsedMS;
    }

    const delta = (currentTime - lastFrame) | 0;

    if (delta > minElapsedMS) {
      lastFrame = currentTime - (delta % minElapsedMS);
      lastTime = currentTime;

      app.update();
      renderer.render(app.stage);
    }

    requestAnimationFrame(animate);
  }
};

init();
