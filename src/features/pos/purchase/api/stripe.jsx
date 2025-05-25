import apiClient from '@/utils/apiClient';
import { toast } from 'react-toastify';

export const payment = async(token) => await apiClient.post('/api/user/create-payment-intent',
    {}, {
    headers: {
        Authorization: `Bearer ${token}`
    }
})

