import ChessBoardCell from './ChessBoardCell/Model';

interface IChessBoardDescriptor {
  board?: ChessBoardCell[][];
}

interface IChessBoard {
  board: ChessBoardCell[][];
}

export default class ChessBoard implements IChessBoard {
  board: ChessBoardCell[][];
  constructor(descriptor?: IChessBoardDescriptor) {
    this.board = descriptor?.board || ChessBoard.initBoard();
  }

  static initBoard(): ChessBoardCell[][] {
    const newBoard: ChessBoardCell[][] = [];

    for (let i = 0; i < 8; i++) {
      newBoard.push([]);
      for (let j = 0; j < 8; j++) {
        newBoard[i].push(new ChessBoardCell({
          coords: [i, j]
        }));
      }
    }

    return newBoard;
  }
}