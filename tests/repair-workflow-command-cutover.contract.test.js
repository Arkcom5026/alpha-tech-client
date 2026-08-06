const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const api = read('src/features/repair/api/repairApi.js');
const store = read('src/features/repair/store/repairRuntimeStore.js');
const panel = read('src/features/repair/components/JobRuntimePanel.jsx');
const page = read('src/features/repair/pages/RepairJobDetailPage.jsx');

assert(
  api.includes("apiClient.post(`/repairs/jobs/${id}/workflow/commands`, payload)"),
  'Client must call workflow command endpoint'
);
assert(
  !api.includes("apiClient.patch(`/repairs/jobs/${id}/status`, payload)"),
  'Repair job client must not use legacy status endpoint'
);
assert(store.includes('createCommandKey'), 'Store must generate a unique command key');
assert(
  store.includes('expectedWorkflowStatus'),
  'Store must send expected workflow status for concurrency control'
);
assert(
  store.includes("error.code === 'REPAIR_WORKFLOW_VERSION_CONFLICT'"),
  'Store must recover from workflow version conflicts'
);
assert(
  store.includes('availableWorkflowActions: result?.availableActions || []'),
  'Store must retain server-owned actions'
);
assert(
  !panel.includes('REPAIR_TRANSITIONS'),
  'Job panel must not own legacy transition rules'
);
assert(
  panel.includes('availableWorkflowActions = []'),
  'Job panel must render server-owned actions'
);
assert(
  panel.includes('expectedWorkflowStatus: workflowStatus'),
  'Job panel must submit the rendered workflow version'
);
assert(
  page.includes('availableWorkflowActions={availableWorkflowActions}'),
  'Job detail page must wire server-owned actions into the panel'
);

console.log('Repair workflow command client cutover contract: PASS');
