type EasConfig = {
  id: number;
  address: string;
  registryAddress: string;
};

export const easConfig: EasConfig[] = [
  {
    id: 1, // Ethereum
    address: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
    registryAddress: '0xA7b39296258348C78294F95B872b282326A97BDF',
  },
  {
    id: 10, // Optimism
    address: '0x4200000000000000000000000000000000000021',
    registryAddress: '0x4200000000000000000000000000000000000020',
  },
];
