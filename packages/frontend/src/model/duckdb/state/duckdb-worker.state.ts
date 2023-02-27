import { atom } from 'recoil';

export const DuckDbWorker = atom<Worker>({
  key: 'DuckDbWorker',
  default: undefined,
});
