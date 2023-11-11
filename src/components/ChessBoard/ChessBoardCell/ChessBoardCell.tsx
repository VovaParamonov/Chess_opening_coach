import * as React from "react";
import { useCallback } from "react";
import styled from "styled-components";

import { ChessBoardFigure } from "@/components/ChessBoard/ChessBoardFigure/ChessBoardFigure";
import { default as ChessBoardCellModel } from "@/model/ChessBoard/ChessBoardCell/ChessBoardCell";
import { Side } from "@/model/ChessCore/ChessCore";

type ChessBoardCellStyledProps = {
  color: Side;
};

const ChessBoardCellStyled = styled.div<ChessBoardCellStyledProps>`
  background-color: ${props =>
    props.color === "white" ? "#a1a1a1" : "#7a7a7a"}; // TODO: implement theming
  width: 12.5%;
  height: 12.5%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const CanMoveIcon = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  background: #5ed9ff;
  width: 50%;
  height: 50%;
  opacity: 0.4;
  transform: translate(-50%, -50%);
`;

const CanAttackIcon = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  background: #ff3985;
  width: 50%;
  height: 50%;
  opacity: 0.4;
  transform: translate(-50%, -50%);
`;

interface IChessBoardCellProps {
  cell: ChessBoardCellModel;
  onClick: (cell: ChessBoardCellModel) => void;
  visualEffect?: "canMove" | "canAttack" | "selected";
}

export const ChessBoardCell = (props: IChessBoardCellProps) => {
  const { cell, onClick, visualEffect } = props;

  const handleClick = useCallback(() => {
    return onClick(cell);
  }, [cell, onClick]);

  const figure = cell.getCurrentFigure();

  return (
    <ChessBoardCellStyled
      data-testid={cell.getCoords().join("-")}
      color={cell.getColor()}
      onClick={handleClick}
    >
      {visualEffect === "canMove" ? <CanMoveIcon /> : null}
      {visualEffect === "canAttack" ? <CanAttackIcon /> : null}
      {figure ? (
        <ChessBoardFigure
          figure={figure}
          selected={visualEffect === "selected"}
        />
      ) : null}
    </ChessBoardCellStyled>
  );
};
