import ChessBoardCell from "./ChessBoardCell/ChessBoardCell";
import ChessBoardFigure, {
  FigureType,
  IChessBoardFigureChildDescription,
} from "./ChessBoardFigure/ChessBoardFigure";
import { Coords } from "@/model/ChessCore/ChessCore";

export function getChessBoardStartMap(): (
  | (IChessBoardFigureChildDescription & { type: FigureType })
  | null
)[][] {
  function b(desc: {
    type: FigureType;
  }): IChessBoardFigureChildDescription & { type: FigureType } {
    return { ...desc, side: "black" };
  }
  function w(desc: {
    type: FigureType;
  }): IChessBoardFigureChildDescription & { type: FigureType } {
    return { ...desc, side: "white" };
  }

  const king: { type: FigureType } = {
    type: "king",
  };
  const pawn: { type: FigureType } = {
    type: "pawn",
  };
  const bishop: { type: FigureType } = {
    type: "bishop",
  };
  const queen: { type: FigureType } = {
    type: "queen",
  };
  const rook: { type: FigureType } = {
    type: "rook",
  };
  const knight: { type: FigureType } = {
    type: "knight",
  };

  return [
    [
      w(rook),
      w(knight),
      w(bishop),
      w(king),
      w(queen),
      w(bishop),
      w(knight),
      w(rook),
    ],
    [w(pawn), w(pawn), w(pawn), w(pawn), w(pawn), w(pawn), w(pawn), w(pawn)],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [b(pawn), b(pawn), b(pawn), b(pawn), b(pawn), b(pawn), b(pawn), b(pawn)],
    [
      b(rook),
      b(knight),
      b(bishop),
      b(king),
      b(queen),
      b(bishop),
      b(knight),
      b(rook),
    ],
  ];
}

export type ChessBoardRows = ChessBoardCell[][];

export interface IChessBoardDescriptor {
  rows?: ChessBoardRows;
  deadFigures?: ChessBoardFigure[];
}

export interface IChessBoard {
  getRows(): ChessBoardRows;

  getCell(coords: Coords): ChessBoardCell;

  updateCell(coords: Coords, newCell: ChessBoardCell): ChessBoard;

  getDeadFigures(): ChessBoardFigure[];

  clone(changes: Partial<IChessBoardDescriptor>): ChessBoard;

  toDescriptor(): IChessBoardDescriptor;

  updateFigurePosition(startCoords: Coords, targetCoords: Coords): ChessBoard;
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

  getCell(coords: Coords): ChessBoardCell {
    const rows = this.getRows();

    return rows[coords[0]][coords[1]];
  }

  updateCell(coords: Coords, newCell: ChessBoardCell): ChessBoard {
    const newRows = this.getRows();

    newRows[coords[0]][coords[1]] = newCell;

    return this.clone({
      rows: newRows,
    });
  }

  getRows(): ChessBoardRows {
    return this._rows.map(row => [...row]);
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

  updateFigurePosition(startCoords: Coords, targetCoords: Coords): ChessBoard {
    const startCell = this.getCell(startCoords).clone();
    const targetCell = this.getCell(targetCoords).clone();

    if (startCell.isEmpty()) {
      throw new Error("There's no figure at start cell");
    }

    if (
      !targetCell.isEmpty() &&
      targetCell.getCurrentFigure()?.getSide() ===
        startCell.getCurrentFigure()?.getSide()
    ) {
      throw new Error("You can't attack you're side");
    }

    const newRows = [...this.getRows()];

    newRows[startCoords[0]][startCoords[1]] = startCell.clear();
    newRows[targetCoords[0]][targetCoords[1]] = targetCell.setCurrentFigure(
      startCell.getCurrentFigure()!
    );

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

  static getStartFigureByCoords(coords: Coords) {
    const chessBoardStartMap = getChessBoardStartMap();

    const initFigureDescription = chessBoardStartMap[coords[0]][coords[1]];

    if (initFigureDescription === null) {
      return null;
    }

    const { side, type } = initFigureDescription;

    return ChessBoardFigure.spawnFigure(type, { side });
  }
}
