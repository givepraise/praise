import { EthState } from '@/model/eth';
import { shortenEthAddress } from '@/utils/index';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useRecoilValue } from 'recoil';

export default function EthAccount() {
  const ethState = useRecoilValue(EthState);
  if (ethState.connected && ethState.account)
    return (
      <div className="inline-block px-3 py-2 mb-5 text-base">
        <div
          style={{ width: '15px', height: '15px' }}
          className="inline-block mr-2"
        >
          <Jazzicon address={ethState.account} />
        </div>
        {shortenEthAddress(ethState.account)}
      </div>
    );

  return null;
}
