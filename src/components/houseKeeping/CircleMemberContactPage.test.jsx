import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { useSelector } from "react-redux";
import axios from "axios";
import CircleMemberContactPage from "./CircleMemberContactPage";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("axios");

const state = {
  AuthUser: {
    user: {
      username: "test-member",
      token: { access: "test-access-token" },
    },
    circle: {
      code: "TESTCIRCLE",
      district: { code: "VT00" },
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  useSelector.mockImplementation((selector) => selector(state));
});

afterEach(() => {
  cleanup();
});

test("shows loading feedback while member contacts are being fetched", () => {
  axios.get.mockReturnValue(new Promise(() => {}));

  render(<CircleMemberContactPage />);

  expect(screen.getByText(/loading member contacts/i)).toBeInTheDocument();
});
test("shows a helpful message when member contacts fail to load", async () => {
  axios.get.mockRejectedValueOnce(new Error("Network Error"));

  render(<CircleMemberContactPage />);

  expect(
    await screen.findByText(
      /Could not load member contacts\. Check your connection and try again\./i
    )
  ).toBeInTheDocument();
});