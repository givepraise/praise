import { EthState } from '@/model/eth';
import { shortenEthAddress } from '@/utils/index';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useRecoilValue } from 'recoil';

interface EthAccountParams {
  className?: string;
}

export default function EthAccount({
  className,
}: EthAccountParams): JSX.Element | null {
  const ethState = useRecoilValue(EthState);
  if (ethState.connected && ethState.account)
    return (
      <div
        className={`inline-block flex justify-center items-center ${className}`}
      >
        <div className="w-[15px] h-[15px] mr-2">
          <Jazzicon address={ethState.account} />
        </div>
        <div>{shortenEthAddress(ethState.account)}</div>
      </div>
    );

  return null;
}
