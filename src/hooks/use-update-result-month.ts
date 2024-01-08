import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  updateResultMonth,
} from '~/features/investments-result-slice/investments-result-slice';

function useUpdateResultMonth() {
  const dispatch = useDispatch();
  return useCallback(
    (result: number) => {
      dispatch(
        updateResultMonth(result),
      );
    },
    [],
  );
}
export default useUpdateResultMonth;
