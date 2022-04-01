import AdminOnly from '@/components/auth/AdminOnly';
import EthAccount from '@/components/EthAccount';
import { ActiveTokenSet } from '@/model/auth';
import { EthState } from '@/model/eth';
import { ImageSettingFullPath } from '@/model/settings';
import { classNames } from '@/utils/index';
import {
  faAngleRight,
  faCalculator,
  faCog,
  faPrayingHands,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, Transition } from '@headlessui/react';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import NavItem from './NavItem';

export default function Nav(): JSX.Element {
  const setActiveTokenSet = useSetRecoilState(ActiveTokenSet);
  const ethState = useRecoilValue(EthState);
  const logoPath = useRecoilValue(ImageSettingFullPath('LOGO'));

  const handleLogoutClick = (): void => {
    setActiveTokenSet(undefined);
  };

  return (
    <nav className="flex md:w-64 md:flex-col md:fixed h-screen bg-gray-50 border-r shadow-sm">
      <div className="flex flex-col h-full justify-between">
        <div className="w-full">
          <ul className="relative h-full p-0 m-0 list-none">
            <li className="relative flex justify-start w-full p-4 text-2xl font-bold">
              <Link to="/">
                <img src={logoPath} className={'inline-block w-52'} />
              </Link>
            </li>

            <NavItem
              icon={faPrayingHands}
              description="My praise"
              to="/mypraise"
            />
            <AdminOnly>
              <NavItem
                icon={faUserFriends}
                description="Quantifier pool"
                to="/pool"
              />
            </AdminOnly>
            <NavItem
              icon={faCalculator}
              description="Quantification periods"
              to="/periods"
            />
            <AdminOnly>
              <NavItem icon={faCog} description="Settings" to="/settings" />
            </AdminOnly>
          </ul>
        </div>
        <div className="w-full border-t">
          <Menu as="div" className="flex flex-col justify-center">
            <Menu.Button className="flex justify-between items-center px-4 py-3 w-full hover:text-gray-500 focus:outline-none">
              <EthAccount />
              <FontAwesomeIcon icon={faAngleRight} size="1x" className="ml-4" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute -mt-20 ml-6 w-4/5 bg-white rounded-md shadow-lg ring-1 ring-gray-800 ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }): JSX.Element => (
                      <div
                        className={classNames(
                          active ? 'bg-gray-100' : 'text-gray-700',
                          'block px-4 py-2 text-sm cursor-pointer'
                        )}
                        onClick={handleLogoutClick}
                      >
                        Logout
                      </div>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </nav>
  );
}
