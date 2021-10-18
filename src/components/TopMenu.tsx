import { SessionToken } from "@/store/auth";
import { EthState } from "@/store/eth";
import * as localStorage from "@/store/localStorage";
import { faCog, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const TopMenu = () => {
  const setSessionToken = useSetRecoilState(SessionToken);
  const ethState = useRecoilValue(EthState);

  const handleLogoutClick = () => {
    localStorage.removeSessionToken(ethState.account);
    setSessionToken(null);
  };

  return (
    <div className="flex flex-row-reverse pt-3 pb-6">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className=" hover:text-gray-700 focus:outline-none">
            <FontAwesomeIcon icon={faUser} size="2x" className="inline-block" />
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
          <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
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
      <Menu as="div" className="relative inline-block mr-2">
        <div>
          <Menu.Button className=" hover:text-gray-700 focus:outline-none">
            <FontAwesomeIcon icon={faCog} size="2x" className="inline-block" />
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
          <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm cursor-pointer"
                    )}
                  >
                    Settings (NOT WORKING)
                  </div>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default TopMenu;
