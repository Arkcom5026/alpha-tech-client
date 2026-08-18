const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const projectPurchaseReceiptItemState = ({
  orderedQuantity,
  previouslyReceivedQuantity,
  sessionReceivedQuantity,
  inputQuantity,
  unitCost,
} = {}) => {
  const ordered = Math.max(toNumber(orderedQuantity), 0);
  const previouslyReceived = Math.max(toNumber(previouslyReceivedQuantity), 0);
  const sessionReceived = Math.max(toNumber(sessionReceivedQuantity), 0);
  const input = Math.max(toNumber(inputQuantity), 0);
  const cost = Math.max(toNumber(unitCost), 0);

  const receivedBeforeInput = previouslyReceived + sessionReceived;
  const receivedAfterInput = receivedBeforeInput + input;
  const remainingBeforeInput = Math.max(ordered - receivedBeforeInput, 0);
  const remainingAfterInput = Math.max(ordered - receivedAfterInput, 0);

  return {
    ordered,
    previouslyReceived,
    sessionReceived,
    input,
    cost,
    receivedBeforeInput,
    receivedAfterInput,
    remainingBeforeInput,
    remainingAfterInput,
    lineTotal: input * cost,
    isCompleteAfterInput: remainingAfterInput === 0,
    isOverReceive: receivedAfterInput > ordered,
    canSave: input > 0 && cost >= 0,
  };
};
