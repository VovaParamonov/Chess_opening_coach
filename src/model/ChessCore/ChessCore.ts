import ChessBoard, {
  IChessBoardDescriptor,
} from "@/model/ChessBoard/ChessBoard";
import ChessBoardFigure from "@/model/ChessBoard/ChessBoardFigure/ChessBoardFigure";

function cloneHistoryBranch(branch: [Coords, Coords][]): [Coords, Coords][] {
  return branch.map(
    coords =>
      coords.map(coordinate => [...coordinate] as Coords) as [Coords, Coords]
  );
}

export type Side = "white" | "black";
export type Coords = [number, number];

export interface IChessCoreDescription {
  mainHistory?: [Coords, Coords][];
  analyzeHistory?: [Coords, Coords][];
  historyBackOffset?: number;
  mainHistoryBoard?: IChessBoardDescriptor;
  board?: IChessBoardDescriptor;
  status?: ChessCoreStatus;
}

export type ChessCoreStatus = {
  isCheckMate: Side | null;
  deadFigures: ChessBoardFigure[];
};

export type MoveMapItem = { action: "attack" | "move" };

interface IChessCore {
  getTurn(): Side;
  getMoveMapFromCoords(coords: Coords): MoveMapItem[][];
  move(startCoords: Coords, targetCoords: Coords): ChessCore;
  getStatus(): ChessCoreStatus;
  getBoard(): ChessBoard;
  back(): ChessCore;
  forward(startCoords?: Coords, targetCoords?: Coords): ChessCore;
  inMainHistory(): boolean;
  resetHistory(): ChessCore;
}

export class ChessCore implements IChessCore {
  _mainHistory: [Coords, Coords][];
  _historyBackOffset: number;
  _analyzeHistory: [Coords, Coords][];
  _mainHistoryBoard: ChessBoard;
  _board: ChessBoard;
  _status: ChessCoreStatus;

  constructor(descriptor: IChessCoreDescription) {
    this._mainHistory = descriptor.mainHistory || [];
    this._board = new ChessBoard(
      descriptor.board ? descriptor.board : undefined
    );
    this._mainHistoryBoard = descriptor.mainHistoryBoard
      ? new ChessBoard(descriptor.mainHistoryBoard)
      : this._board.clone();
    this._historyBackOffset = descriptor.historyBackOffset || 0;
    this._analyzeHistory = descriptor.analyzeHistory || [];
    this._status = descriptor.status || {
      isCheckMate: null,
      deadFigures: [],
    };
  }

  getTurn(): Side {
    return (this._mainHistory.length -
      this._historyBackOffset +
      this._analyzeHistory.length) %
      2 !==
      0
      ? "black"
      : "white";
  }

  getBoard(): ChessBoard {
    return this._board;
  }

  inMainHistory(): boolean {
    return !!(this._analyzeHistory.length || this._historyBackOffset);
  }

  resetHistory(): ChessCore {
    return this.clone({
      board: this._mainHistoryBoard.toDescriptor(),
      historyBackOffset: 0,
      analyzeHistory: [],
    });
  }

  toDescriptor(): IChessCoreDescription {
    return {
      board: this._board.toDescriptor(),
      mainHistoryBoard: this._mainHistoryBoard?.toDescriptor(),
      mainHistory: cloneHistoryBranch(this._mainHistory),
      historyBackOffset: this._historyBackOffset,
      analyzeHistory: cloneHistoryBranch(this._analyzeHistory),
    };
  }

  clone(changes: IChessCoreDescription): ChessCore {
    return new ChessCore({
      ...this.toDescriptor(),
      ...changes,
    });
  }

  move(startCoords: Coords, targetCoords: Coords): ChessCore {
    // TODO: Add status updating
    try {
      const startFigureSide = this._board
        .getCell(startCoords)
        .getCurrentFigure()
        ?.getSide();

      if (!startFigureSide) {
        throw new Error("There's no figure at the tart pos");
      }

      if (startFigureSide !== this.getTurn()) {
        throw new Error("Not you're turn");
      }

      const newBoard = this._board
        .updateFigurePosition(startCoords, targetCoords)
        .toDescriptor();

      return this.clone({
        board: newBoard,
        mainHistory: cloneHistoryBranch([
          ...this._mainHistory,
          [startCoords, targetCoords],
        ]),
        mainHistoryBoard: newBoard,
      });
    } catch (e) {
      console.error("Impossible move via the err: ", e);
      return this;
    }
  }

  getStatus(): ChessCoreStatus {
    return this._status;
  }

  // TODO: Implement analyze mode version of logic
  // TODO: Implement analyzeHistoryBackOffset
  forward(startCoords?: Coords, targetCoords?: Coords): ChessCore {
    try {
      let newBoard: ChessBoard = null;
      let newbranchForward: [Coords, Coords][];
      let newBranchBak: [Coords, Coords][];

      if (startCoords && targetCoords) {
        newBoard = this._board.updateFigurePosition(startCoords, targetCoords);
        newbranchForward = cloneHistoryBranch([
          ...this._historyBranchForward,
          [startCoords, targetCoords],
        ]);
      }

      return this.clone({});
    } catch (e) {
      console.error("Impossible forward via the err: ", e);
      return this;
    }
  }

  back(): ChessCore {
    if (this._analyzeHistory) {
      return this.clone({
        analyzeHistory: this._analyzeHistory.slice(0, -1),
      });
    }

    return this.clone({
      historyBackOffset: this._historyBackOffset + 1,
    });
  }
}
