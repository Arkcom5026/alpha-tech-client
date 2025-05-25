import apiClient from '@/utils/apiClient';


export const createBranch = async (token, form) => {
    // code body
    return apiClient.post('/api/branch', form, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const listBranch = async (form) => {
    // code body
    return apiClient.get('/api/branch', {
      
    })
}

export const removeBranch = async (token, id) => {
    // code body
    return apiClient.delete('/api/branch/'+id, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}