// External package imports
import { useState, useEffect } from 'react';
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';

// Internal imports
import { useAccount } from 'wagmi';
import { atom, useRecoilState } from 'recoil';
import { SignSafeTransactionStateType } from '../types/sign-safe-transaction-state.type';
import { useSafe } from './useSafe';

const SignSafeTransactionState = atom<SignSafeTransactionStateType>({
  key: 'SignSafeTransactionState',
  default: undefined,
});

type UseSafeTransactionProps = {
  safeTxHash?: string;
};

type UseSafeTransactionReturn = {
  transaction?: SafeMultisigTransactionResponse;
  moreConfirmationsRequired?: boolean;
  mySignatureAwaited?: boolean;
  signState?: SignSafeTransactionStateType;
  signTransaction?: () => void;
};

/**
 * Custom hook to interface with Safe transactions.
 * @returns An object containing Safe transaction information and utilities.
 */
export function useSafeTransaction({
  safeTxHash,
}: UseSafeTransactionProps): UseSafeTransactionReturn {
  // Hooks
  const { address: userAddress } = useAccount();
  const { safe, safeApiKit } = useSafe();

  // Local state
  const [transaction, setTransaction] =
    useState<SafeMultisigTransactionResponse>();
  const [mySignatureAwaited, setMySignatureAwaited] = useState<boolean>();

  // Global state
  const [signState, setSignState] = useRecoilState(SignSafeTransactionState);

  /**
   * Load the Safe transaction details.
   */
  function loadTransaction(): void {
    if (!safeApiKit || !safeTxHash) return;
    void (async (): Promise<void> => {
      const tx = await safeApiKit.getTransaction(safeTxHash);
      setTransaction(tx);
    })();
  }

  function checkIfMySignatureAwaited(): void {
    if (!userAddress || !safe) return;
    void (async (): Promise<void> => {
      const isOwner = await safe.isOwner(userAddress);
      setMySignatureAwaited(
        isOwner &&
          !transaction?.confirmations?.find((c) => c.owner === userAddress)
      );
    })();
  }

  useEffect(loadTransaction, [safeApiKit, safeTxHash]);
  useEffect(checkIfMySignatureAwaited, [userAddress, safe, transaction]);

  const moreConfirmationsRequired =
    transaction?.confirmations &&
    transaction?.confirmationsRequired > 0 &&
    transaction.confirmations.length < transaction.confirmationsRequired;

  function signTransaction(): void {
    if (!safe || !safeTxHash) {
      return;
    }
    void (async (): Promise<void> => {
      setSignState({ state: 'signing' });
      try {
        await safe.signTransactionHash(safeTxHash);
        setSignState({ state: 'signed' });
      } catch (e) {
        setSignState({ state: 'error', error: e as Error });
      }
    })();
  }

  return {
    transaction,
    moreConfirmationsRequired,
    mySignatureAwaited,
    signState,
    signTransaction,
  };
}
