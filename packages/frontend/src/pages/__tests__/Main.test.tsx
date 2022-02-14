// sourced from:
// https://www.pluralsight.com/guides/how-to-test-react-components-in-typescript

import StartPage from '@/pages/Start/StartPage';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RecoilRoot } from 'recoil';

describe('<MainPage />', () =>
  test('should call useEagerConnect', async () => {
    render(
      <RecoilRoot>
        <StartPage />
      </RecoilRoot>
    );

    screen.getByText('Praise main page');
  }));
// screen.debug()
