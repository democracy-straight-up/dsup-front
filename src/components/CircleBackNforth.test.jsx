import React, { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";

import CircleBackNforth from "./CircleBackNforth";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

describe("CircleBackNforth WebSocket authentication", () => {
  let MockWebSocket;

  beforeEach(() => {
    jest.clearAllMocks();

    Element.prototype.scrollIntoView = jest.fn();

    process.env.REACT_APP_BASE_URL = "backend.example.test";

    useSelector.mockImplementation((selector) =>
      selector({
        AuthUser: {
          circle: {
            code: "CBF01",
            district: {
              code: "VT00",
            },
          },
          user: {
            username: "circle-member",
            token: {
              access: "test-access-token",
            },
          },
        },
      })
    );

    MockWebSocket = jest.fn(() => ({
      close: jest.fn(),
      send: jest.fn(),
      readyState: 1,
    }));
    MockWebSocket.OPEN = 1;

    global.WebSocket = MockWebSocket;
  });

  test("includes the access token in the Circle B&F WebSocket URL", () => {
    render(<CircleBackNforth />);

    expect(MockWebSocket).toHaveBeenCalledWith(
      "ws://backend.example.test/ws/CBF01/circle-member/?token=test-access-token"
    );
  });

  test("does not send a client-supplied sender identity", () => {
    render(<CircleBackNforth />);

    const socket = MockWebSocket.mock.results[0].value;

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Permanent Circle record entry." },
    });

    fireEvent.click(screen.getByText("Send"));

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        message: "Permanent Circle record entry.",
      })
    );
  });

  test("displays System as the author of a system entry", () => {
    render(<CircleBackNforth />);

    const socket = MockWebSocket.mock.results[0].value;

    act(() => {
      socket.onmessage({
        data: JSON.stringify([
          {
            id: 1,
            sender: null,
            message: "Betty became F-Del, replacing Alice.",
            circle: 1,
            date: "2026-10-12T12:00:00Z",
            is_system: true,
          },
        ]),
      });
    });

    expect(screen.getByText("System")).toBeInTheDocument();
    expect(
      screen.getByText("Betty became F-Del, replacing Alice.")
    ).toBeInTheDocument();
  });
});