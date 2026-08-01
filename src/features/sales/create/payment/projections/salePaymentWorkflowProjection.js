export const projectSalePaymentWorkflow = ({
  calculation,
  paymentError,
  isConfirmEnabled,
  recovery = null,
  handlers,
}) => ({
  calculation,
  feedback: {
    error: paymentError,
    recovery,
  },
  confirmation: {
    enabled: isConfirmEnabled,
    confirm: handlers.confirm,
    retryingExistingCommand: recovery?.state === 'UNCERTAIN' && recovery?.retryable === true,
  },
  deposit: {
    changeUsed: handlers.changeDepositUsed,
  },
  saleMode: {
    change: handlers.changeSaleMode,
  },
  discount: {
    changeBillDiscount: handlers.changeBillDiscount,
  },
});
