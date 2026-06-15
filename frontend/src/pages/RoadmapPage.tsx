import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { roadmapApi } from '../features/acrg/api/roadmap.api';
import { progressApi } from '../features/acrg/api/progress.api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { FileUploader, type UploadedFileResult } from '../components/ui/FileUploader';
import { useToast } from '../lib/ToastContext';
import { Map, CheckCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const RoadmapPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loggingProgressFor, setLoggingProgressFor] = useState<string | null>(null);
  const [progressAttachment, setProgressAttachment] = useState<UploadedFileResult | null>(null);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: listData, isLoading: isListLoading, isError: isListError, refetch: refetchList } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => roadmapApi.getRoadmaps(),
  });

  const { data: detailData, isLoading: isDetailLoading, refetch: refetchDetail } = useQuery({
    queryKey: ['roadmap', selectedId],
    queryFn: () => roadmapApi.getRoadmapById(selectedId!),
    enabled: !!selectedId,
  });

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

  const handleActivate = async () => {
    if (!selectedId) return;
    try {
      await roadmapApi.activateRoadmap(selectedId);
      showToast('Roadmap activated successfully', 'success');
      refetchDetail();
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to activate roadmap', 'error');
    }
  };

  const onLogProgress = async (formData: any) => {
    if (!selectedId || !loggingProgressFor) return;
    try {
      await progressApi.createProgress({
        roadmapId: selectedId,
        milestoneId: loggingProgressFor,
        note: formData.note,
        evidenceUrl: formData.evidenceUrl,
        fileName: progressAttachment?.fileName,
        publicId: progressAttachment?.publicId,
        resourceType: progressAttachment?.resourceType,
        fileSize: progressAttachment?.fileSize,
        flaggedForReview: formData.flaggedForReview,
      });
      showToast('Progress logged successfully', 'success');
      setLoggingProgressFor(null);
      setProgressAttachment(null);
      reset();
      refetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Failed to log progress', 'error');
    }
  };

  if (!selectedId) {
    const roadmaps = listData?.data || [];
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Career Roadmaps</h1>
        
        {isListLoading && <LoadingSkeleton className="h-64" />}
        {isListError && <ErrorAlert message="Failed to load roadmaps" onRetry={refetchList} />}
        
        {!isListLoading && !isListError && roadmaps.length === 0 && (
          <EmptyState
            icon={<Map className="w-12 h-12" />}
            title="No Roadmaps Found"
            description="Generate a roadmap from a completed Gap Analysis."
          />
        )}

        {!isListLoading && roadmaps.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roadmaps.map((r: any) => (
              <div 
                key={r._id} 
                className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                onClick={() => setSelectedId(r._id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge status={r.status} />
                  <span className="text-sm font-medium text-gray-500">{r.completionPercentage || 0}% Complete</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 flex-1">Roadmap from Gap Analysis</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Created on: {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const roadmap = detailData?.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => setSelectedId(null)} className="mb-2">
        &larr; Back to Roadmaps
      </Button>

      {isDetailLoading && <LoadingSkeleton className="h-[500px]" />}
      
      {!isDetailLoading && roadmap && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Your Career Roadmap</h2>
                <Badge status={roadmap.status} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-md mt-4">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${roadmap.completionPercentage || 0}%` }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{roadmap.completionPercentage || 0}% Completed</p>
            </div>
            
            {roadmap.status === 'draft' && (
              <Button onClick={handleActivate}>Activate Roadmap</Button>
            )}
          </div>

          <div className="p-6">
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
              {roadmap.milestones?.map((milestone: any, idx: number) => {
                const isCompleted = !!milestone.completedAt;
                return (
                  <div key={milestone._id} className="mb-10 ml-6 relative">
                    <span className="absolute -left-9 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-8 ring-white">
                      <span className="text-blue-800 text-xs font-bold">
                        {milestone.orderIndex !== undefined ? milestone.orderIndex + 1 : idx + 1}
                      </span>
                    </span>

                    <div className={twMerge(clsx(
                      "border rounded-lg p-4 bg-white",
                      isCompleted ? "border-green-200 bg-green-50/30" : "border-gray-200"
                    ))}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {isCompleted ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-gray-400" />}
                          <h4 className={twMerge(clsx("font-semibold", isCompleted ? "text-gray-900" : "text-gray-700"))}>
                            {milestone.title}
                          </h4>
                        </div>
                        <Badge status={isCompleted ? 'completed' : 'pending'} />
                      </div>

                      <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                      
                      {milestone.dueDate && (
                        <p className="text-xs text-gray-500 mt-2">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                      )}

                      {roadmap.status === 'active' && !isCompleted && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {loggingProgressFor === milestone._id ? (
                            <form onSubmit={handleSubmit(onLogProgress)} className="space-y-3 bg-gray-50 p-4 rounded-md border border-gray-200">
                              <h5 className="font-medium text-sm text-gray-900">Log Progress</h5>
                              <div className="flex flex-col gap-1">
                                <textarea
                                  {...register('note')}
                                  placeholder="What did you accomplish?"
                                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  rows={2}
                                  required
                                />
                              </div>
                              <FileUploader
                                label="Certificate or screenshot"
                                onUploadSuccess={(result) => {
                                  setProgressAttachment(result);
                                  setValue('evidenceUrl', result.secureUrl);
                                }}
                                onUploadError={(err: any) => showToast(err?.message || String(err), 'error')}
                              />
                              <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="checkbox" {...register('flaggedForReview')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                Request mentor review
                              </label>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" size="sm" type="button" onClick={() => { setLoggingProgressFor(null); setProgressAttachment(null); reset(); }}>Cancel</Button>
                                <Button size="sm" type="submit" isLoading={isSubmitting}>Submit</Button>
                              </div>
                            </form>
                          ) : (
                            <Button variant="secondary" size="sm" onClick={() => setLoggingProgressFor(milestone._id)}>
                              Log Progress
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
