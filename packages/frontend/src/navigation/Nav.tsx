import AdminOnly from '@/components/auth/AdminOnly';
import { SessionToken } from '@/model/auth';
import { EthState } from '@/model/eth';
import * as localStorage from '@/model/localStorage';
import { ReactComponent as TECLogo } from '@/svg/tec-logo.svg';
import { classNames } from '@/utils/index';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
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

interface NavProps {
  icon: IconProp;
  description: string;
  to: string;
}
export const NavItem = ({ icon, description, to }: NavProps) => {
  return (
    <Link
      to={to}
      className="relative flex px-4 py-1 cursor-pointer hover:bg-gray-100 mr-[1px] no-underline flex items-center"
      id={to.substring(1) + '-nav-button'}
    >
      <FontAwesomeIcon
        icon={icon}
        size="1x"
        className="inline-block ml-2 mr-3"
      />
      <div className="flex-auto inline-block my-1">
        <span>{description}</span>
      </div>
    </Link>
  );
};

export default function Nav() {
  const setSessionToken = useSetRecoilState(SessionToken);
  const ethState = useRecoilValue(EthState);

  const handleLogoutClick = () => {
    localStorage.removeSessionToken(ethState.account);
    setSessionToken(null);
  };

  return (
    <nav className="flex-shrink-0 w-64 border-r shadow-sm">
      <div className="h-full bg-gray-50">
        <div className="fixed top-0 left-0 w-64">
          <ul className="relative h-full p-0 m-0 list-none">
            <li className="relative flex justify-start w-full p-4 text-2xl font-bold">
              <Link to="/">
                <TECLogo className={'inline-block w-52'} />
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
        <div className="fixed bottom-0 left-0 w-64 px-4 py-3 border-t">
          <Menu as="div" className="relative inline-block mr-2">
            <div>
              <Menu.Button className=" hover:text-gray-500 focus:outline-none">
                <div
                  style={{ width: '15px', height: '15px' }}
                  className="inline-block mr-2"
                >
                  <Jazzicon address={ethState.account!} />
                </div>
                {ethState.account?.substring(0, 6)}...
                {ethState.account?.substring(ethState.account?.length - 4)}
                <FontAwesomeIcon
                  icon={faAngleRight}
                  size="1x"
                  className="inline-block ml-4"
                />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute w-56 -mt-12 bg-white rounded-md shadow-lg left-40 ring-1 ring-gray-800 ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
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
