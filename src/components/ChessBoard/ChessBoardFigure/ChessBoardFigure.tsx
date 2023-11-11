import * as React from "react";
import styled from "styled-components";
import { default as ChessBoardFigureModel } from "@/model/ChessBoard/ChessBoardFigure/ChessBoardFigure";
import { Side } from "@/model/ChessCore/ChessCore";

interface IChessBoardFigureStyledProps {
  side: Side;
  selected?: boolean;
}

const ChessBoardFigureStyled = styled.div<IChessBoardFigureStyledProps>`
  color: ${props => props.side};

  filter: ${props =>
    props.selected ? "drop-shadow(0 0 0.75rem #c9c9c9)" : "unset"};
`;

interface IChessBoardFigureProps {
  figure: ChessBoardFigureModel;
  selected?: boolean;
}

export const ChessBoardFigure = (props: IChessBoardFigureProps) => {
  const { figure, selected } = props;

  return (
    <ChessBoardFigureStyled side={figure.getSide()} selected={selected}>
      <img src={figure.getIcon()} alt="" />
    </ChessBoardFigureStyled>
  );
};
