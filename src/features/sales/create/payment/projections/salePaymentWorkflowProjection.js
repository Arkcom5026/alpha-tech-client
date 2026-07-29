export const projectSalePaymentWorkflow = ({
  calculation,
  paymentError,
  isConfirmEnabled,
  handlers,
}) => ({
  calculation,
  feedback: {
    error: paymentError,
  },
  confirmation: {
    enabled: isConfirmEnabled,
    confirm: handlers.confirm,
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
