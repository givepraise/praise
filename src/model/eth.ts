import { atom } from "recoil";

export interface EthStateInterface {
  account: string | null | undefined;
  triedEager: boolean;
  activating: boolean;
  connected: boolean;
  connectDisabled: boolean;
}

export const EthState = atom({
  key: "EthState",
  default: {
    account: undefined,
    triedEager: false,
    activating: false,
    connected: false,
    connectDisabled: false,
  } as EthStateInterface,
});
