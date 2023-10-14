interface IChessBoardFigureDescriptor {

}

export interface IChessBoardFigure {
  type: string;
  canMove: (board: any) => {};
}

export default class ChessBoardFigure {
  constructor(descriptor: IChessBoardFigureDescriptor) {

  }
}

export class ChessBoardFigureKing {

}