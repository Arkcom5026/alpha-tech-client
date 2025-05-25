import apiClient from '@/utils/apiClient'


export const getOrdersAdmin = async (token) => {
    // code body
    return apiClient.get('/api/admin/orders', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const changeOrderStatus = async (token, orderId, orderStatus) => {
    // code body
    return apiClient.put('/api/admin/order-status', { orderId, orderStatus }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const getListAllCustomer = async (token) => {
    // code body
    return apiClient.get('/api/users', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const changeUserStatus = async (token,value) => {
    // code body
    return apiClient.post('/api/user/chang-status',value, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const changeUserRole = async (token,value) => {
    // code body
    return apiClient.post('/api/user/chang-role',value, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}