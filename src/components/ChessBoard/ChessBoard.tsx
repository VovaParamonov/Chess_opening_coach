import * as React from 'react';
import styled from 'styled-components';
import { useMemo, useRef } from 'react';
import { ChessBoardCell } from '@/components/ChessBoard/ChessBoardCell/ChessBoardCell';
import { default as ChessBoardModel } from './Model';

const ChessBoardStyled = styled.div`
  border: 1px solid black;
  width: min(80vw, 80vh);
  height: min(80vw, 80vh);
  position: relative;
  display: flex;
  flex-flow: wrap-reverse;
`;

interface IChessBoardProps {

}

export const ChessBoard = (props: IChessBoardProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const chessBoard = useMemo(() => new ChessBoardModel(), []);

  return (
    <ChessBoardStyled ref={boardRef}>
      {chessBoard.board.map(boardRow => (
        boardRow.map(cell => (
          <ChessBoardCell cell={cell} key={`${cell.coords[0]}${cell.coords[1]}`}/>
        ))
      ))}
    </ChessBoardStyled>
  );
}
