import axios from 'axios'


export const createBank = async (token, form) => {
    // code body
    return axios.post('http://localhost:5000/api/bank', form, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const listBank = async ( form) => {
    // code body
    return axios.get('http://localhost:5000/api/bank', {
      
    })
}

export const removeBank = async (token, id) => {
    // code body
    return axios.delete('http://localhost:5000/api/bank/'+id, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}