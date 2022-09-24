import {
  faCog,
  faPrayingHands,
  faUserFriends,
  faBook,
  faMoon,
  faSun,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { SingleSetting } from '@/model/settings';
import { EthAccount } from '@/components/account/EthAccount';
import { AdminOnly } from '@/components/auth/AdminOnly';
import { Theme } from '@/model/theme';
import { NavItem } from './NavItem';

export const Nav = (): JSX.Element => {
  const setTheme = useSetRecoilState(Theme);
  const logoSetting = useRecoilValue(SingleSetting('LOGO'));

  const handleTheme = (theme: string): void => {
    if (theme === 'Dark') {
      setTheme('Dark');
      localStorage.setItem('theme', 'Dark');
    } else {
      setTheme('Light');
      localStorage.setItem('theme', 'Light');
    }
  };

  return (
    <nav className="flex flex-col w-64 h-screen text-sm border-r shadow-m lg:fixed bg-warm-gray-50 dark:bg-slate-900 dark:text-white">
      <div className="flex flex-col justify-between h-full">
        <div className="w-full">
          <ul className="relative h-full p-0 m-0 list-none">
            <li className="relative flex justify-center w-full p-5">
              <Link to="/">
                {logoSetting && (
                  <img
                    src={logoSetting.valueRealized as string}
                    className={
                      'inline-block w-32 h-32 object-center object-cover rounded-full border'
                    }
                  />
                )}
              </Link>
            </li>

            <NavItem
              icon={faPrayingHands}
              description="My praise"
              to="/mypraise"
            />
            <NavItem icon={faCalendarAlt} description="Periods" to="/periods" />
            <AdminOnly>
              <NavItem
                icon={faCog}
                description="Settings"
                to="/settings/application"
              />
            </AdminOnly>
            <AdminOnly>
              <NavItem icon={faUserFriends} description="Users" to="/users" />
            </AdminOnly>
            <NavItem icon={faBook} description="Logs" to="/eventlogs" />
          </ul>
        </div>

        <div className="flex h-12 m-4 mt-auto">
          <div
            className="items-center justify-center hidden h-12 border-2 rounded-lg cursor-pointer dark:flex dark:text-white text-themecolor-3 grow dark:border-slate-700"
            onClick={(): void => handleTheme('Light')}
          >
            <FontAwesomeIcon icon={faSun} size="lg" />
          </div>
          <div
            className="flex items-center justify-center h-12 border-2 rounded-lg cursor-pointer dark:hidden dark:text-white text-themecolor-3 grow dark:border-slate-700"
            onClick={(): void => handleTheme('Dark')}
          >
            <FontAwesomeIcon icon={faMoon} size="lg" />
          </div>
        </div>

        <div className="w-full border-t">
          <Menu as="div" className="flex flex-col justify-center">
            <Menu.Button className="flex items-center justify-between w-full selection:hover:text-warm-gray-500 focus:outline-none">
              <EthAccount
                showDownCaret={false}
                showRightCaret={true}
                className="w-full px-4 py-3"
              />
            </Menu.Button>
          </Menu>
        </div>
      </div>
    </nav>
  );
};
