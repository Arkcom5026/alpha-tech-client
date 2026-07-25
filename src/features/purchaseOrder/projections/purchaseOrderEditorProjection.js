export const projectPurchaseOrderEditorState = (purchaseOrder, fallbackDate) => ({
  supplier: purchaseOrder?.supplier || null,
  orderDate: purchaseOrder?.createdAt?.substring(0, 10) || fallbackDate,
  note: purchaseOrder?.note || '',
  items: purchaseOrder?.items || [],
});

export const projectPurchaseOrderSupplierCreditHint = (supplier, suppliers = []) => {
  if (!supplier?.id) return null;

  const matchedSupplier = suppliers.find(
    (row) => Number(row?.id) === Number(supplier.id)
  );

  if (!matchedSupplier) return null;

  return {
    used: Number(matchedSupplier.creditBalance) || 0,
    total: Number(matchedSupplier.creditLimit) || 0,
  };
};
