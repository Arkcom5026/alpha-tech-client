import { loading } from './loadingController';

export async function withLoading(key, task) {
  loading.start(key);

  try {
    return await task();
  } finally {
    loading.stop(key);
  }
}
