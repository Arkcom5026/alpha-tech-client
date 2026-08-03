const activeOperations = new Set();

export const loading = {
  start(key) {
    activeOperations.add(key);
  },

  stop(key) {
    activeOperations.delete(key);
  },

  isLoading(key) {
    return activeOperations.has(key);
  },

  getActiveOperations() {
    return Array.from(activeOperations);
  },

  reset() {
    activeOperations.clear();
  },
};
