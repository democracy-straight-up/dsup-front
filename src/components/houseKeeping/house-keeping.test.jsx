import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HouseKeeping from "./house-keeping";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("axios");
jest.mock("./member", () => () => null);
jest.mock("./candidate", () => () => null);
jest.mock("./statusMessages", () => () => null);

const originalWebSocket = window.WebSocket;
const originalBaseUrl = process.env.REACT_APP_BASE_URL;

let connections;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  connections = [];
  process.env.REACT_APP_BASE_URL = "localhost:8000";

  const state = {
    AuthUser: {
      user: {
        id: 1,
        username: "test-member",
        token: {
          access: "test+access/token=",
          refresh: "test-refresh",
        },
        users: { userType: "U1D0" },
      },
      circle: {
        id: 1,
        code: "TESTCIRCLE",
        district: { code: "VT00" },
        invitation_code: "1234567890",
        status: false,
      },
    },
  };

  useSelector.mockImplementation((selector) => selector(state));
  useDispatch.mockReturnValue(jest.fn());
  useNavigate.mockReturnValue(jest.fn());
  axios.get.mockResolvedValue({ data: state.AuthUser.circle });

  window.WebSocket = jest.fn().mockImplementation((url) => {
    const socket = {
      url,
      readyState: 0,
      close: jest.fn(),
      send: jest.fn(),
    };
    connections.push(socket);
    return socket;
  });
});

afterEach(() => {
  cleanup();
  jest.clearAllTimers();
  jest.useRealTimers();
  window.WebSocket = originalWebSocket;

  if (originalBaseUrl === undefined) {
    delete process.env.REACT_APP_BASE_URL;
  } else {
    process.env.REACT_APP_BASE_URL = originalBaseUrl;
  }
});

test("Circle connection includes the signed-in user's access token", async () => {
  await act(async () => {
    render(<HouseKeeping />);
  });

  expect(connections).toHaveLength(1);

  const url = new URL(connections[0].url);
  expect(url.pathname).toBe("/circle/TESTCIRCLE/test-member");
  expect(url.searchParams.get("token")).toBe("test+access/token=");
});
test("a dropped Circle connection reconnects after five seconds", async () => {
  await act(async () => {
    render(<HouseKeeping />);
  });

  expect(connections).toHaveLength(1);
  const firstSocket = connections[0];

  act(() => {
    firstSocket.readyState = 1;
    firstSocket.onopen();
  });

  act(() => {
    firstSocket.readyState = 3;
    firstSocket.onclose({ code: 1006, wasClean: false });
  });

  act(() => {
    jest.advanceTimersByTime(4999);
  });

  expect(connections).toHaveLength(1);

  act(() => {
    jest.advanceTimersByTime(1);
  });

  expect(connections).toHaveLength(2);
  expect(connections[1]).not.toBe(firstSocket);

  const url = new URL(connections[1].url);
  expect(url.searchParams.get("token")).toBe("test+access/token=");
});
test("leaving Housekeeping closes the Circle connection", async () => {
  let view;

  await act(async () => {
    view = render(<HouseKeeping />);
  });

  const socket = connections[0];

  act(() => {
    socket.readyState = 1;
    socket.onopen();
  });

  view.unmount();

  expect(socket.close).toHaveBeenCalledTimes(1);
});

test("leaving Housekeeping cancels a pending reconnect", async () => {
  let view;

  await act(async () => {
    view = render(<HouseKeeping />);
  });

  const socket = connections[0];

  act(() => {
    socket.readyState = 1;
    socket.onopen();
  });

  act(() => {
    socket.readyState = 3;
    socket.onclose({ code: 1006, wasClean: false });
  });

  expect(jest.getTimerCount()).toBe(1);

  view.unmount();

  expect(jest.getTimerCount()).toBe(0);

  act(() => {
    jest.advanceTimersByTime(10000);
  });

  expect(connections).toHaveLength(1);
});
test("stops after three unsuccessful reconnect attempts", async () => {
  await act(async () => {
    render(<HouseKeeping />);
  });

  expect(connections).toHaveLength(1);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const socket = connections[connections.length - 1];

    act(() => {
      socket.readyState = 3;
      socket.onclose({ code: 1006, wasClean: false });
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(connections).toHaveLength(attempt + 2);
  }

  // The initial connection plus three retries have all failed.
  const lastSocket = connections[connections.length - 1];

  act(() => {
    lastSocket.readyState = 3;
    lastSocket.onclose({ code: 1006, wasClean: false });
  });

  expect(jest.getTimerCount()).toBe(0);

  act(() => {
    jest.advanceTimersByTime(30000);
  });

  expect(connections).toHaveLength(4);
});