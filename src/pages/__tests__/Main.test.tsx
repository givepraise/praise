// sourced from:
// https://www.pluralsight.com/guides/how-to-test-react-components-in-typescript

import React from "react";
import { act, screen, render, fireEvent } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import MainPage from "@/pages/Main";


describe("<MainPage />", () => 
  test("should call useEagerConnect", async () => {
    render(
      <RecoilRoot>
        <MainPage />
      </RecoilRoot>
    )

    screen.getByText('Praise main page')
  })
);
// screen.debug()