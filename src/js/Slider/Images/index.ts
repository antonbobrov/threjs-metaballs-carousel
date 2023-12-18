import { Mesh, PlaneGeometry, ShaderMaterial, Texture } from 'three';
import { Ctx2DPrerender, NCallbacks } from '@anton.bobrov/vevet-init';
import {
  TCreateDatGuiSettingsReturns,
  createDatGuiSettings,
} from '@anton.bobrov/react-dat-gui';
import { TRenderProps, TProps } from './types';
import { TPoint } from '../Points/types';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import noise from './shaders/noise.glsl';

export class Images {
  private _gui: TCreateDatGuiSettingsReturns<TProps>;

  get props() {
    return this._gui.current;
  }

  private _startSize: { width: number; height: number };

  private _textures: Texture[] = [];

  private _mesh: Mesh;

  private _geometry: PlaneGeometry;

  private _material: ShaderMaterial;

  private _managerEvents: NCallbacks.IAddedCallback[] = [];

  private _points: TPoint[] = [];

  get points() {
    return this._points;
  }

  set points(value: TPoint[]) {
    this._material.uniforms.u_points.value = value;
    this._material.defines.POINTS_COUNT = value.length;

    this._points = value;
  }

  private get aspectRatio() {
    const { manager } = this.props;

    return manager.width / manager.height;
  }

  get count() {
    return this.props.images.length;
  }

  constructor(initialProps: TProps) {
    this._gui = createDatGuiSettings({
      name: `${initialProps.name} Images`,
      data: initialProps,
      parameters: {
        time: { type: 'number', min: 0, max: 0.05, step: 0.0001 },
        textureNoiseShift: { type: 'number', min: 0, max: 300, step: 1 },
        textureNoiseScale: { type: 'number', min: 0, max: 0.2, step: 0.0001 },
        metaballsNoiseShift: { type: 'number', min: 0, max: 300, step: 1 },
        metaballsNoiseScale: {
          type: 'number',
          min: 0,
          max: 0.02,
          step: 0.0001,
        },
      },
      onChange: ({
        textureNoiseShift,
        textureNoiseScale,
        metaballsNoiseShift,
        metaballsNoiseScale,
      }) => {
        this._material.uniforms.u_textureNoiseShift.value = textureNoiseShift;
        this._material.uniforms.u_textureNoiseScale.value = textureNoiseScale;

        this._material.uniforms.u_metaballsNoiseShift.value =
          metaballsNoiseShift;
        this._material.uniforms.u_metaballsNoiseScale.value =
          metaballsNoiseScale;
      },
    });

    const { manager } = initialProps;

    // save initial size
    this._startSize = {
      width: manager.width,
      height: manager.height,
    };

    // create geometry
    this._geometry = new PlaneGeometry(
      this._startSize.width,
      this._startSize.height,
    );

    // create textures
    this._prerenderTextures();

    // create shader material
    this._material = new ShaderMaterial({
      vertexShader,
      fragmentShader: noise + fragmentShader,
      uniforms: {
        u_aspect: { value: this.aspectRatio },
        u_time: { value: 0 },
        u_radius: { value: 0.007 },
        u_loopProgress: { value: 0 },
        u_textureNoiseShift: { value: this.props.textureNoiseShift },
        u_textureNoiseScale: { value: this.props.textureNoiseScale },
        u_metaballsNoiseShift: { value: this.props.metaballsNoiseShift },
        u_metaballsNoiseScale: { value: this.props.metaballsNoiseScale },
        u_textures: { value: this._textures },
        u_points: { value: this.points },
      },
      defines: {
        TEXTURES_COUNT: this._textures.length,
        POINTS_COUNT: this.points.length,
        PREV_INDEX: 0,
        NEXT_INDEX: 0,
      },
    });

    // create mesh
    this._mesh = new Mesh(this._geometry, this._material);
    manager.scene.add(this._mesh);

    // resize
    this._managerEvents.push(
      manager.callbacks.add('resize', () => this._resize()),
    );
  }

  /** Resize the scene */
  private _resize() {
    const { _startSize: startSize, props } = this;

    const { width, height } = props.manager;
    const widthScale = width / startSize.width;
    const heightScale = height / startSize.height;

    // set mesh scale
    this._mesh.scale.set(widthScale, heightScale, 1);

    // update aspect ratio
    this._material.uniforms.u_aspect.value = this.aspectRatio;

    // rerender textures
    this._prerenderTextures();
  }

  /** Prerender textures */
  private _prerenderTextures() {
    const { manager, images } = this.props;

    this._textures.forEach((texture) => texture.dispose());

    this._textures = images.map((image) => {
      const ctx2d = new Ctx2DPrerender({
        width: manager.width,
        height: manager.height,
        dpr: 1,
        media: image,
        posRule: 'cover',
        hasResize: false,
      });
      ctx2d.resize();

      const texture = new Texture(ctx2d.canvas);
      texture.needsUpdate = true;

      return texture;
    });

    if (this._material) {
      this._material.uniforms.u_textures.value = this._textures;
    }
  }

  /** Render the scene */
  public render({ loopProgress, prevIndex, nextIndex }: TRenderProps) {
    const { uniforms } = this._material;

    uniforms.u_time.value += this.props.time;
    uniforms.u_loopProgress.value = loopProgress;

    this._material.defines.PREV_INDEX = prevIndex;
    this._material.defines.NEXT_INDEX = nextIndex;
    this._material.needsUpdate = true;
  }

  /** Destroy the scene */
  destroy() {
    this._gui.destroy();

    this.props.manager.scene.remove(this._mesh);
    this._material.dispose();
    this._geometry.dispose();

    this._managerEvents.forEach((event) => event.remove());
  }
}
