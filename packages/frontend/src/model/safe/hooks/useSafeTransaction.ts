// External package imports
import { useState, useEffect } from 'react';
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';

// Internal imports
import { useAccount } from 'wagmi';
import { atom, atomFamily, useRecoilState } from 'recoil';
import { SignSafeTransactionStateType } from '../types/sign-safe-transaction-state.type';
import { useSafe } from './useSafe';
import { toast } from 'react-hot-toast';
import { errorHasReason } from '../../eth/util/errorHasReason';
import { errorHasMessage } from '../../eth/util/errorHasMessage';

const SafeTransaction = atomFamily<SafeMultisigTransactionResponse, string>({
  key: 'SafeTransaction',
  default: undefined,
});

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
  const [mySignatureAwaited, setMySignatureAwaited] = useState<boolean>();

  // Global state
  const [transaction, setTransaction] = useRecoilState(
    SafeTransaction(safeTxHash ?? '')
  );
  const [signState, setSignState] = useRecoilState(SignSafeTransactionState);

  /**
   * Load the Safe transaction details.
   */
  function loadTransaction(): void {
    if (transaction || !safeApiKit || !safeTxHash) return;
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

  useEffect(loadTransaction, [
    safeApiKit,
    safeTxHash,
    transaction,
    setTransaction,
  ]);
  useEffect(checkIfMySignatureAwaited, [userAddress, safe, transaction]);

  const moreConfirmationsRequired =
    transaction?.confirmations &&
    transaction?.confirmationsRequired > 0 &&
    transaction.confirmations.length < transaction.confirmationsRequired;

  function signTransaction(): void {
    if (!safe || !safeTxHash || !safeApiKit) {
      return;
    }
    void (async (): Promise<void> => {
      setSignState({ state: 'signing' });
      try {
        await safe.signTransactionHash(safeTxHash);
        const tx = await safeApiKit.getTransaction(safeTxHash);
        setTransaction(tx);
        setSignState({ state: 'signed' });
      } catch (e) {
        if (errorHasReason(e) && e.reason) {
          toast.error(e.reason);
        } else if (errorHasMessage(e) && e.message) {
          toast.error(e.message);
        }
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
