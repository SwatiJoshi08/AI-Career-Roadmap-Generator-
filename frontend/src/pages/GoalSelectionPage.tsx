import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { careerGoalApi } from '../features/acrg/api/careerGoal.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { SlideOver } from '../components/ui/SlideOver';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { useToast } from '../lib/ToastContext';
import { Target, Edit2 } from 'lucide-react';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  goalType: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export const GoalSelectionPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['careerGoals', page],
    queryFn: () => careerGoalApi.getGoals({ page, limit: 10 }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  const openCreatePanel = () => {
    setEditingGoal(null);
    reset({ title: '', description: '', targetDate: '', priority: 'medium', goalType: '' });
    setFormError(null);
    setIsPanelOpen(true);
  };

  const openEditPanel = (goal: any) => {
    setEditingGoal(goal);
    reset({
      title: goal.title,
      description: goal.description || '',
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      priority: goal.priority || 'medium',
      goalType: goal.goalType || '',
    });
    setFormError(null);
    setIsPanelOpen(true);
  };

  const onSubmit = async (formData: GoalFormData) => {
    setFormError(null);
    try {
      const payload = {
        ...formData,
        targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString() : undefined,
      };

      if (editingGoal) {
        await careerGoalApi.updateGoal(editingGoal._id, payload);
        showToast('Goal updated successfully', 'success');
      } else {
        await careerGoalApi.createGoal(payload);
        showToast('Goal created successfully', 'success');
      }
      setIsPanelOpen(false);
      queryClient.invalidateQueries({ queryKey: ['careerGoals'] });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save goal');
    }
  };

  const goals = data?.data || [];
  const pagination = data?.meta?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Career Goals</h1>
        <Button onClick={openCreatePanel}>Create Goal</Button>
      </div>

      {isLoading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {isError && <ErrorAlert message="Failed to load goals" onRetry={refetch} />}

      {!isLoading && !isError && goals.length === 0 && (
        <EmptyState
          icon={<Target className="w-12 h-12" />}
          title="No career goals yet"
          description="Start by defining a career goal to get a personalized roadmap."
          action={<Button onClick={openCreatePanel}>Create your first goal</Button>}
        />
      )}

      {!isLoading && !isError && goals.length > 0 && (
        <div className="space-y-4">
          {goals.map((goal: any) => (
            <div key={goal._id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge status={goal.priority || 'medium'} className={
                      goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                      goal.priority === 'low' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    } />
                    <Badge status={goal.status || 'draft'} />
                    {goal.targetDate && (
                      <span className="text-sm text-gray-500">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openEditPanel(goal)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {goal.description && (
                <p className="mt-3 text-gray-600 text-sm">{goal.description}</p>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="secondary"
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit SlideOver */}
      <SlideOver
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={editingGoal ? "Edit Goal" : "Create New Goal"}
      >
        {formError && <div className="mb-4"><ErrorAlert message={formError} /></div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Title *"
            {...register('title')}
            error={errors.title?.message}
            placeholder="e.g. Senior Frontend Developer"
          />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register('description')}
              placeholder="Detailed description of your goal..."
            />
          </div>

          <Input
            label="Target Date"
            type="date"
            {...register('targetDate')}
            error={errors.targetDate?.message}
          />

          <Select
            label="Priority"
            options={[
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            {...register('priority')}
            error={errors.priority?.message}
          />

          <Input
            label="Goal Type"
            {...register('goalType')}
            error={errors.goalType?.message}
            placeholder="e.g. Promotion, Transition"
          />

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsPanelOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
};
