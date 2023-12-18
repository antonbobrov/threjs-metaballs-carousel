import { loadImage } from '@anton.bobrov/vevet-init';
import '../styles/index.scss';
import { Slider } from './Slider';
import { WebglManager } from './webgl/Manager';

const container = document.getElementById('scene') as HTMLElement;

const manager = new WebglManager(container, {});
manager.play();

const imagesSrc = ['0.jpg', '1.jpg', '2.jpg'];
const loaders = imagesSrc.map((src) => loadImage(src));

const create = (images: HTMLImageElement[]) => {
  const slider = new Slider({
    name: 'Slider',
    manager,
    images,
    wheelSpeed: 0.5,
    dragSpeed: 0.5,
    friction: 0,
    rowShift: 1,
    isReverse: true,
    time: 0.005,
    textureNoiseShift: 59,
    textureNoiseScale: 0.0215,
    metaballsNoiseShift: 50,
    metaballsNoiseScale: 0.002,
  });

  const prev = document.getElementById('prev');
  prev?.addEventListener('click', () => slider.prev());

  const next = document.getElementById('next');
  next?.addEventListener('click', () => slider.next());
};

Promise.all(loaders)
  .then((images) => create(images))
  .catch(() => {});
