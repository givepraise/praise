import React, { FC } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import QuantPeriodOverview, {
  QuantPeriodOverviewProps,
} from '../QuantPeriodOverview';

function setup({
  periodId,
  periodName,
  periodStart,
  periodEnd,
}: QuantPeriodOverviewProps) {
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

describe('QuantPeriodOverview text input and rendering', () => {
  it('should render the name, start and end dates onto the screen', () => {
    const periodId = 1260;
    const periodName = 'never ending period';
    const periodStart = '1987-06-05';
    const periodEnd = '2345-06-07';

    setup({ periodId, periodName, periodStart, periodEnd });

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByText(/1987-06-05/)).toBeInTheDocument();
    expect(screen.getByText(/2345-06-07/)).toBeInTheDocument();
  });

  it('should have an input field containing the default name when initialized', () => {
    const periodId = 1270;
    const periodName = 'never ending period';
    const periodStart = '1987-06-05';
    const periodEnd = '2345-06-07';

    setup({ periodId, periodName, periodStart, periodEnd });
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('never ending period');
  });

  // it('should flash a success message when a valid input is entered', () => {
  //   const periodId = 1270;
  //   const periodName = "never ending period";
  //   const periodStart = "1987-06-05";
  //   const periodEnd = "2345-06-07";

  //   setup({periodId, periodName, periodStart, periodEnd});

  //   const input = screen.getByLabelText("Name") as HTMLInputElement;
  //   fireEvent.change(input, {target: {value: ''}});
  //     userEvent.type(input, 'jelly');
  //     userEvent.type(input, '{enter}');

  //   expect(input).toHaveValue("jelly");
  //   expect(screen.getByText(/Name changed successfully/)).toBeInTheDocument();

  // });

  it('should raise an error if an input is submitted with less than 3 chars', () => {
    const periodId = 1270;
    const periodName = 'never ending period';
    const periodStart = '1987-06-05';
    const periodEnd = '2345-06-07';

    setup({ periodId, periodName, periodStart, periodEnd });

    const input = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'm' } });
    userEvent.type(input, '{enter}');

    expect(
      screen.getByText(/Name must be more than 3 characters/)
    ).toBeInTheDocument();
  });

  it('should raise an error if an input is submitted with more than 64 chars', () => {
    const periodId = 1270;
    const periodName = 'never ending period';
    const periodStart = '1987-06-05';
    const periodEnd = '2345-06-07';

    setup({ periodId, periodName, periodStart, periodEnd });

    var longString = 'm';
    while (longString.length < 65) {
      longString += 'm';
    }

    const input = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: longString } });
    userEvent.type(input, '{enter}');

    const result = screen.getByText(/Name must be less than 64 characters/);
  });

  // it('should submit successfully if the input contains spaces', () => {
  //   const periodId = 1270;
  //   const periodName = "never ending period";
  //   const periodStart = "1987-06-05";
  //   const periodEnd = "2345-06-07";

  //   setup({periodId, periodName, periodStart, periodEnd});

  //   const input = screen.getByLabelText("Name") as HTMLInputElement;
  //     fireEvent.change(input, {target: {value: ''}});
  //     userEvent.type(input, 'getting hotter');
  //     userEvent.type(input, '{enter}');

  //   expect(screen.findByRole('cell')).toHaveTextContent("getting warmer");
  // });

  it('should return to the original input upon pressing escape with a valid name', () => {
    const periodId = 1270;
    const periodName = 'never ending period';
    const periodStart = '1987-06-05';
    const periodEnd = '2345-06-07';

    setup({ periodId, periodName, periodStart, periodEnd });

    const input = screen.getByLabelText('Name') as HTMLInputElement;

    userEvent.type(input, 'bingo!');
    userEvent.keyboard('{esc}');

    expect(input.value).toBe('never ending period');
  });
});
