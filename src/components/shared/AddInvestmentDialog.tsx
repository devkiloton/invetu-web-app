import { Dialog } from '@headlessui/react';
import AddInvestmentsForm from '../forms/AddInvestmentsForm';
import React from 'react';

interface IAddInvestmentDialog {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
}

const AddInvestmentDialog: React.FC<IAddInvestmentDialog> = ({
  isOpen,
  setIsOpen,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-[100]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="max-w-120 w-full overflow-scroll max-h-[90vh]">
          <AddInvestmentsForm />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default React.memo(AddInvestmentDialog);
