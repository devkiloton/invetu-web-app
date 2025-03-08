import { Dialog, Transition } from '@headlessui/react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import React, { Fragment, useCallback, useState } from 'react';
import { useAuth } from '~/lib/firebase';

// #TODO: It's not DRY. It should be refactored.
const SignInWithEmailLink = () => {
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');

  const [step, setStep] = useState(0);

  const handleSendLink = useCallback(() => {
    const actionCodeSettings = {
      url: 'https://app.invetu.com/home',
      handleCodeInApp: true,
      linkDomain: 'app.invetu.com'
    };
    sendSignInLinkToEmail(auth, email, actionCodeSettings).then(() => {
      window.localStorage.setItem('emailForSignIn', email);
    });
    setStep(1);
  }, [auth, email]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="btn btn-outline normal-case gap-3  justify-start px-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          className="fill-current"
          viewBox="0 0 24 24">
          <path d="M12 .02c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.99 6.98l-6.99 5.666-6.991-5.666h13.981zm.01 10h-14v-8.505l7 5.673 7-5.672v8.504z" />
        </svg>
        Entrar com Email
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-[100]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Dialog.Panel className="max-w-120 flex justify-center items-center bg-base-100 w-full overflow-scroll max-h-[90vh] rounded-xl">
            <div className="w-full p-8">
              <Transition
                as={Fragment}
                show={step === 0}
                enter="transform transition duration-[400ms]"
                enterFrom="opacity-0 scale-50"
                enterTo="opacity-100 rotate-0 scale-100"
                leaveFrom="opacity-0 rotate-0 scale-100 "
                leaveTo="opacity-0 rotate-0 scale-95 ">
                <div className="border-none flex flex-col gap-5 h-full items-center justify-center">
                  <div className="flex flex-col gap-2">
                    <h1 className="font-semibold text-lg text-center">
                      Digite seu endereço de email
                    </h1>
                    <h3 className="leading-4 text-xs text-center">
                      Enviaremos um link para seu email para entrar com sua
                      conta.
                    </h3>
                  </div>
                  <input
                    type="email"
                    name="email"
                    onChange={e => setEmail(e.target.value)}
                    required
                    value={email}
                    placeholder="exemplo@email.com"
                    className="input input-bordered w-full"
                  />
                  <button
                    onClick={handleSendLink}
                    className="btn btn-active btn-primary self-end">
                    Enviar link
                  </button>
                </div>
              </Transition>
              <Transition
                as={Fragment}
                show={step === 1}
                enter="transform transition duration-[400ms]"
                enterFrom="opacity-0 scale-50"
                enterTo="opacity-100 rotate-0 scale-100"
                leaveFrom="opacity-100 rotate-0 scale-100 "
                leaveTo="opacity-0 scale-95 ">
                <div className="border-none flex flex-col gap-5 h-full items-center justify-center">
                  <div className="flex flex-col gap-2">
                    <h1 className="font-semibold text-lg text-center">
                      Enviamos um link mágico para seu email
                    </h1>
                    <h3 className="leading-4 text-xs text-center">
                      Clique no link que enviamos para seu email para entrar com
                      sua conta.
                    </h3>
                  </div>
                </div>
              </Transition>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default React.memo(SignInWithEmailLink);
