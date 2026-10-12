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
test("shows receiving and Circle publishing sections for a First Delegate", () => {
  const state = {
    AuthUser: {
      user: {
        username: "first-delegate",
        token: { access: "test-access-token" },
        users: { userType: "U1D1" },
      },
      circle: {
        code: "30811",
        district: { code: "TN01" },
      },
    },
  };

  useSelector.mockImplementation((selector) => selector(state));

  render(<BillsWrapper setMessage={jest.fn()} />);

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus from My Delegate",
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus for Circle 30811",
    })
  ).toBeInTheDocument();
});
test("shows only the receiving section for an ordinary Circle voter", () => {
  const state = {
    AuthUser: {
      user: {
        username: "circle-voter",
        token: { access: "test-access-token" },
        users: { userType: "U1D0" },
      },
      circle: {
        code: "30811",
        district: { code: "TN01" },
      },
    },
  };

  useSelector.mockImplementation((selector) => selector(state));

  render(<BillsWrapper setMessage={jest.fn()} />);

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus from My Delegate",
    })
  ).toBeInTheDocument();

  expect(
    screen.queryByRole("heading", {
      name: /Bill Focus for /i,
    })
  ).not.toBeInTheDocument();
});
test("shows receiving and First Link publishing sections for a Second Delegate", () => {
  const state = {
    AuthUser: {
      user: {
        username: "second-delegate",
        token: { access: "test-access-token" },
        users: { userType: "U2D2" },
      },
      sec_del: {
        code: "12345",
        district: { code: "TN01" },
      },
    },
  };

  useSelector.mockImplementation((selector) => selector(state));

  render(<BillsWrapper setMessage={jest.fn()} />);

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus from My Delegate",
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus for First Link 12345",
    })
  ).toBeInTheDocument();
});
test("shows receiving and Second Link publishing sections for a Caucus Delegate", () => {
  const state = {
    AuthUser: {
      user: {
        username: "caucus-delegate",
        token: { access: "test-access-token" },
        users: { userType: "U3D3" },
      },
      moda: {
        code: "23456",
        district: { code: "TN01" },
      },
    },
  };

  useSelector.mockImplementation((selector) => selector(state));

  render(<BillsWrapper setMessage={jest.fn()} />);

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus from My Delegate",
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus for Second Link 23456",
    })
  ).toBeInTheDocument();
});
test("shows receiving and Caucus publishing sections for a HoLC", () => {
  const state = {
    AuthUser: {
      user: {
        username: "holc-member",
        token: { access: "test-access-token" },
        users: { userType: "U4D4" },
      },
      holc: {
        code: "12",
        district: { code: "TN01" },
      },
    },
  };

  useSelector.mockImplementation((selector) => selector(state));

  render(<BillsWrapper setMessage={jest.fn()} />);

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus from My Delegate",
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus for Caucus 12",
    })
  ).toBeInTheDocument();
});
test("shows only the publishing section for a House Rep", () => {
  const state = {
    AuthUser: {
      user: {
        username: "house-rep",
        token: { access: "test-access-token" },
        users: { userType: "U5D5" },
      },
    },
  };

  useSelector.mockImplementation((selector) => selector(state));

  render(<BillsWrapper setMessage={jest.fn()} />);

  expect(
    screen.getByRole("heading", {
      name: "Bill Focus for HoLCs",
    })
  ).toBeInTheDocument();

  expect(
    screen.queryByRole("heading", {
      name: "Bill Focus from My Delegate",
    })
  ).not.toBeInTheDocument();
});
