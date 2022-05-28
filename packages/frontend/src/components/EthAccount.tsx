import { shortenEthAddress } from 'api/dist/user/utils';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useAccount } from 'wagmi';

interface EthAccountParams {
  className?: string;
}

export default function EthAccount({
  className,
}: EthAccountParams): JSX.Element | null {
  const { data } = useAccount();

  if (!data?.address) return null;

  return (
    <div
      className={`inline-block flex justify-center items-center ${className}`}
    >
      <div className="w-[15px] h-[15px] mr-2">
        <Jazzicon address={data.address} />
      </div>
      <div>{shortenEthAddress(data.address)}</div>
    </div>
  );
}
