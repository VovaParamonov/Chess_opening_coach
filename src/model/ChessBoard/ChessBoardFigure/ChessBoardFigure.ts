import { ChessBoardRows } from "@/model/ChessBoard/ChessBoard";
import ChessBoardCell from "@/model/ChessBoard/ChessBoardCell/ChessBoardCell";

function checkFiguresBetweenCells(
  board: ChessBoardRows,
  startCoords: [number, number],
  targetCoords: [number, number]
) {
  const xDiff = targetCoords[0] - startCoords[0];
  const yDiff = targetCoords[1] - startCoords[1];

  // Too close
  if (xDiff <= 1 && yDiff <= 1) {
    return false;
  }

  // Diagonal
  if (xDiff !== 0 && yDiff !== 0 && Math.abs(xDiff) === Math.abs(yDiff)) {
    for (let i = startCoords[0] + 1; i < targetCoords[0]; i++) {
      for (let j = startCoords[1] + 1; j < targetCoords[1]; j++) {
        if (!board[i][j].isEmpty()) {
          return true;
        }
      }
    }

    return false;
  }

  // Horizontal
  if (Math.abs(xDiff) !== 0 && yDiff === 0) {
    const direction = xDiff / Math.abs(xDiff);

    for (let i = startCoords[0] + 1; i !== targetCoords[0]; i += direction) {
      if (!board[i][startCoords[1]].isEmpty()) {
        return true;
      }
    }

    return false;
  }

  // Vertical
  if (xDiff === 0 && Math.abs(yDiff) !== 0) {
    const direction = yDiff / Math.abs(yDiff);

    for (let j = startCoords[1] + 1; j !== targetCoords[1]; j += direction) {
      if (!board[startCoords[0]][j].isEmpty()) {
        return true;
      }
    }

    return false;
  }

  console.error(
    "Impossible cells coords for check figures between:",
    startCoords,
    targetCoords
  );
  throw new Error(`Impossible cells coords for check figures [details above]`);
}

interface IChessBoardFigureDescriptor<Type extends FigureType = FigureType> {
  type: Type;
  side: "white" | "black";
  icon: string;
}

export type FigureType =
  | "king"
  | "queen"
  | "rook"
  | "bishop"
  | "knights"
  | "pawn";

export interface IChessBoardFigure {
  getType(): FigureType;

  getSide(): "white" | "black";

  canPlaced(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean;

  canMove(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean;

  canAttack(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean;

  getIcon(): string;
}

export default abstract class ChessBoardFigure implements IChessBoardFigure {
  protected _type: FigureType;
  protected _side: "white" | "black";
  protected _icon: string;

  protected constructor(descriptor: IChessBoardFigureDescriptor) {
    this._type = descriptor.type;
    this._side = descriptor.side;
    this._icon = descriptor.icon;
  }

  canPlaced(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean {
    return (
      this.canMove(board, startCoords, targetCoords) ||
      this.canAttack(board, startCoords, targetCoords)
    );
  }

  toDescriptor(): IChessBoardFigureDescriptor {
    return {
      type: this._type,
      side: this._side,
      icon: this._icon,
    };
  }

  getSide(): "white" | "black" {
    return this._side;
  }

  getIcon(): string {
    return this._icon;
  }

  getType(): FigureType {
    return this._type;
  }

  protected _isEnemyOnCell(cell: ChessBoardCell) {
    return (
      !cell.isEmpty() && cell.getCurrentFigure()?.getSide() !== this.getSide()
    );
  }

  abstract canMove(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean;

  abstract canAttack(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean;

  static spawnFigure(
    type: "king",
    descriptor: IChessBoardFigureChildDescription
  ): ChessBoardFigureKing;
  static spawnFigure(
    type: "pawn",
    descriptor: IChessBoardFigureChildDescription
  ): ChessBoardFigurePawn;
  static spawnFigure(
    type: "bishop",
    descriptor: IChessBoardFigureChildDescription
  ): ChessBoardFigurePawn;
  static spawnFigure(
    type: "rook",
    descriptor: IChessBoardFigureChildDescription
  ): ChessBoardFigurePawn;
  static spawnFigure(
    type: "queen",
    descriptor: IChessBoardFigureChildDescription
  ): ChessBoardFigurePawn;
  static spawnFigure(
    type: "knights",
    descriptor: IChessBoardFigureChildDescription
  ): ChessBoardFigurePawn;
  static spawnFigure(
    type: FigureType,
    descriptor: IChessBoardFigureChildDescription
  ): InstanceType<typeof figuresMap[keyof typeof figuresMap]>;
  static spawnFigure(
    type: FigureType,
    descriptor: IChessBoardFigureChildDescription
  ) {
    const figureClass = figuresMap[type];

    return new figureClass(descriptor);
  }
}

type IChessBoardFigureChildDescription = Omit<
  IChessBoardFigureDescriptor,
  "type" | "icon"
>;

export class ChessBoardFigureKing extends ChessBoardFigure {
  constructor(descriptor: IChessBoardFigureChildDescription) {
    super({
      ...descriptor,
      type: "king",
      icon: "K",
    });
  }

  canMove(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean {
    return (
      Math.abs(targetCoords[0] - startCoords[0]) <= 1 &&
      Math.abs(targetCoords[1] - startCoords[1]) <= 1 &&
      board[targetCoords[0]][targetCoords[1]].isEmpty()
    );
  }

  canAttack(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean {
    return (
      Math.abs(targetCoords[0] - startCoords[0]) <= 1 &&
      Math.abs(targetCoords[1] - startCoords[1]) <= 1 &&
      this._isEnemyOnCell(board[targetCoords[0]][targetCoords[1]])
    );
  }
}

export class ChessBoardFigurePawn extends ChessBoardFigure {
  constructor(descriptor: IChessBoardFigureChildDescription) {
    super({
      ...descriptor,
      type: "pawn",
      icon: "P",
    });
  }

  canMove(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean {
    // Exclude move on x line
    // Exclude nonEmpty field
    if (
      targetCoords[1] - startCoords[1] !== 0 ||
      !board[targetCoords[0]][targetCoords[1]].isEmpty()
    ) {
      return false;
    }

    const yDiff = targetCoords[0] - startCoords[0];

    // If first step of pawn
    if (
      (this.getSide() === "white" && startCoords[0] === 1) ||
      (this.getSide() === "black" && startCoords[0] === 6)
    ) {
      return (
        (this.getSide() === "white"
          ? yDiff === 2 || yDiff === 1
          : yDiff === -2 || yDiff === -1) &&
        !checkFiguresBetweenCells(board, startCoords, targetCoords)
      );
    }

    return this.getSide() === "white" ? yDiff === 1 : yDiff === -1;
  }

  canAttack(
    board: ChessBoardRows,
    startCoords: [number, number],
    targetCoords: [number, number]
  ): boolean {
    // TODO: Handle attack on enemy first step

    return (
      (this.getSide() === "white"
        ? targetCoords[0] - startCoords[0] === 1
        : targetCoords[0] - startCoords[0] === -1) &&
      Math.abs(targetCoords[1] - startCoords[1]) === 1 &&
      this._isEnemyOnCell(board[targetCoords[0]][targetCoords[1]])
    );
  }

  turnInto(type: Exclude<FigureType, "pawn" | "king">) {
    switch (type) {
      case "knights":
        return ChessBoardFigure.spawnFigure(type, this.toDescriptor());
      case "bishop":
        return ChessBoardFigure.spawnFigure(type, this.toDescriptor());
      case "queen":
        return ChessBoardFigure.spawnFigure(type, this.toDescriptor());
      case "rook":
        return ChessBoardFigure.spawnFigure(type, this.toDescriptor());
    }
  }
}

export const figuresMap = {
  king: ChessBoardFigureKing,
  pawn: ChessBoardFigurePawn,
  bishop: ChessBoardFigurePawn,
  rook: ChessBoardFigurePawn,
  queen: ChessBoardFigurePawn,
  knights: ChessBoardFigurePawn,
};
