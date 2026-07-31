export const projectSerialNumberUpdateInput = ({ barcode, serialNumber } = {}) => {
  const normalizedBarcode = String(barcode ?? '').trim();
  if (!normalizedBarcode) throw new Error('Missing barcode');

  return {
    barcode: normalizedBarcode,
    serialNumber: String(serialNumber ?? '').trim(),
  };
};

export const projectSerialNumberUpdateResult = (sourceResponse) => ({
  sourceResponse,
});
