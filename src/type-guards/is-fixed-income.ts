import { isNil } from 'lodash-es';
import { FixedIncome } from '~/clients/firebase-client/models/Investments';

export const isFixedIncome = (item: any): item is FixedIncome => {
  return !isNil(item?.index);
};
