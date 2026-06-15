import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { gapAnalysisApi } from '../features/acrg/api/gapAnalysis.api';
import { careerGoalApi } from '../features/acrg/api/careerGoal.api';
import { useInterval } from '../lib/hooks/useInterval';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AiResultCard } from '../components/feedback/AiResultCard';
import { Activity, PlayCircle, Info } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

export const GapAnalysisPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch list of gap analyses
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['gapAnalyses'],
    queryFn: () => gapAnalysisApi.getGapAnalyses(),
  });

  // Fetch career goals for the modal dropdown
  const { data: goalsData } = useQuery({
    queryKey: ['careerGoals'],
    queryFn: () => careerGoalApi.getGoals({ limit: 100 }),
  });

  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm();

  // Polling logic
  useInterval(() => {
    if (pollingId) {
      gapAnalysisApi.getStatus(pollingId).then((res) => {
        const status = res.data?.jobStatus;
        if (['completed', 'completed_with_fallback', 'failed'].includes(status)) {
          setPollingId(null);
          queryClient.invalidateQueries({ queryKey: ['gapAnalyses'] });
          if (status === 'failed') {
            showToast('Analysis failed', 'error');
          } else {
            showToast('Analysis completed!', 'success');
            setSelectedAnalysisId(pollingId);
          }
        }
      });
    }
  }, pollingId ? 3000 : null);

  const onRunAnalysis = async (formData: any) => {
    try {
      const res = await gapAnalysisApi.createGapAnalysis({ careerGoalId: formData.careerGoalId });
      setIsModalOpen(false);
      reset();
      showToast('Analysis started...', 'info');
      setPollingId(res.data._id);
      queryClient.invalidateQueries({ queryKey: ['gapAnalyses'] });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to start analysis';
      showToast(msg, 'error');
    }
  };

  const analyses = data?.data || [];

  // Selected analysis for viewing details
  const { data: selectedData } = useQuery({
    queryKey: ['gapAnalysis', selectedAnalysisId],
    queryFn: () => gapAnalysisApi.getById(selectedAnalysisId!),
    enabled: !!selectedAnalysisId,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gap Analysis</h1>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2" disabled={!!pollingId}>
          {pollingId ? <><Activity className="w-4 h-4 animate-spin" /> Analyzing...</> : <><PlayCircle className="w-4 h-4" /> Run Analysis</>}
        </Button>
      </div>

      {isLoading && <LoadingSkeleton className="h-64" />}
      {isError && <ErrorAlert message="Failed to load gap analyses" onRetry={refetch} />}

      {!isLoading && !isError && analyses.length === 0 && (
        <EmptyState
          icon={<Activity className="w-12 h-12" />}
          title="No gap analysis run yet"
          description="Run an AI analysis against your career goal to see what you need to learn."
          action={<Button onClick={() => setIsModalOpen(true)}>Run Analysis</Button>}
        />
      )}

      {!isLoading && analyses.length > 0 && !selectedAnalysisId && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analyses.map((analysis: any) => (
            <div 
              key={analysis._id} 
              className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                if (['completed', 'completed_with_fallback'].includes(analysis.jobStatus)) {
                  setSelectedAnalysisId(analysis._id);
                }
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-500">
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </span>
                <Badge status={analysis.jobStatus} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {analysis.careerGoalId?.title || 'Unknown Goal'}
              </h3>
              {['queued', 'processing'].includes(analysis.jobStatus) && (
                <div className="mt-4 flex items-center text-sm text-blue-600 gap-2">
                  <Activity className="w-4 h-4 animate-spin" /> Analyzing your profile...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedAnalysisId && selectedData && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedAnalysisId(null)} className="mb-2">
            &larr; Back to History
          </Button>

          {selectedData.data.jobStatus === 'completed_with_fallback' && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-yellow-800 text-sm">
                <strong>Fallback Mode:</strong> AI was unavailable. This is a template roadmap based on standard patterns. Please review it carefully with your mentor.
              </p>
            </div>
          )}

          <AiResultCard result={selectedData.data.aiResult} gapAnalysisId={selectedAnalysisId} />
        </div>
      )}

      {/* Run Analysis Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Run Gap Analysis">
        <form onSubmit={handleSubmit(onRunAnalysis)} className="space-y-4 pt-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Select Target Goal</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('careerGoalId', { required: true })}
            >
              <option value="">-- Choose a Goal --</option>
              {goalsData?.data?.map((goal: any) => (
                <option key={goal._id} value={goal._id}>{goal.title}</option>
              ))}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Start AI Analysis</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
