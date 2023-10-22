import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import snapshotDiff from "snapshot-diff";

import { getChessBoardStartMap } from "@/model/ChessBoard/ChessBoard";
import {
  FigureType,
  IChessBoardFigureChildDescription,
} from "@/model/ChessBoard/ChessBoardFigure/ChessBoardFigure";

import GameSession from "../GameSession";

async function handleEachStartMapPos(
  cb: (
    cellDesc: (IChessBoardFigureChildDescription & { type: FigureType }) | null,
    coords: [number, number]
  ) => Promise<void> | void
) {
  const startMap = getChessBoardStartMap();

  for (let i = 0; i < startMap.length; i++) {
    for (let j = 0; j < startMap[i].length; j++) {
      await cb(startMap[i][j], [i, j]);
    }
  }
}

describe("Game core", () => {
  afterEach(cleanup);

  it("should render board with start positions", () => {
    const { asFragment } = render(<GameSession />);

    const renderedBoard = asFragment();

    expect(renderedBoard).toMatchSnapshot();
  });

  it("figures have right move patterns", async () => {
    const { asFragment } = render(<GameSession />);

    const fistRender = asFragment();

    await handleEachStartMapPos(async (cellDesc, coords) => {
      const renderedCell = screen.getByTestId(coords.join("-"));

      fireEvent.click(renderedCell);

      expect(snapshotDiff(fistRender, asFragment())).toMatchSnapshot();
    });
  });
});
