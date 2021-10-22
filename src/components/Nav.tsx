import { useAuthRecoilValue } from "@/store/api";
import { SessionToken } from "@/store/auth";
import { EthState } from "@/store/eth";
import * as localStorage from "@/store/localStorage";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faAngleRight,
  faCalculator,
  faCog,
  faUser,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, Transition } from "@headlessui/react";
import { Jazzicon } from "@ukstv/jazzicon-react";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import AdminOnly from "./auth/AdminOnly";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

interface NavProps {
  icon: IconProp;
  description: string;
  to: string;
}
export const NavItem = ({ icon, description, to }: NavProps) => {
  return (
    <div className="relative flex px-4 py-1 cursor-pointer hover:bg-gray-300">
      <div className="my-auto mr-4">
        <FontAwesomeIcon icon={icon} size="1x" className="inline-block" />
      </div>
      <Link to={to}>
        <div className="flex-auto my-1">
          <span>{description}</span>
        </div>
      </Link>
    </div>
  );
};

export default function Nav() {
  const setSessionToken = useSetRecoilState(SessionToken);
  const ethState = useAuthRecoilValue(EthState);

  const handleLogoutClick = () => {
    localStorage.removeSessionToken(ethState.account);
    setSessionToken(null);
  };

  return (
    <nav className="flex-shrink-0 w-64 mr-5 border-r shadow-sm">
      <div className="flex flex-col flex-auto h-full bg-gray-50">
        <div className="flex flex-col flex-grow">
          <ul className="relative h-full p-0 m-0 list-none">
            <li className="relative flex justify-start w-full p-4 mb-3 text-2xl font-bold border-b shadow-sm">
              <Link to="/">Praise 🙏</Link>
            </li>

            <NavItem icon={faUser} description="My praise" to="/praise" />
            <NavItem
              icon={faUserFriends}
              description="Quantifier pool"
              to="/pool"
            />
            <NavItem
              icon={faCalculator}
              description="Quantifier periods"
              to="/periods"
            />
            <AdminOnly>
              <NavItem icon={faCog} description="Settings" to="/settings" />
            </AdminOnly>
          </ul>
        </div>
        <div className="px-4 py-3 border-t">
          <Menu as="div" className="relative inline-block mr-2">
            <div>
              <Menu.Button className=" hover:text-gray-700 focus:outline-none">
                <div
                  style={{ width: "15px", height: "15px" }}
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
              <Menu.Items className="absolute w-56 -mt-12 bg-white rounded-md shadow-lg left-40 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm cursor-pointer"
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
