import ChessBoardFigure, {
  IChessBoardFigure,
} from "../ChessBoardFigure/ChessBoardFigure";

export interface IChessBoardCellDescriptor {
  coords: [number, number];
  currentFigure?: ChessBoardFigure | null;
}

export interface IChessBoardCell {
  getColor(): string;

  getCoords(): [number, number];

  getCurrentFigure(): IChessBoardFigure | null;

  change(changes: Partial<IChessBoardCellDescriptor>): ChessBoardCell;

  toDescriptor(): IChessBoardCellDescriptor;

  isOnCoords(coords: [number, number]): boolean;
}

export default class ChessBoardCell implements IChessBoardCell {
  private _coords: [number, number];
  private _currentFigure: ChessBoardFigure | null;

  constructor(descriptor: IChessBoardCellDescriptor) {
    this._coords = descriptor.coords;
    this._currentFigure = descriptor.currentFigure || null;
  }

  getCoords() {
    return this._coords;
  }

  getCurrentFigure(): ChessBoardFigure | null {
    return this._currentFigure;
  }

  getColor() {
    const xIsEven = this._coords[0] % 2 === 0;
    const yIsEven = this._coords[1] % 2 === 0;

    return xIsEven === yIsEven ? "black" : "white";
  }

  isEmpty() {
    return !this._currentFigure;
  }

  toDescriptor(): IChessBoardCellDescriptor {
    return {
      coords: this._coords,
      currentFigure: this._currentFigure,
    };
  }

  isOnCoords(coords: [number, number]): boolean {
    return this._coords[0] === coords[0] && this._coords[1] === coords[1];
  }

  change(changes: Partial<IChessBoardCellDescriptor>): ChessBoardCell {
    return new ChessBoardCell({
      ...this.toDescriptor(),
      ...changes,
    });
  }
}
