import * as React from "react";
import { useCallback, useRef, useState } from "react";
import styled from "styled-components";

import { ChessBoardCell } from "@/components/ChessBoard/ChessBoardCell/ChessBoardCell";
import { default as ChessBoardModel } from "@/model/ChessBoard/ChessBoard";
import { default as ChessBoardCellModel } from "@/model/ChessBoard/ChessBoardCell/ChessBoardCell";

const ChessBoardStyled = styled.div`
  border: 1px solid black;
  width: min(80vw, 80vh);
  height: min(80vw, 80vh);
  position: relative;
  display: flex;
  flex-flow: wrap-reverse;
`;

const BoardWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

interface IChessBoardProps {
  chessBoard: ChessBoardModel;
  chessBoardChange: (newBoard: ChessBoardModel) => void;
}

export const ChessBoard = (props: IChessBoardProps) => {
  const { chessBoard, chessBoardChange } = props;
  const [selectedFilledCell, setSelectedFilledCell] =
    useState<ChessBoardCellModel | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleCellClick = useCallback(
    (cell: ChessBoardCellModel) => {
      if (
        selectedFilledCell &&
        selectedFilledCell
          .getCurrentFigure()
          ?.canPlaced(
            chessBoard,
            selectedFilledCell.getCoords(),
            cell.getCoords()
          )
      ) {
        chessBoardChange(
          chessBoard.updateFigurePosition(
            selectedFilledCell.getCoords(),
            cell.getCoords()
          )
        );
        setSelectedFilledCell(null);
        return;
      }
      setSelectedFilledCell(cell.isEmpty() ? null : cell);
    },
    [chessBoard, chessBoardChange, selectedFilledCell]
  );

  const checkMovableCell = (cell: ChessBoardCellModel) => {
    if (!selectedFilledCell) {
      return undefined;
    }

    const figure = selectedFilledCell.getCurrentFigure();

    if (!figure) {
      return undefined;
    }

    if (
      figure.canMove(
        chessBoard,
        selectedFilledCell.getCoords(),
        cell.getCoords()
      )
    ) {
      return "canMove";
    }

    if (
      figure.canAttack(
        chessBoard,
        selectedFilledCell.getCoords(),
        cell.getCoords()
      )
    ) {
      return "canAttack";
    }
  };

  return (
    <BoardWrapper data-testid="chess-board">
      <ChessBoardStyled ref={boardRef}>
        {chessBoard
          .getRows()
          .map(boardRow =>
            boardRow.map(cell => (
              <ChessBoardCell
                key={`${cell.getCoords()[0]}${cell.getCoords()[1]}`}
                visualEffect={
                  checkMovableCell(cell) ||
                  (selectedFilledCell?.compare(cell) ? "selected" : undefined)
                }
                cell={cell}
                onClick={handleCellClick}
              />
            ))
          )}
      </ChessBoardStyled>
    </BoardWrapper>
  );
};
