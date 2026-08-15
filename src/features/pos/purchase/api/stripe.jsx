import apiClient from '@/utils/apiClient';

export const payment = async(token) => await apiClient.post('/api/user/create-payment-intent',
    {}, {
    headers: {
        Authorization: `Bearer ${token}`
    }
})
