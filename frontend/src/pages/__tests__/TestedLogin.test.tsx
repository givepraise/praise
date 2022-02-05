// sourced from:
// https://www.pluralsight.com/guides/how-to-test-react-components-in-typescript

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import TestedLogin, { Props } from "../TestedLogin";

function renderLoginForm(props: Partial<Props> = {}) {
  const defaultProps: Props = {
    onPasswordChange() {
      return;
    },
    onRememberChange() {
      return;
    },
    onUsernameChange() {
      return;
    },
    onSubmit() {
      return;
    },
    shouldRemember: true
  };
  return render(<TestedLogin {...defaultProps} {...props} />);
}

describe("<TestedLogin />", () => {
  test("should display a blank login form, with remember me checked by default", async () => {
    const { findByTestId } = renderLoginForm();
    const loginForm = await findByTestId("login-form");

    expect(loginForm).toHaveFormValues({
      username: "",
      password: "",
      remember: true
    });
  });

  test("should allow entering a username", async () => {
    const onUsernameChange = jest.fn();
    const { findByTestId } = renderLoginForm({ onUsernameChange });
    const username = await findByTestId("username");

    fireEvent.change(username, { target: { value: "test" } });
    expect(onUsernameChange).toHaveBeenCalledWith("test");
  });

  test("should allow entering a password", async () => {
    const onPasswordChange = jest.fn();
    const { findByTestId } = renderLoginForm({ onPasswordChange });
    const username = await findByTestId("password");
    fireEvent.change(username, { target: { value: "password" } });

    expect(onPasswordChange).toHaveBeenCalledWith("password");
  });

  test("should allow toggling remember me", async () => {
    const onRememberChange = jest.fn();
    const { findByTestId } = renderLoginForm({
      onRememberChange,
      shouldRemember: false
    });
    const remember = await findByTestId("remember");
    fireEvent.click(remember);
    expect(onRememberChange).toHaveBeenCalledWith(true);
    
    fireEvent.click(remember);
    expect(onRememberChange).toHaveBeenCalledWith(false);
  });

  test("should submit the form with username, password, and remember", async () => {
    const onSubmit = jest.fn();
    const { findByTestId } = renderLoginForm({
      onSubmit,
      shouldRemember: false
    });
    const username = await findByTestId("username");
    const password = await findByTestId("password");
    const remember = await findByTestId("remember");
    const submit = await findByTestId("submit");
    fireEvent.change(username, { target: { value: "test" } });
    fireEvent.change(password, { target: { value: "password" } });
    fireEvent.click(remember);
    fireEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledWith("test", "password", true);
  });
});