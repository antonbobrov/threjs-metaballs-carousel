import { clampScope, easing, spreadScope } from '@anton.bobrov/vevet-init';
import {
  TCreateDatGuiSettingsReturns,
  createDatGuiSettings,
} from '@anton.bobrov/react-dat-gui';
import { TProps, TRow } from './types';

const COUNT = 10;

export class Points {
  private _gui: TCreateDatGuiSettingsReturns<TProps>;

  private get props() {
    return this._gui.current;
  }

  private _rows: TRow[] = [];

  get points() {
    return this._rows.map((row) => row.points).flat();
  }

  private _elements: (HTMLElement | undefined)[] = [];

  constructor(initialProps: TProps) {
    this._gui = createDatGuiSettings({
      name: `${initialProps.name} Points`,
      data: initialProps,
      parameters: {
        rowShift: { type: 'number', min: 0.75, max: 1, step: 0.0001 },
        isReverse: { type: 'boolean' },
      },
    });

    this._createPoints();
  }

  /** Create points */
  private _createPoints() {
    const { hasDomHelpers } = this.props;

    let index = 0;

    // create rows
    for (let iy = 0; iy <= COUNT; iy += 1) {
      const points: TRow['points'] = [];

      // create points
      for (let ix = 0; ix <= COUNT; ix += 1) {
        const x = ix / COUNT;
        const y = iy / COUNT;

        points.push({
          index,
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
          progress: 0,
          xDirection: Math.random() > 0.5 ? 1 : -1,
          xMove: Math.random() * 0.25,
        });

        const element = hasDomHelpers ? this._createElement(x, y) : undefined;
        this._elements[index] = element;

        index += 1;
      }

      const pointsSpreadScopes = spreadScope(points.length, 0.9).sort(
        () => Math.random() - 0.5,
      );

      this._rows.push({ length: points.length, points, pointsSpreadScopes });
    }
  }

  /** Create a DOM helper element */
  private _createElement(x: number, y: number) {
    const { container } = this.props;

    const size = 50;

    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = `${x * 100}%`;
    element.style.top = `${y * 100}%`;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.margin = `${size / -2}px 0 0 ${size / -2}px`;

    element.style.borderRadius = '50%';
    element.style.border = '1px solid white';
    element.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';

    container.appendChild(element);

    return element;
  }

  /** Normalize progress */
  private _normalizeProgress(progress: number) {
    return progress < 0 ? 1 - Math.abs(progress % 1) : progress % 1;
  }

  /** Render points */
  public render(globalProgressPro: number) {
    const { isReverse, rowShift } = this.props;

    const rows = isReverse ? [...this._rows].reverse() : this._rows;
    const progress = this._normalizeProgress(globalProgressPro);
    const rowsSpreadScopes = spreadScope(rows.length, rowShift);

    // calc rows
    rows.forEach((row, rowIndex) => {
      const rowScope = rowsSpreadScopes[rowIndex];
      const rowProgress = clampScope(progress, rowScope);

      // calc points
      row.points.forEach((point, pointIndex) => {
        const pointScope = row.pointsSpreadScopes[pointIndex];

        point.progress = easing(clampScope(rowProgress, pointScope));

        point.currentX =
          point.startX + point.progress * point.xMove * point.xDirection;

        point.currentY = point.startY - point.progress * 1.25;

        // render dom helpers
        const element = this._elements[point.index];
        if (element) {
          element.style.top = `${point.currentY * 100}%`;
          element.style.left = `${point.currentX * 100}%`;
        }
      });
    });
  }

  /** Destroy points */
  public destroy() {
    this._gui.destroy();

    this._elements.forEach((element) => element?.remove());
  }
}
