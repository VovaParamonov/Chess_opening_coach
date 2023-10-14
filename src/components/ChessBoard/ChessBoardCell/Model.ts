import { IChessBoardFigure } from '@/components/ChessBoard/ChessBoardFigure/Model';

export interface IChessBoardCellDescriptor {
  coords: [number, number];
  currentFigure?: IChessBoardFigure;
}

export interface IChessBoardCell {
  coords: [number, number];
  currentFigure: IChessBoardFigure | null;
}

export default class ChessBoardCell implements  IChessBoardCell {
  coords: [number, number];
  currentFigure: IChessBoardFigure | null;
  constructor(descriptor: IChessBoardCellDescriptor) {
    this.coords = descriptor.coords;
    this.currentFigure = descriptor.currentFigure || null;
  }

  getColor() {
    const xIsEven = this.coords[0] % 2 === 0;
    const yIsEven = this.coords[1] % 2 === 0;

    return xIsEven === yIsEven ? 'black' : 'white';
  }
}
