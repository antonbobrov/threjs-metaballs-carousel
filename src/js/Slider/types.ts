import { WebglManager } from '../webgl/Manager';
import { TImagesProps } from './Images/types';
import { TPointsProps } from './Points/types';

export type TSliderProps = {
  wheelSpeed: number;
  dragSpeed: number;
  friction: number;
};

export type TProps = TSliderProps &
  TPointsProps &
  TImagesProps & {
    name: string;
    manager: WebglManager;
    images: HTMLImageElement[];
  };
