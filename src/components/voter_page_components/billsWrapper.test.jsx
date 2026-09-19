import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import BillsWrapper from "./billsWrapper";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("axios");
jest.mock("../bills/bill_item", () => () => null);

beforeEach(() => {
  jest.resetAllMocks();

  const state = {
    AuthUser: {
      user: {
        username: "test-member",
        token: { access: "test-access-token" },
      },
    },
  };

  useSelector.mockImplementation((selector) => selector(state));

  // Keep the existing catalog request pending for this layout test.
  axios.get.mockReturnValue(new Promise(() => {}));
});

afterEach(() => {
  cleanup();
});

test("offers My Bills and All Bills tabs with My Bills selected initially", () => {
  render(<BillsWrapper setMessage={jest.fn()} />);

  expect(screen.getByRole("tab", { name: "My Bills" }))
    .toHaveAttribute("aria-selected", "true");

  expect(screen.getByRole("tab", { name: "All Bills" }))
    .toHaveAttribute("aria-selected", "false");

  expect(screen.queryByText("List of Bills")).not.toBeInTheDocument();
});
test("shows the bills table only when All Bills is selected", () => {
  render(
    <>
      <style>{`
        .tab-content > .tab-pane {
          display: none;
        }
        .tab-content > .active {
          display: block;
        }
      `}</style>
      <BillsWrapper setMessage={jest.fn()} />
    </>
  );

  expect(screen.queryByRole("table")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: "All Bills" }));

  expect(screen.getByRole("tab", { name: "All Bills" }))
    .toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("table")).toBeVisible();

  fireEvent.click(screen.getByRole("tab", { name: "My Bills" }));

  expect(screen.getByRole("tab", { name: "My Bills" }))
    .toHaveAttribute("aria-selected", "true");
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
