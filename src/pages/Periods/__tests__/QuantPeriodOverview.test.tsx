import React, {
  FC
} from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import QuantPeriodOverview, { QuantPeriodOverviewProps } from '../QuantPeriodOverview';

function setup({periodId, periodName, periodStart, periodEnd}: QuantPeriodOverviewProps) {
  return render(
    <RecoilRoot>
      <QuantPeriodOverview 
        periodId={periodId}
        periodName={periodName}
        periodStart={periodStart}
        periodEnd={periodEnd}
      />
    </RecoilRoot>
  );
}

describe("QuantPeriodOverview text input and rendering", () => {
  it('should render the name, start and end dates onto the screen', () => {
    const periodId = 1260;
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    setup({periodId, periodName, periodStart, periodEnd});

    expect(screen.getByPlaceholderText(periodName)).toBeInTheDocument();
    expect(screen.getByText(/1987-06-05/)).toBeInTheDocument();
    expect(screen.getByText(/2345-06-07/)).toBeInTheDocument();
  });
});

  it('should have the "Update" button disabled when initialized', () => {
    const periodId = 1270;
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    setup({periodId, periodName, periodStart, periodEnd});

    expect(screen.getByText('Update')).toBeDisabled();
  });

  it('should enable the "Update" button when a valid input is entered', () => {
    const periodId = 1270;
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    setup({periodId, periodName, periodStart, periodEnd});

    const input = screen.getByPlaceholderText(periodName);
    fireEvent.change(input, {target: {value: 'jelly'}});

    expect(screen.getByText('Update')).toBeEnabled();
  });

  it('should have the "Update" button disabled if the input is less than 2 chars', () => {
    const periodId = 1270;
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    setup({periodId, periodName, periodStart, periodEnd});

    const input = screen.getByPlaceholderText(periodName);
    fireEvent.change(input, {target: {value: 'm'}});

    expect(screen.getByText('Update')).toBeDisabled();
  });

  it('should have the "Update" button disabled if the input contains spaces', () => {
    const periodId = 1270;
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    setup({periodId, periodName, periodStart, periodEnd});

    const input = screen.getByPlaceholderText(periodName);
    fireEvent.change(input, {target: {value: 'getting hotter'}});

    expect(screen.getByText('Update')).toBeDisabled();
  });

  it('should call the onWordAdd handler (if exists) with the new word upon clicking the "Update" button', () => {
    const onWordsAddSpy = jest.fn();
    const inputValue = 'beulah';

    const periodId = 1270;
    const periodName = "never ending period";
    const periodStart = "1987-06-05";
    const periodEnd = "2345-06-07";

    render(
      <RecoilRoot>
        <QuantPeriodOverview 
          periodId={periodId}
          periodName={periodName}        
          periodStart={periodStart}
          periodEnd={periodEnd}
          onWordAdd={onWordsAddSpy} />
      </RecoilRoot>
      );

    const input = screen.getByPlaceholderText(periodName);
    const addButton = screen.getByText('Update');

    fireEvent.change(input, {target: {value: inputValue}});
    fireEvent.click(addButton);

    expect(onWordsAddSpy).toHaveBeenCalledWith(inputValue);
});

it('should clear the input upon clicking the "Update" button', () => {
  const periodId = 1270;
  const periodName = "never ending period";
  const periodStart = "1987-06-05";
  const periodEnd = "2345-06-07";

  setup({periodId, periodName, periodStart, periodEnd});

  const input = screen.getByPlaceholderText(periodName) as HTMLInputElement;
  const addButton = screen.getByText('Update');

  fireEvent.change(input, {target: {value: "bingo!"}});
  fireEvent.click(addButton);

  expect(input.value).toBe('');
});

  // screen.debug();