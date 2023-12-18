import { WebglManager } from '../../webgl/Manager';

export type TRenderProps = {
  loopProgress: number;
  prevIndex: number;
  nextIndex: number;
};

export type TImagesProps = {
  time: number;
  textureNoiseShift: number;
  textureNoiseScale: number;
  metaballsNoiseShift: number;
  metaballsNoiseScale: number;
};

export type TProps = TImagesProps & {
  name: string;
  manager: WebglManager;
  images: HTMLImageElement[];
};
