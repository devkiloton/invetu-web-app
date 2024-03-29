/* eslint-disable react-hooks/rules-of-hooks */
import { UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '~/lib/firebase';

export const initialEntitiesFactory = (
  userCredential: UserCredential,
): void => {
  const firestore = useFirestore();
  // IMPORTANT: Since Firebase's cloud functions doesn't have authentication triggers when signing in with credentials;
  // the backend can't generate the initial data, as a workaround, the front can take the time diff between the creation
  // time and the current time. If it's less than 30s, it's probably a new user, so I judge that there's no problem in
  // allow a data creation on every login in the first 30s.
  if (
    new Date().getTime() -
      new Date(userCredential.user.metadata.creationTime!).getTime() <
    30000
  ) {
    // Configuring docs for the new user
    setDoc(doc(firestore, 'investments', userCredential.user.uid), {
      investedAmount: 0,
      stocks: [],
      cryptos: [],
      treasuries: [],
      fixedIncomes: [],
      cash: [],
    });
  }
};
