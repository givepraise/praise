type SafeConfig = {
  id: number;
  serviceUrl: string;
  explorerUrl: string;
  safeChainAbbreviation: string;
};

export const safeConfig: SafeConfig[] = [
  {
    id: 1, // Ethereum
    serviceUrl: 'https://safe-transaction-mainnet.safe.global',
    explorerUrl: 'https://etherscan.io',
    safeChainAbbreviation: 'eth',
  },
  {
    id: 10, // Optimism
    serviceUrl: 'https://safe-transaction-optimism.safe.global',
    explorerUrl: 'https://optimistic.etherscan.io',
    safeChainAbbreviation: 'oeth',
  },
];
