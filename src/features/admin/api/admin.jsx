import axios from 'axios'


export const getOrdersAdmin = async (token) => {
    // code body
    return axios.get('http://localhost:5000/api/admin/orders', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const changeOrderStatus = async (token, orderId, orderStatus) => {
    // code body
    return axios.put('http://localhost:5000/api/admin/order-status', { orderId, orderStatus }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const getListAllCustomer = async (token) => {
    // code body
    return axios.get('http://localhost:5000/api/users', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const changeUserStatus = async (token,value) => {
    // code body
    return axios.post('http://localhost:5000/api/user/chang-status',value, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const changeUserRole = async (token,value) => {
    // code body
    return axios.post('http://localhost:5000/api/user/chang-role',value, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}