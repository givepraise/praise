import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import QuantPeriodOverview from "../QuantPeriodOverview";

describe("QuantPeriodOverview text input and rendering", () => {
  beforeEach(() => {
  });

  it('should render the name, start and end dates onto the screen', () => {
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    render(<QuantPeriodOverview 
        periodName={periodName}
        periodStart={periodStart}
        periodEnd={periodEnd}
      />
    );

    expect(screen.getByPlaceholderText(periodName)).toBeInTheDocument();
    expect(screen.getByText(/1987-06-05/)).toBeInTheDocument();
    expect(screen.getByText(/2345-06-07/)).toBeInTheDocument();
  });
});

  it('should have the "Update" button disabled when initialized', () => {
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    render(<QuantPeriodOverview 
        periodName={periodName}
        periodStart={periodStart}
        periodEnd={periodEnd}
      />
    );

    expect(screen.getByText('Update')).toBeDisabled();
  });

  // screen.debug();

  it('should enable the "Update" button when a valid input is entered', () => {
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    render(<QuantPeriodOverview 
        periodName={periodName}
        periodStart={periodStart}
        periodEnd={periodEnd}
      />
    );

    const input = screen.getByPlaceholderText(periodName);
    fireEvent.change(input, {target: {value: 'jelly'}});

    expect(screen.getByText('Update')).toBeEnabled();
  });

  it('should have the "Update" button disabled if the input is less than 2 chars', () => {
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    render(<QuantPeriodOverview 
        periodName={periodName}
        periodStart={periodStart}
        periodEnd={periodEnd}
      />
    );

    const input = screen.getByPlaceholderText(periodName);
    fireEvent.change(input, {target: {value: 'm'}});

    expect(screen.getByText('Update')).toBeDisabled();
  });

  it('should have the "Update" button disabled if the input contains spaces', () => {
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    render(<QuantPeriodOverview 
        periodName={periodName}
        periodStart={periodStart}
        periodEnd={periodEnd}
      />
    );

    const input = screen.getByPlaceholderText(periodName);
    fireEvent.change(input, {target: {value: 'getting hotter'}});

    expect(screen.getByText('Update')).toBeDisabled();
  });

  it('should call the onWordAdd handler (if exists) with the new word upon clicking the "Update" button', () => {
    const onWordsAddSpy = jest.fn();
    const inputValue = 'beulah';

    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    render(<QuantPeriodOverview 
        periodName={periodName}
        periodStart={periodStart}
        periodEnd={periodEnd}
        onWordAdd={onWordsAddSpy} />
      );

    const input = screen.getByPlaceholderText(periodName);
    const addButton = screen.getByText('Update');

    fireEvent.change(input, {target: {value: inputValue}});
    fireEvent.click(addButton);

    expect(onWordsAddSpy).toHaveBeenCalledWith(inputValue);
});

it('should clear the input upon clicking the "Update" button', () => {
  const periodName = "never ending period";
  const periodStart = "1987-06-05";
  const periodEnd = "2345-06-07";

  render(<QuantPeriodOverview 
      periodName={periodName}
      periodStart={periodStart}
      periodEnd={periodEnd} />
    );

  const input = screen.getByPlaceholderText(periodName) as HTMLInputElement;
  const addButton = screen.getByText('Update');

  fireEvent.change(input, {target: {value: "bingo!"}});
  fireEvent.click(addButton);

  expect(input.value).toBe('');
});
