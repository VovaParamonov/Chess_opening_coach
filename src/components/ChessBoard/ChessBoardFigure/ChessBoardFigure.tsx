import * as React from "react";
import styled from "styled-components";

import { default as ChessBoardFigureModel } from "@/model/ChessBoard/ChessBoardFigure/ChessBoardFigure";

const ChessBoardFigureStyled = styled.div<{ side: "white" | "black" }>`
  color: ${props => props.side};
`;

interface IChessBoardFigureProps {
  figure: ChessBoardFigureModel;
}

export const ChessBoardFigure = (props: IChessBoardFigureProps) => {
  const { figure } = props;

  return (
    <ChessBoardFigureStyled side={figure.getSide()}>
      {figure.getIcon()}
    </ChessBoardFigureStyled>
  );
};
