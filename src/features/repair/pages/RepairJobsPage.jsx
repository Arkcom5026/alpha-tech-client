import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRepairRuntimeStore from '../store/repairRuntimeStore';
import RepairQueueWorkspace from '../queue/workspace/components/RepairQueueWorkspace';
import { projectRepairQueue } from '../queue/workspace/policies/repairQueuePolicy';

const RepairJobsPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [query, setQuery] = useState('');

  const jobs = useRepairRuntimeStore((state) => state.jobs);
  const loading = useRepairRuntimeStore((state) => state.loading);
  const error = useRepairRuntimeStore((state) => state.error);
  const loadJobs = useRepairRuntimeStore((state) => state.loadJobs);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const { lanes } = useMemo(() => projectRepairQueue(jobs, query), [jobs, query]);

  return (
    <RepairQueueWorkspace
      query={query}
      onQueryChange={setQuery}
      onRefresh={loadJobs}
      loading={loading}
      error={error}
      jobs={jobs}
      lanes={lanes}
      onRetry={loadJobs}
      onOpenJob={(job) =>
        navigate(`/${shopSlug}/pos/services/repairs/${job.id}`)
      }
    />
  );
};

export default RepairJobsPage;
