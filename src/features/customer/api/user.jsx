import apiClient from '@/utils/apiClient';

export const createUserCart = async (token, cart) => {
  // code body
  return apiClient.post('/api/user/cart', cart, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const listUserCart = async (token) => {
  // code body
  return apiClient.get('/api/user/cart', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const saveAddress = async (token,address) => {
  // code body
  return apiClient.post('/api/user/address',{address}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const saveOrder = async (token,payload) => {
  // code body
  return apiClient.post('/api/user/order',payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const getOrders = async (token) => {
  // code body
  return apiClient.get('/api/user/order', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

const user = () => {
  return (
    <div>user</div>
  )
}

export default user