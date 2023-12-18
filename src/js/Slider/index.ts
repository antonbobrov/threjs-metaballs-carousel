import { SlideProgress, wrap } from '@anton.bobrov/vevet-init';
import {
  TCreateDatGuiSettingsReturns,
  createDatGuiSettings,
} from '@anton.bobrov/react-dat-gui';
import { TProps, TSliderProps } from './types';
import { Points } from './Points';
import { Images } from './Images';

export class Slider {
  private _gui: TCreateDatGuiSettingsReturns<TSliderProps>;

  private _handler: SlideProgress;

  private _pointsInstance: Points;

  private _images: Images;

  constructor({ name, manager, images, ...props }: TProps) {
    const { container } = manager;

    // create dat gui
    this._gui = createDatGuiSettings({
      name,
      data: props,
      parameters: {
        wheelSpeed: { type: 'number', min: 0, max: 3, step: 0.5 },
        dragSpeed: { type: 'number', min: 0, max: 3, step: 0.5 },
        friction: { type: 'number', min: 0, max: 1, step: 0.001 },
      },
      onChange: ({ wheelSpeed, dragSpeed, friction }) => {
        this._handler.changeProps({ wheelSpeed, dragSpeed, friction });
      },
    });

    // slider handler
    this._handler = new SlideProgress({
      ...props,
      container,
      min: -Infinity,
      max: Infinity,
      stickyEndDuration: null,
      step: 1,
    });
    this._handler.addCallback('render', () => this._render());

    // create points
    this._pointsInstance = new Points({
      ...props,
      name,
      container,
      hasDomHelpers: false,
    });

    // create images
    this._images = new Images({ ...props, name, manager, images });
    this._images.points = this._pointsInstance.points;
  }

  /** Render the scene */
  private _render() {
    const { progress } = this._handler;

    const isEnd = progress % 1 === 0;

    let loopProgress = progress < 0 ? 1 - Math.abs(progress % 1) : progress % 1;
    loopProgress = isEnd ? 0 : loopProgress;

    const prevIndex = wrap(0, this._images.count, Math.floor(progress));
    const nextIndex = wrap(0, this._images.count, Math.ceil(progress));

    this._pointsInstance.render(loopProgress);

    this._images.points = this._pointsInstance.points;
    this._images.render({ loopProgress, prevIndex, nextIndex });
  }

  /** Go to next slide */
  public next() {
    // @ts-ignore
    // eslint-disable-next-line no-underscore-dangle
    this._handler._timelineTo?.destroy();

    const index = Math.round(this._handler.progress);

    this._handler.to({ value: index + 1, duration: 2500 });
  }

  /** Go to previous slide */
  public prev() {
    // @ts-ignore
    // eslint-disable-next-line no-underscore-dangle
    this._handler._timelineTo?.destroy();

    const index = Math.round(this._handler.progress);

    this._handler.to({ value: index - 1, duration: 2500 });
  }

  /** Destroy the scene */
  public destroy() {
    this._gui.destroy();

    this._handler.destroy();

    this._pointsInstance.destroy();
    this._images.destroy();
  }
}
