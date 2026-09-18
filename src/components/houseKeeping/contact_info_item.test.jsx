import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { useSelector } from "react-redux";
import axios from "axios";
import ContactInfoItem from "./contact_info_item";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));
jest.mock("axios");

const delegate = {
  member: {
    user: { username: "delegate-user" },
  },
};

const member = {
  id: 10,
  email: "member@example.com",
  phone: "555-0100",
  address: "1 Main Street",
  contact_rules: "Contact by email.",
  member: {
    is_delegate: false,
    user: {
      username: "ordinary-member",
      users: { legalName: "Ordinary Member" },
    },
  },
};

beforeEach(() => {
  useSelector.mockImplementation((selector) =>
    selector({
      AuthUser: {
        user: {
          username: "delegate-user",
          token: { access: "test-access-token" },
        },
      },
    })
  );
});

afterEach(cleanup);

test("shows edit controls to the First Delegate", () => {
  render(
    <table>
      <tbody>
        <ContactInfoItem index={0} delegate={delegate} member={member} />
      </tbody>
    </table>
  );

  expect(screen.getAllByText(/edit/i).length).toBeGreaterThan(0);
});
test("hides edit controls from an ordinary member", () => {
  useSelector.mockImplementation((selector) =>
    selector({
      AuthUser: {
        user: {
          username: "ordinary-member",
          token: { access: "test-access-token" },
        },
      },
    })
  );

  render(
    <table>
      <tbody>
        <ContactInfoItem index={0} delegate={delegate} member={member} />
      </tbody>
    </table>
  );

  expect(screen.getByText("Ordinary Member")).toBeInTheDocument();
  expect(screen.queryAllByText(/edit/i)).toHaveLength(0);
});
test("shows an error and preserves entered contact details when saving fails", async () => {
  axios.patch.mockRejectedValueOnce(new Error("Network Error"));

  render(
    <table>
      <tbody>
        <ContactInfoItem index={0} delegate={delegate} member={member} />
      </tbody>
    </table>
  );

  // The first edit control is for Address; the second is for Contact Information.
  fireEvent.click(screen.getAllByText("Edit this section")[1]);

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "updated@example.com" },
  });

  fireEvent.click(screen.getByRole("button", { name: "Update Contact" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not save contact information. Please try again."
  );
  expect(screen.getByPlaceholderText("Email")).toHaveValue(
    "updated@example.com"
  );
});
test("disables Update Contact while a save is pending", () => {
  axios.patch.mockReturnValueOnce(new Promise(() => {}));

  render(
    <table>
      <tbody>
        <ContactInfoItem index={0} delegate={delegate} member={member} />
      </tbody>
    </table>
  );

  fireEvent.click(screen.getAllByText("Edit this section")[1]);

  const updateButton = screen.getByRole("button", {
    name: "Update Contact",
  });

  fireEvent.click(updateButton);

  expect(updateButton).toBeDisabled();
  expect(updateButton).toHaveTextContent("Saving...");
});
test.each([
  ["address", "Update Address"],
  ["rules", "Update Rules"],
])("disables the %s save button while saving", (section, buttonName) => {
  axios.patch.mockReturnValueOnce(new Promise(() => {}));

  render(
    <table>
      <tbody>
        <ContactInfoItem index={0} delegate={delegate} member={member} />
      </tbody>
    </table>
  );

  if (section === "address") {
    fireEvent.click(screen.getAllByText("Edit this section")[0]);
  } else {
    fireEvent.click(screen.getByText("Edit Contact Rules"));
  }

  const updateButton = screen.getByRole("button", { name: buttonName });
  fireEvent.click(updateButton);

  expect(updateButton).toBeDisabled();
  expect(updateButton).toHaveTextContent("Saving...");
});
test("saves the edited email and confirms success", async () => {
  axios.patch.mockClear();
  axios.patch.mockResolvedValueOnce({
    data: {
      ...member,
      email: "updated@example.com",
    },
  });

  render(
    <table>
      <tbody>
        <ContactInfoItem index={0} delegate={delegate} member={member} />
      </tbody>
    </table>
  );

  fireEvent.click(screen.getAllByText("Edit this section")[1]);

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "updated@example.com" },
  });

  fireEvent.click(screen.getByRole("button", { name: "Update Contact" }));

  expect(axios.patch).toHaveBeenCalledTimes(1);
  expect(axios.patch).toHaveBeenCalledWith(
    expect.stringContaining("/api/circle-member-contacts/10/"),
    expect.objectContaining({ email: "updated@example.com" }),
    {
      headers: { Authorization: "Bearer test-access-token" },
    }
  );

  expect(
    await screen.findByText("Email: updated@example.com")
  ).toBeInTheDocument();

  expect(screen.queryByPlaceholderText("Email")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent(
    "Contact information saved."
  );
});
test("cancel restores the saved contact details without sending a request", () => {
  axios.patch.mockClear();

  render(
    <table>
      <tbody>
        <ContactInfoItem index={0} delegate={delegate} member={member} />
      </tbody>
    </table>
  );

  fireEvent.click(screen.getAllByText("Edit this section")[1]);

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "unsaved@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Phone"), {
    target: { value: "555-9999" },
  });

  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(axios.patch).not.toHaveBeenCalled();
  expect(screen.queryByPlaceholderText("Email")).not.toBeInTheDocument();
  expect(screen.getByText("Email: member@example.com")).toBeInTheDocument();
  expect(screen.getByText("Phone: 555-0100")).toBeInTheDocument();

  // Reopening the editor should also show the saved values.
  fireEvent.click(screen.getAllByText("Edit this section")[1]);

  expect(screen.getByPlaceholderText("Email")).toHaveValue(
    "member@example.com"
  );
  expect(screen.getByPlaceholderText("Phone")).toHaveValue("555-0100");
});
test("cancel restores the saved address without sending a request", () => {
  axios.patch.mockClear();

  render(
    <table>
      <tbody>
        <ContactInfoItem index={0} delegate={delegate} member={member} />
      </tbody>
    </table>
  );

  fireEvent.click(screen.getAllByText("Edit this section")[0]);

  fireEvent.change(screen.getByPlaceholderText("Please specify your address."), {
    target: { value: "999 Unsaved Avenue" },
  });

  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(axios.patch).not.toHaveBeenCalled();
  expect(
    screen.queryByPlaceholderText("Please specify your address.")
  ).not.toBeInTheDocument();
  expect(screen.getByText("Address: 1 Main Street")).toBeInTheDocument();

  fireEvent.click(screen.getAllByText("Edit this section")[0]);

  expect(
    screen.getByPlaceholderText("Please specify your address.")
  ).toHaveValue("1 Main Street");
});
test("cancel restores the saved contact rules without sending a request", () => {
  axios.patch.mockClear();

  render(
    <table>
      <tbody>
        <ContactInfoItem index={0} delegate={delegate} member={member} />
      </tbody>
    </table>
  );

  fireEvent.click(screen.getByText("Edit Contact Rules"));

  fireEvent.change(
    screen.getByPlaceholderText("Please specify how/when members can reach you out."),
    { target: { value: "Unsaved contact rules." } }
  );

  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(axios.patch).not.toHaveBeenCalled();
  expect(
    screen.queryByPlaceholderText("Please specify how/when members can reach you out.")
  ).not.toBeInTheDocument();
  expect(screen.getByDisplayValue("Contact by email.")).toBeDisabled();

  fireEvent.click(screen.getByText("Edit Contact Rules"));

  expect(
    screen.getByPlaceholderText("Please specify how/when members can reach you out.")
  ).toHaveValue("Contact by email.");
});
