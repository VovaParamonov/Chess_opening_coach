import * as React from "react";
import styled from "styled-components";

import { default as ChessBoardFigureModel } from "@/model/ChessBoard/ChessBoardFigure/ChessBoardFigure";

interface IChessBoardFigureStyledProps {
  side: "white" | "black";
  selected?: boolean;
}

const ChessBoardFigureStyled = styled.div<IChessBoardFigureStyledProps>`
  color: ${props => props.side};
  text-shadow: ${props => (props.selected ? "0 0 5px #3a3a3a" : "unset")};
  transform: ${props => (props.selected ? "scale(1.4)" : "unset")};
`;

interface IChessBoardFigureProps {
  figure: ChessBoardFigureModel;
  selected?: boolean;
}

export const ChessBoardFigure = (props: IChessBoardFigureProps) => {
  const { figure, selected } = props;

  return (
    <ChessBoardFigureStyled side={figure.getSide()} selected={selected}>
      {figure.getIcon()}
    </ChessBoardFigureStyled>
  );
};
