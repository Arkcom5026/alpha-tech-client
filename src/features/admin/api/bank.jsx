import apiClient from 'apiClient'


export const createBank = async (token, form) => {
    // code body
    return apiClient.post('/api/bank', form, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const listBank = async ( form) => {
    // code body
    return apiClient.get('/api/bank', {
      
    })
}

export const removeBank = async (token, id) => {
    // code body
    return apiClient.delete('/api/bank/'+id, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}