import styled from 'styled-components';
import { ChessBoard } from '@/components/ChessBoard/ChessBoard';

const AppWrapperStyled = styled.main`
  text-align: center;
  color: #2c3e50;
  height: 100%;
`;

const BoardWrapper = styled.div`
  display: flex;
  justify-content: center;
`;


export default function App() {
  return (
    <AppWrapperStyled>
      <BoardWrapper>
        <ChessBoard />
      </BoardWrapper>
    </AppWrapperStyled>
  );
}
