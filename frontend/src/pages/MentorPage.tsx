import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { mentorApi } from '../features/acrg/api/mentor.api';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { Button } from '../components/ui/Button';
import { useToast } from '../lib/ToastContext';
import { Users, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export const MentorPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mentorQueue'],
    queryFn: () => mentorApi.getMentorQueue(),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (formData: any, updateId: string) => {
    try {
      await mentorApi.addComment({
        targetId: updateId,
        targetModel: 'ProgressUpdate',
        comment: formData.comment,
        actionRequired: formData.actionRequired,
      });
      showToast('Feedback submitted successfully', 'success');
      setExpandedId(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ['mentorQueue'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    }
  };

  const updates = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-gray-800" />
        <h1 className="text-2xl font-bold text-gray-900">Mentor Queue</h1>
      </div>

      {isLoading && <LoadingSkeleton className="h-64" />}
      {isError && <ErrorAlert message="Failed to load queue" onRetry={refetch} />}

      {!isLoading && !isError && updates.length === 0 && (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="Queue is empty"
          description="No pending student updates require your review at this time."
        />
      )}

      {!isLoading && updates.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-200">
          {updates.map((update: any) => {
            const isExpanded = expandedId === update._id;
            return (
              <div key={update._id} className="flex flex-col">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : update._id)}
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">Student Needs Review</h3>
                    <p className="text-sm text-gray-500 mt-1">Submitted on {new Date(update.createdAt).toLocaleDateString()}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                {isExpanded && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Student Note</h4>
                        <p className="text-sm text-gray-800 mt-1 bg-white p-3 border border-gray-200 rounded-md">
                          {update.note || 'No note provided.'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Evidence</h4>
                        {update.evidenceUrl ? (
                          <a href={update.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1 text-sm text-blue-600 hover:underline bg-white p-3 border border-gray-200 rounded-md w-full">
                            View Evidence <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1 bg-white p-3 border border-gray-200 rounded-md">No evidence attached.</p>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit((data) => onSubmit(data, update._id))} className="space-y-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Your Feedback</label>
                        <textarea
                          {...register('comment', { required: true })}
                          className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                          rows={3}
                          placeholder="Provide constructive feedback..."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input type="checkbox" {...register('actionRequired')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          Requires student action / revision
                        </label>
                        <div className="flex gap-2">
                          <Button variant="ghost" type="button" onClick={() => setExpandedId(null)}>Cancel</Button>
                          <Button type="submit" isLoading={isSubmitting}>Submit Feedback</Button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
