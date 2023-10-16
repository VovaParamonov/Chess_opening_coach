import { FC, useMemo, useState } from "react";

import { ChessBoard } from "@/components/ChessBoard/ChessBoard";
import { default as ChessBoardModel } from "@/model/ChessBoard/ChessBoard";

interface IChessGameSessionProps {}

const ChessGameSession: FC<IChessGameSessionProps> = props => {
  const [chessBoard, setChessBoard] = useState(new ChessBoardModel());

  return (
    <ChessBoard chessBoard={chessBoard} chessBoardChange={setChessBoard} />
  );
};

export default ChessGameSession;
