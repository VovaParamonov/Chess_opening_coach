import ChessBoardCell from "./ChessBoardCell/ChessBoardCell";
import ChessBoardFigure, {
  FigureType,
  IChessBoardFigureChildDescription,
} from './ChessBoardFigure/ChessBoardFigure';

function getChessBoardStartMap(): (IChessBoardFigureChildDescription & { type: FigureType } | null)[][] {
  const wKing: IChessBoardFigureChildDescription & { type: FigureType } = {
    type: 'king',
    side: 'white'
  };
  const bKing: IChessBoardFigureChildDescription & { type: FigureType } = {
    type: 'king',
    side: 'black'
  };
  const wPawn: IChessBoardFigureChildDescription & { type: FigureType } = {
    type: 'pawn',
    side: 'white'
  }
  const bPawn: IChessBoardFigureChildDescription & { type: FigureType } = {
    type: 'pawn',
    side: 'black'
  }
  
  return [
    [null, null, null, wKing, null, null, null, null],
    [wPawn, wPawn, wPawn, wPawn, wPawn, wPawn, wPawn, wPawn],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [bPawn, bPawn, bPawn, bPawn, bPawn, bPawn, bPawn, bPawn],
    [null, null, null, bKing, null, null, null, null],
  ];
}


export type ChessBoardRows = ChessBoardCell[][];

interface IChessBoardDescriptor {
  rows?: ChessBoardRows;
  deadFigures?: ChessBoardFigure[];
}

export interface IChessBoard {
  getRows(): ChessBoardRows;

  getCell(coords: [number, number]): ChessBoardCell;

  updateCell(coords: [number, number], newCell: ChessBoardCell): ChessBoard;

  getDeadFigures(): ChessBoardFigure[];

  clone(changes: Partial<IChessBoardDescriptor>): ChessBoard;

  toDescriptor(): IChessBoardDescriptor;

  updateFigurePosition(
    startCoords: [number, number],
    targetCoords: [number, number]
  ): ChessBoard;
}

export default class ChessBoard implements IChessBoard {
  private _rows: ChessBoardRows;
  private _deadFigures: ChessBoardFigure[];

  constructor(descriptor?: IChessBoardDescriptor) {
    this._rows = descriptor?.rows || ChessBoard.initBoard();
    this._deadFigures = descriptor?.deadFigures || [];
  }

  getDeadFigures() {
    return this._deadFigures;
  }

  getCell(coords: [number, number]): ChessBoardCell {
    const rows = this.getRows();

    return rows[coords[0]][coords[1]];
  }

  updateCell(coords: [number, number], newCell: ChessBoardCell): ChessBoard {
    const newRows = this.getRows();

    newRows[coords[0]][coords[1]] = newCell;

    return this.clone({
      rows: newRows
    });
  }

  getRows(): ChessBoardRows {
    return [...this._rows];
  }

  toDescriptor(): IChessBoardDescriptor {
    return {
      rows: this._rows.map(row => row.map(cell => cell.clone())),
      deadFigures: this._deadFigures.map(f => f.clone()),
    };
  }

  clone(changes?: Partial<IChessBoardDescriptor>): ChessBoard {
    return new ChessBoard({
      ...this.toDescriptor(),
      ...(changes || {}),
    });
  }

  updateFigurePosition(
    startCoords: [number, number],
    targetCoords: [number, number]
  ): ChessBoard {
    const startCell = this.getCell(startCoords);
    const targetCell = this.getCell(targetCoords);

    if (startCell.isEmpty()) {
      throw new Error("There's no figure at start cell");
    }

    if (targetCell.getCurrentFigure()?.getType() === "king") {
      throw new Error("You can't attack king");
    }

    if (
      !targetCell.isEmpty() &&
      targetCell.getCurrentFigure()?.getSide() ===
        startCell.getCurrentFigure()?.getSide()
    ) {
      throw new Error("You can't attack you're side");
    }

    const newRows = [...this.getRows()];

    newRows[startCoords[0]][startCoords[1]] = startCell.clone({
      currentFigure: null,
    });
    newRows[targetCoords[0]][targetCoords[1]] = targetCell.clone({
      currentFigure: startCell.getCurrentFigure(),
    });

    return this.clone({
      rows: newRows,
    });
  }

  static initBoard(): ChessBoardRows {
    const rows: ChessBoardRows = [];

    for (let i = 0; i < 8; i++) {
      rows.push([]);
      for (let j = 0; j < 8; j++) {
        rows[i].push(
          new ChessBoardCell({
            coords: [i, j],
            currentFigure: ChessBoard.getStartFigureByCoords([i, j]),
          })
        );
      }
    }

    return rows;
  }

  static getStartFigureByCoords(coords: [number, number]) {
    const chessBoardStartMap = getChessBoardStartMap();

    const initFigureDescription = chessBoardStartMap[coords[0]][coords[1]];

    if (initFigureDescription === null) {
      return null;
    }

    const {
      side,
      type
    } = initFigureDescription;

    return ChessBoardFigure.spawnFigure(type, { side });
  }
}
