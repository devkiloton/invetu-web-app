import { useDispatch } from 'react-redux';
import { firebaseClient } from '~/clients/firebase-client/firebase-client';
import { deleteFixedIncome } from '~/features/investments/investments-slice';
import { useAuth } from '~/lib/firebase';
import useSnackbar from './use-snackbar';
import { deleteInvestmentResult } from '~/features/investments-result-slice/investments-result-slice';

export const useDeleteFixedIncome = () => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const snackbar = useSnackbar();
  return async (name: string) => {
    firebaseClient()
      .firestore.investments.fixedIncomes.delete(auth.currentUser?.uid!, name)
      .then(() => {
        dispatch(deleteFixedIncome(name));
        dispatch(
          deleteInvestmentResult({
            id: name,
            type: 'fixedIncomes',
            invested: 0,
            result: 0,
            period: 'all',
            currency: 'BRL',
          }),
        );

        snackbar('Investimento removido com sucesso!');
      });
  };
};
