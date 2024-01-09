import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  InvestmentResult,
  InvestmentType,
  addInvestmentResult,
} from '~/features/investments-result-slice/investments-result-slice';

function useAddInvestmentResult() {
  const dispatch = useDispatch();
  return useCallback(
    (investmentResult: InvestmentResult, investmentType: InvestmentType) => {
      dispatch(
        addInvestmentResult({ ...investmentResult, type: investmentType }),
      );
    },
    [],
  );
}
export default useAddInvestmentResult;
