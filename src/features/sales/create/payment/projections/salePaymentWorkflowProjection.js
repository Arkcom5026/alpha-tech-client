export const projectSalePaymentWorkflow = ({
  calculation,
  paymentError,
  completionWarning = null,
  isConfirmEnabled,
  recovery = null,
  handlers,
}) => ({
  calculation,
  feedback: {
    error: paymentError,
    warning: completionWarning,
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
