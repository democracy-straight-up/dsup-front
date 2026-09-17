import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JoinCircle from "./joinCircle";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("axios");

jest.mock("../store/conf", () => ({
  baseURL: "backend.example.test",
}));

beforeEach(() => {
  jest.clearAllMocks();
  axios.post.mockReset();

  useSelector.mockImplementation((selector) =>
    selector({
      AuthUser: {
        user: {
          username: "test-member",
          token: {
            access: "old-access-token",
            refresh: "test-refresh-token",
          },
          users: {
            userType: "U0D0",
            district: { code: "TN01" },
          },
        },
      },
    })
  );

  useDispatch.mockReturnValue(jest.fn());
  useNavigate.mockReturnValue(jest.fn());
});

test("does not call an invitation key invalid while the join request is pending", async () => {
  axios.post
    .mockResolvedValueOnce({
      status: 200,
      data: { access: "fresh-access-token" },
    })
    // Keep the join request pending so we can inspect the waiting state.
    .mockImplementationOnce(() => new Promise(() => {}));

  render(<JoinCircle />);

  fireEvent.change(
    screen.getByPlaceholderText("Enter the circle invitation key here"),
    { target: { value: "1234567890" } }
  );

  fireEvent.click(screen.getByRole("button", { name: "Join The Circle" }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/join-circle/"),
      { user: "test-member", circle: "1234567890" },
      { headers: { Authorization: "Bearer fresh-access-token" } }
    );
  });

  expect(screen.queryByText(/invalid invitation key/i)).toBeNull();
});
test("clears the previous invalid-key error when a corrected key is submitted", async () => {
  axios.post
    .mockResolvedValueOnce({
      status: 200,
      data: { access: "first-access-token" },
    })
    .mockResolvedValueOnce({
      status: 200,
      data: { access: "second-access-token" },
    })
    .mockImplementationOnce(() => new Promise(() => {}));

  render(<JoinCircle />);

  const input = screen.getByPlaceholderText(
    "Enter the circle invitation key here"
  );
  const button = screen.getByRole("button", { name: "Join The Circle" });

  fireEvent.change(input, { target: { value: "123" } });
  fireEvent.click(button);

  await screen.findByText(/invalid invitation key/i);

  // Only token refresh should have occurred; no join request.
  expect(axios.post).toHaveBeenCalledTimes(1);

  fireEvent.change(input, { target: { value: "1234567890" } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/join-circle/"),
      { user: "test-member", circle: "1234567890" },
      { headers: { Authorization: "Bearer second-access-token" } }
    );
  });

  expect(screen.queryByText(/invalid invitation key/i)).toBeNull();
});