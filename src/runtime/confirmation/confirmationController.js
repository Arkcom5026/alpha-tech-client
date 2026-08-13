import { CONFIRMATION_STATUS } from './confirmationTypes';

const pendingConfirmations = new Map();

export const confirmation = {
  confirm({ key }) {
    return new Promise((resolve) => {
      pendingConfirmations.set(key, {
        status: CONFIRMATION_STATUS.PENDING,
        resolve,
      });
    });
  },

  resolve(key, accepted) {
    const request = pendingConfirmations.get(key);

    if (!request) {
      return false;
    }

    pendingConfirmations.delete(key);
    request.status = CONFIRMATION_STATUS.RESOLVED;
    request.resolve(Boolean(accepted));

    return true;
  },

  cancel(key) {
    return confirmation.resolve(key, false);
  },

  hasPending(key) {
    return pendingConfirmations.has(key);
  },

  reset() {
    pendingConfirmations.clear();
  },
};
