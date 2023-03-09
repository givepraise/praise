import React from 'react';
import { useRecoilValue } from 'recoil';
import { Theme } from '@/model/theme';

/**
 *  LightDarkTheme component to set the theme of the app
 */
export function LightDarkTheme({
  children,
}: {
  children: JSX.Element;
}): JSX.Element | null {
  const theme = useRecoilValue(Theme);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme !== 'Light') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'Dark');
    } else {
      localStorage.setItem('theme', 'Light');
      root.classList.remove('dark');
    }
  }, [theme]);

  return children;
}
