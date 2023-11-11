import ChessBoard from "@/model/ChessBoard/ChessBoard";
import ChessBoardCell from "@/model/ChessBoard/ChessBoardCell/ChessBoardCell";
import { iconMap } from "@/model/ChessBoard/ChessBoardFigure/figureIcons";
import { Coords, Side } from "@/model/ChessCore/ChessCore";

function checkKingIsUnderAttack(board: ChessBoard, side: Side) {
  const boardRows = board.getRows();
  let kingCell: ChessBoardCell | null = null;

  for (const row of boardRows) {
    for (const cell of row) {
      const figure = cell.getCurrentFigure();
      if (figure && figure.getType() === "king" && figure.getSide() === side) {
        kingCell = cell;
        break;
      }
      if (kingCell) {
        break;
      }
    }
  }

  return boardRows.some(row =>
    row.some(cell => {
      const figure = cell.getCurrentFigure();

      return (
        figure &&
        figure.getSide() !== side &&
        figure.canAttack(board, cell.getCoords(), kingCell!.getCoords(), true)
      );
    })
  );
}

function checkCellIsUnderAttack(
  board: ChessBoard,
  side: Side,
  coords: Coords
) {
  const boardRows = board.getRows();

  return boardRows.some(row =>
    row.some(cell => {
      const figure = cell.getCurrentFigure();

      return (
        figure &&
        figure.getSide() !== side &&
        figure.canAttack(board, cell.getCoords(), coords)
      );
    })
  );
}

function checkFiguresBetweenCells(
  board: ChessBoard,
  startCoords: Coords,
  targetCoords: Coords
) {
  const boardRows = board.getRows();
  const xDiff = targetCoords[0] - startCoords[0];
  const yDiff = targetCoords[1] - startCoords[1];

  // Too close
  if (Math.abs(xDiff) <= 1 && Math.abs(yDiff) <= 1) {
    return false;
  }

  const xDir = xDiff / Math.abs(xDiff);
  const yDir = yDiff / Math.abs(yDiff);

  // Diagonal
  if (Math.abs(xDiff) === Math.abs(yDiff)) {
    for (
      let counter = 1;
      counter < Math.min(Math.abs(xDiff), Math.abs(yDiff));
      counter++
    ) {
      if (
        !boardRows[startCoords[0] + counter * xDir][
          startCoords[1] + counter * yDir
        ].isEmpty()
      ) {
        return true;
      }
    }

    return false;
  }

  // Horizontal
  if (Math.abs(xDiff) !== 0 && yDiff === 0) {
    for (let i = startCoords[0] + xDir; i !== targetCoords[0]; i += xDir) {
      if (!boardRows[i][startCoords[1]].isEmpty()) {
        return true;
      }
    }

    return false;
  }

  // Vertical
  if (xDiff === 0 && Math.abs(yDiff) !== 0) {
    for (let j = startCoords[1] + yDir; j !== targetCoords[1]; j += yDir) {
      if (!boardRows[startCoords[0]][j].isEmpty()) {
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

export interface IChessBoardFigureDescriptor<
  Type extends FigureType = FigureType
> {
  type: Type;
  side: Side;
}

export type FigureType =
  | "king"
  | "queen"
  | "rook"
  | "bishop"
  | "knight"
  | "pawn";

export interface IChessBoardFigure {
  getType(): FigureType;

  getSide(): Side;

  canPlaced(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
  ): boolean;

  canMove(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
  ): boolean;

  canAttack(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords,
    ignoreKingUnderAttackChecking?: true
  ): boolean;

  getIcon(): string;

  clone(changes?: Partial<IChessBoardFigureDescriptor>): ChessBoardFigure;

  compare(figure: ChessBoardFigure): boolean;
}

abstract class ChessBoardFigure implements IChessBoardFigure {
  protected _type: FigureType;
  protected _side: Side;

  protected constructor(descriptor: IChessBoardFigureDescriptor) {
    this._type = descriptor.type;
    this._side = descriptor.side;
  }

  compare(figure: ChessBoardFigure): boolean {
    return (
      figure.getType() === this.getType() && figure.getSide() === this.getSide()
    );
  }

  canPlaced(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
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
    };
  }

  getSide(): Side {
    return this._side;
  }

  getIcon(): string {
    return iconMap[`${this._type}_${this._side[0]}` as keyof typeof iconMap];
  }

  getType(): FigureType {
    return this._type;
  }

  protected _isEnemyOnCell(cell: ChessBoardCell) {
    return (
      !cell.isEmpty() && cell.getCurrentFigure()?.getSide() !== this.getSide()
    );
  }

  canMove(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
  ): boolean {
    let tmpBoard = board.clone();

    const startCell = tmpBoard.getCell(startCoords);
    const targetCell = tmpBoard.getCell(targetCoords);
    const startFigure = startCell.getCurrentFigure();

    // Check cells are empty
    if (!startFigure || !this.compare(startFigure) || !targetCell.isEmpty()) {
      return false;
    }

    tmpBoard = tmpBoard.updateFigurePosition(startCoords, targetCoords);

    if (checkKingIsUnderAttack(tmpBoard, this.getSide())) {
      return false;
    }

    return true;
  }

  canAttack(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords,
    ignoreKingUnderAttackChecking?: true
  ): boolean {
    if (!this._isEnemyOnCell(board.getCell(targetCoords))) {
      return false;
    }

    const tmpBoard = board.updateFigurePosition(startCoords, targetCoords);

    if (
      !ignoreKingUnderAttackChecking &&
      checkKingIsUnderAttack(tmpBoard, this.getSide())
    ) {
      return false;
    }

    return true;
  }

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
  ): ChessBoardFigureBishop;
  static spawnFigure(
    type: "rook",
    descriptor: IChessBoardFigureChildDescription
  ): ChessBoardFigureRook;
  static spawnFigure(
    type: "queen",
    descriptor: IChessBoardFigureChildDescription
  ): ChessBoardFigureQueen;
  static spawnFigure(
    type: "knight",
    descriptor: IChessBoardFigureChildDescription
  ): ChessBoardFigureKnight;
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

  clone(changes?: Partial<IChessBoardFigureDescriptor>): ChessBoardFigure {
    return ChessBoardFigure.spawnFigure(this._type, {
      side: this._side,
      ...changes,
    });
  }
}

export type IChessBoardFigureChildDescription = Omit<
  IChessBoardFigureDescriptor,
  "type"
>;

export class ChessBoardFigureKing extends ChessBoardFigure {
  constructor(descriptor: IChessBoardFigureChildDescription) {
    super({
      ...descriptor,
      type: "king",
    });
  }

  canMove(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
  ): boolean {
    return (
      Math.abs(targetCoords[0] - startCoords[0]) <= 1 &&
      Math.abs(targetCoords[1] - startCoords[1]) <= 1 &&
      super.canMove(board, startCoords, targetCoords)
    );
  }

  canAttack(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords,
    ignoreKingUnderAttackChecking?: true
  ): boolean {
    return (
      Math.abs(targetCoords[0] - startCoords[0]) <= 1 &&
      Math.abs(targetCoords[1] - startCoords[1]) <= 1 &&
      !checkFiguresBetweenCells(board, startCoords, targetCoords) &&
      super.canAttack(
        board,
        startCoords,
        targetCoords,
        ignoreKingUnderAttackChecking
      )
    );
  }
}

export class ChessBoardFigurePawn extends ChessBoardFigure {
  constructor(descriptor: IChessBoardFigureChildDescription) {
    super({
      ...descriptor,
      type: "pawn",
    });
  }

  canMove(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
  ): boolean {
    // Exclude move on x line
    if (targetCoords[1] - startCoords[1] !== 0) {
      return false;
    }

    const yDiff = targetCoords[0] - startCoords[0];
    // TODO: Transfer to after math move pttern check
    if (!super.canMove(board, startCoords, targetCoords)) {
      return false;
    }

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
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords,
    ignoreKingUnderAttackChecking?: true
  ): boolean {
    // TODO: Handle attack on enemy first step

    return (
      (this.getSide() === "white"
        ? targetCoords[0] - startCoords[0] === 1
        : targetCoords[0] - startCoords[0] === -1) &&
      Math.abs(targetCoords[1] - startCoords[1]) === 1 &&
      super.canAttack(
        board,
        startCoords,
        targetCoords,
        ignoreKingUnderAttackChecking
      )
    );
  }

  turnInto(type: Exclude<FigureType, "pawn" | "king">) {
    switch (type) {
      case "knight":
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

class ChessBoardFigureBishop extends ChessBoardFigure {
  constructor(description: IChessBoardFigureChildDescription) {
    super({
      type: "bishop",
      ...description,
    });
  }

  checkMovePattern(
    startCoords: Coords,
    targetCoords: Coords
  ) {
    return (
      Math.abs(targetCoords[0] - startCoords[0]) ===
      Math.abs(targetCoords[1] - startCoords[1])
    );
  }

  canMove(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
  ): boolean {
    return (
      this.checkMovePattern(startCoords, targetCoords) &&
      !checkFiguresBetweenCells(board, startCoords, targetCoords) &&
      super.canMove(board, startCoords, targetCoords)
    );
  }

  canAttack(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords,
    ignoreKingUnderAttackChecking?: true
  ): boolean {
    return (
      this.checkMovePattern(startCoords, targetCoords) &&
      !checkFiguresBetweenCells(board, startCoords, targetCoords) &&
      super.canAttack(
        board,
        startCoords,
        targetCoords,
        ignoreKingUnderAttackChecking
      )
    );
  }
}

class ChessBoardFigureQueen extends ChessBoardFigure {
  constructor(description: IChessBoardFigureChildDescription) {
    super({
      type: "queen",
      ...description,
    });
  }

  checkMovePattern(
    startCoords: Coords,
    targetCoords: Coords
  ) {
    const yDiff = targetCoords[1] - startCoords[1];
    const xDiff = targetCoords[0] - startCoords[0];

    return Math.abs(xDiff) === Math.abs(yDiff) || yDiff === 0 || xDiff === 0;
  }

  canMove(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
  ): boolean {
    return (
      this.checkMovePattern(startCoords, targetCoords) &&
      !checkFiguresBetweenCells(board, startCoords, targetCoords) &&
      super.canMove(board, startCoords, targetCoords)
    );
  }

  canAttack(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords,
    ignoreKingUnderAttackChecking?: true
  ): boolean {
    return (
      this.checkMovePattern(startCoords, targetCoords) &&
      !checkFiguresBetweenCells(board, startCoords, targetCoords) &&
      super.canAttack(
        board,
        startCoords,
        targetCoords,
        ignoreKingUnderAttackChecking
      )
    );
  }
}

class ChessBoardFigureRook extends ChessBoardFigure {
  constructor(description: IChessBoardFigureChildDescription) {
    super({
      type: "rook",
      ...description,
    });
  }

  checkMovePattern(
    startCoords: Coords,
    targetCoords: Coords
  ) {
    const yDiff = targetCoords[1] - startCoords[1];
    const xDiff = targetCoords[0] - startCoords[0];

    return (xDiff !== 0 && yDiff === 0) || (yDiff !== 0 && xDiff === 0);
  }

  canMove(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
  ): boolean {
    return (
      this.checkMovePattern(startCoords, targetCoords) &&
      !checkFiguresBetweenCells(board, startCoords, targetCoords) &&
      super.canMove(board, startCoords, targetCoords)
    );
  }

  canAttack(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords,
    ignoreKingUnderAttackChecking?: true
  ): boolean {
    return (
      this.checkMovePattern(startCoords, targetCoords) &&
      !checkFiguresBetweenCells(board, startCoords, targetCoords) &&
      super.canAttack(
        board,
        startCoords,
        targetCoords,
        ignoreKingUnderAttackChecking
      )
    );
  }
}

class ChessBoardFigureKnight extends ChessBoardFigure {
  constructor(description: IChessBoardFigureChildDescription) {
    super({
      type: "knight",
      ...description,
    });
  }

  checkMovePattern(
    startCoords: Coords,
    targetCoords: Coords
  ) {
    const yDiff = targetCoords[1] - startCoords[1];
    const xDiff = targetCoords[0] - startCoords[0];

    return (
      (Math.abs(xDiff) == 2 && Math.abs(yDiff) === 1) ||
      (Math.abs(xDiff) == 1 && Math.abs(yDiff) === 2)
    );
  }

  canMove(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords
  ): boolean {
    return (
      this.checkMovePattern(startCoords, targetCoords) &&
      super.canMove(board, startCoords, targetCoords)
    );
  }

  canAttack(
    board: ChessBoard,
    startCoords: Coords,
    targetCoords: Coords,
    ignoreKingUnderAttackChecking?: true
  ): boolean {
    return (
      this.checkMovePattern(startCoords, targetCoords) &&
      super.canAttack(
        board,
        startCoords,
        targetCoords,
        ignoreKingUnderAttackChecking
      )
    );
  }
}

export const figuresMap = {
  king: ChessBoardFigureKing,
  pawn: ChessBoardFigurePawn,
  bishop: ChessBoardFigureBishop,
  rook: ChessBoardFigureRook,
  queen: ChessBoardFigureQueen,
  knight: ChessBoardFigureKnight,
};

export default ChessBoardFigure;
