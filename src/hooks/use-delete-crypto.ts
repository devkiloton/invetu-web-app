import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { firebaseClient } from '~/clients/firebase-client/firebase-client';
import { deleteCryptoData } from '~/features/investments-data/investments-data-slice';
import { deleteCrypto } from '~/features/investments/investments-slice';
import { useAuth } from '~/lib/firebase';
import useSnackbar from './use-snackbar';
import { deleteInvestmentResult } from '~/features/investments-result-slice/investments-result-slice';

function useDeleteCrypto() {
  const dispatch = useDispatch();
  const auth = useAuth();
  const tooltip = useSnackbar();
  return useCallback(
    (ticker: string) => {
      if (!auth.currentUser?.uid) return;
      firebaseClient()
        .firestore.investments.cryptoCurrencies.delete(
          auth.currentUser?.uid,
          ticker,
        )
        .then(() => {
          dispatch(deleteCrypto(ticker));
          dispatch(deleteCryptoData(ticker));
          dispatch(
            deleteInvestmentResult({
              id: ticker,
              type: 'cryptos',
              invested: 0,
              result: 0,
              period: 'all',
              currency: 'BRL',
            }),
          );
          tooltip('Criptomoeda removida com sucesso!');
        });
    },
    [dispatch],
  );
}
export default useDeleteCrypto;
