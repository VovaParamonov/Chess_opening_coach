import styled from "styled-components";

import GameSession from "@/components/ChessGameSession/GameSession";

const AppWrapperStyled = styled.main`
  text-align: center;
  color: #2c3e50;
  height: 100%;
`;

export default function App() {
  return (
    <AppWrapperStyled>
      <GameSession />
    </AppWrapperStyled>
  );
}
