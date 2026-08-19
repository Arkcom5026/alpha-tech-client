import apiClient from '@/utils/apiClient'

const BASE_PATH = '/finance/store-payment-accounts'

const listStorePaymentAccounts = async ({ includeInactive = false } = {}) => {
  const response = await apiClient.get(BASE_PATH, {
    params: includeInactive ? { includeInactive: 1 } : undefined,
  })
  return response.data
}

const getStorePaymentAccount = async (id) => {
  const response = await apiClient.get(`${BASE_PATH}/${id}`)
  return response.data
}

const createStorePaymentAccount = async (payload) => {
  const response = await apiClient.post(BASE_PATH, payload)
  return response.data
}

const updateStorePaymentAccount = async (id, payload) => {
  const response = await apiClient.patch(`${BASE_PATH}/${id}`, payload)
  return response.data
}

export {
  createStorePaymentAccount,
  getStorePaymentAccount,
  listStorePaymentAccounts,
  updateStorePaymentAccount,
}
