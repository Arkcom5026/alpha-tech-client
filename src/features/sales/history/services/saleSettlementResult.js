export const projectSaleSettlementSuccess = (data) => ({
  ok: true,
  data: data ?? null,
  error: '',
  code: null,
  status: 200,
  detail: null,
});

export const projectSaleSettlementFailure = (error) => {
  const responseData = error?.response?.data;
  const status = Number(error?.response?.status || error?.status || 0) || 0;
  const message =
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    'ไม่สามารถปิดบิลได้';

  return {
    ok: false,
    data: null,
    error: message,
    code: responseData?.code || error?.code || null,
    status,
    detail: responseData?.detail || error?.detail || null,
  };
};
