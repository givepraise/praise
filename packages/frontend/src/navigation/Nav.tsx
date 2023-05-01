import React from 'react';
import {
  faCog,
  faCoins,
  faPrayingHands,
  faUserFriends,
  faBook,
  faMoon,
  faSun,
  faCalendarAlt,
  faBullhorn,
  faFire,
  faFileLines,
  faUser,
  faChartArea,
  faTableList,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@headlessui/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import { SingleSetting } from '@/model/settings/settings';
import { EthAccount } from '@/components/account/EthAccount';
import { AdminOnly } from '@/components/auth/AdminOnly';
import { Theme } from '@/model/theme';
import { ActiveUserId } from '@/model/auth/auth';
import { NavItem } from './NavItem';

const NavLogo = (): JSX.Element => {
  const logoSetting = useRecoilValue(SingleSetting('LOGO'));

  const [imageLoadError, setImageLoadError] = React.useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    setImageLoadError(false);
  }, [logoSetting]);

  return (
    <Link to={'/'}>
      {!imageLoaded && !imageLoadError && logoSetting?.valueRealized && (
        <div className="inline-block object-cover object-center w-32 h-32 border rounded-full" />
      )}
      {(imageLoadError || !logoSetting?.valueRealized) && (
        <FontAwesomeIcon
          icon={faPrayingHands}
          size="1x"
          className="inline-block object-cover object-center w-28 h-28 text-themecolor-3"
        />
      )}
      {logoSetting?.valueRealized && (
        <img
          src={logoSetting.valueRealized as string}
          onError={(): void => setImageLoadError(true)}
          onLoad={(): void => setImageLoaded(true)}
          alt="avatar"
          className="inline-block object-cover object-center w-32 h-32 border rounded-full"
          style={!imageLoaded ? { display: 'none' } : {}}
        />
      )}
    </Link>
  );
};

export const Nav = (): JSX.Element => {
  const userId = useRecoilValue(ActiveUserId);
  const setTheme = useSetRecoilState(Theme);

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
              <NavLogo />
            </li>

            <NavItem
              icon={faUser}
              description="Profile"
              to={`/users/${userId}`}
            />
            <NavItem icon={faCalendarAlt} description="Periods" to="/periods" />
            <NavItem
              icon={faUserFriends}
              description="Users"
              to="/users"
              exact={true}
            />
            <NavItem
              icon={faChartArea}
              description="Analytics"
              to="/analytics"
              exact={true}
            />
            <NavItem
              icon={faTableList}
              description="Reports"
              to="/reports"
              exact={true}
            />
            <NavItem
              icon={faCoins}
              description="Rewards"
              to="/rewards"
              exact={true}
            />
            <NavItem icon={faBook} description="Logs" to="/eventlogs" />
            <AdminOnly>
              <NavItem
                icon={faCog}
                description="Settings"
                to="/settings/application"
              />
            </AdminOnly>
          </ul>
        </div>

        <div className="flex flex-col justify-end mt-auto h-60">
          <ul>
            <NavItem
              icon={faBullhorn}
              description="Give us feedback"
              to="https://praise.sleekplan.app/"
              iconClassName="text-themecolor-3"
            />
            <NavItem
              icon={faFire}
              description="Latest changes"
              to="https://github.com/givepraise/praise/releases"
              iconClassName="text-themecolor-3"
            />
            <NavItem
              icon={faFileLines}
              description="Docs"
              to="https://givepraise.xyz/docs/"
              iconClassName="text-themecolor-3"
            />
          </ul>
          <div
            className="hidden px-2 py-3 m-3 border-2 rounded-lg cursor-pointer dark:flex border-slate-700"
            onClick={(): void => handleTheme('Light')}
          >
            <div className="inline-block w-8 px-1 text-center text-themecolor-3">
              <FontAwesomeIcon icon={faSun} size="lg" />
            </div>
            <div className="flex-auto inline-block whitespace-nowrap">
              Light mode
            </div>
          </div>

          <div
            className="flex px-2 py-3 m-3 border-2 rounded-lg cursor-pointer dark:hidden "
            onClick={(): void => handleTheme('Dark')}
          >
            <div className="inline-block w-8 pl-1 text-center text-themecolor-3">
              <FontAwesomeIcon icon={faMoon} size="lg" />
            </div>
            <div className="flex-auto inline-block whitespace-nowrap">
              Dark mode
            </div>
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
