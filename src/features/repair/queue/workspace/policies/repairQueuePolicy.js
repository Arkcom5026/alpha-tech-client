import { REPAIR_LANES, groupByStatus } from '../../../utils/repairRuntime';

const normalizeQuery = (value) => String(value || '').trim().toLowerCase();

export const getRepairQueueSearchValues = (job) => [
  job?.jobNo,
  job?.deviceModel,
  job?.reportedSymptoms,
  job?.customerName,
  job?.stockItem?.barcode,
  job?.stockItem?.serialNumber,
  job?.device?.barcode,
  job?.device?.serialNumber,
  job?.device?.imei,
];

export const filterRepairJobs = (jobs = [], query = '') => {
  const normalized = normalizeQuery(query);
  if (!normalized) return jobs;

  return jobs.filter((job) =>
    getRepairQueueSearchValues(job)
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  );
};

export const projectRepairQueue = (jobs = [], query = '') => {
  const filtered = filterRepairJobs(jobs, query);
  return {
    filtered,
    lanes: groupByStatus(filtered, REPAIR_LANES),
  };
};
