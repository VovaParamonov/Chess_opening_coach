import * as React from 'react';
import { default as ChessBoardCellModel } from './Model';
import styled from 'styled-components';

type ChessBoardCellStyledProps = {
    color: 'black' | 'white';
}

const ChessBoardCellStyled = styled.div<ChessBoardCellStyledProps>`
    background-color: ${props => props.color}; // TODO: implement theming
    width: 12.5%;
    height: 12.5%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: red;
`;

interface IChessBoardCellProps {
    cell: ChessBoardCellModel;
}

export const ChessBoardCell = (props: IChessBoardCellProps) => {
    const { cell } = props;
    return (
      <ChessBoardCellStyled color={cell.getColor()} >
          {cell.coords}
      </ChessBoardCellStyled>
    );
}
