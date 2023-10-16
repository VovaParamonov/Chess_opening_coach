import ChessBoardCell from "./ChessBoardCell/ChessBoardCell";
import ChessBoardFigure, {
  FigureType,
  IChessBoardFigure,
} from "./ChessBoardFigure/ChessBoardFigure";

const chessBoardStartMap: (FigureType | null)[][] = [
  [null, null, null, "king", null, null, null, null],
  ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, "king", null, null, null, null],
  [null, null, null, "king", null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"],
  [null, null, null, "king", null, null, null, null],
];

export type ChessBoardRows = ChessBoardCell[][];

interface IChessBoardDescriptor {
  rows?: ChessBoardRows;
  deadFigures?: ChessBoardFigure[];
}

export interface IChessBoard {
  getRows(): ChessBoardRows;

  getDeadFigures(): ChessBoardFigure[];

  change(changes: Partial<IChessBoardDescriptor>): ChessBoard;

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

  getRows(): ChessBoardRows {
    return this._rows;
  }

  toDescriptor(): IChessBoardDescriptor {
    return {
      rows: this._rows,
      deadFigures: this._deadFigures,
    };
  }

  change(changes: Partial<IChessBoardDescriptor>): ChessBoard {
    return new ChessBoard({
      ...this.toDescriptor(),
      ...changes,
    });
  }

  updateFigurePosition(
    startCoords: [number, number],
    targetCoords: [number, number]
  ): ChessBoard {
    const startCell = this._rows[startCoords[0]][startCoords[1]];
    const targetCell = this._rows[targetCoords[0]][targetCoords[1]];

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

    const newRow = this._rows;

    newRow[startCoords[0]][startCoords[1]] = startCell.change({
      currentFigure: null,
    });
    newRow[targetCoords[0]][targetCoords[1]] = targetCell.change({
      currentFigure: startCell.getCurrentFigure(),
    });

    return this.change({
      rows: newRow,
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
    const side = coords[0] > 3 ? "black" : "white";

    const type = chessBoardStartMap[coords[0]][coords[1]];

    if (type === null) {
      return null;
    }

    return ChessBoardFigure.spawnFigure(type, { side });
  }
}
