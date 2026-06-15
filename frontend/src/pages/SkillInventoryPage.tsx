import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { skillsApi } from '../features/acrg/api/skills.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { useToast } from '../lib/ToastContext';
import { BookOpen, Plus, FileText } from 'lucide-react';

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
});

const evidenceSchema = z.object({
  evidenceType: z.string().optional(),
  evidenceUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
});

type SkillFormData = z.infer<typeof skillSchema>;
type EvidenceFormData = z.infer<typeof evidenceSchema>;

export const SkillInventoryPage: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterProficiency, setFilterProficiency] = useState('');
  
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['skills', filterCategory, filterProficiency],
    queryFn: () => skillsApi.getSkills({ category: filterCategory, proficiencyLevel: filterProficiency }),
  });

  const {
    register: registerSkill,
    handleSubmit: handleSkillSubmit,
    reset: resetSkill,
    formState: { errors: skillErrors, isSubmitting: isSkillSubmitting },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: { proficiencyLevel: 'beginner' }
  });

  const {
    register: registerEvidence,
    handleSubmit: handleEvidenceSubmit,
    reset: resetEvidence,
    formState: { errors: evidenceErrors, isSubmitting: isEvidenceSubmitting },
  } = useForm<EvidenceFormData>({
    resolver: zodResolver(evidenceSchema),
  });

  const onAddSkill = async (data: SkillFormData) => {
    try {
      await skillsApi.createSkill(data);
      showToast('Skill added!', 'success');
      setIsSkillModalOpen(false);
      resetSkill();
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || err?.message || 'Failed to add skill', 'error');
    }
  };

  const onAddEvidence = async (data: EvidenceFormData) => {
    if (!selectedSkillId) return;
    try {
      await skillsApi.addEvidence(selectedSkillId, data);
      showToast('Evidence added successfully', 'success');
      setIsEvidenceModalOpen(false);
      resetEvidence();
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to add evidence', 'error');
    }
  };

  const openAddEvidenceModal = (skillId: string) => {
    setSelectedSkillId(skillId);
    resetEvidence();
    setIsEvidenceModalOpen(true);
  };

  const openAddSkillModal = () => {
    resetSkill();
    setIsSkillModalOpen(true);
  };

  const skills = data?.data || [];

  const groupedSkills = useMemo(() => {
    return skills.reduce((acc: any, skill: any) => {
      const cat = skill.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [skills]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Skill Inventory</h1>
        <Button onClick={openAddSkillModal} className="gap-2">
          <Plus className="w-4 h-4" /> Add Skill
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Filter by category..." 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Select
            options={[
              { value: '', label: 'All Proficiencies' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'expert', label: 'Expert' },
            ]}
            value={filterProficiency}
            onChange={(e) => setFilterProficiency(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} className="h-32" />)}
        </div>
      )}

      {isError && <ErrorAlert message="Failed to load skills" onRetry={refetch} />}

      {!isLoading && !isError && skills.length === 0 && (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="No skills found"
          description="Add your current skills to help the AI generate an accurate gap analysis."
          action={<Button onClick={openAddSkillModal}>Add your first skill</Button>}
        />
      )}

      {!isLoading && !isError && Object.keys(groupedSkills).map((category) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedSkills[category].map((skill: any) => (
              <div key={skill._id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{skill.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge status="processing" label={skill.proficiencyLevel} />
                  </div>
                  {skill.evidence && skill.evidence.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidence</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {skill.evidence.map((ev: any, i: number) => (
                          <li key={i} className="truncate">
                            {ev.evidenceUrl ? (
                              <a href={ev.evidenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                {ev.evidenceType || 'Link'}
                              </a>
                            ) : (
                              ev.evidenceType || 'Evidence'
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <Button variant="ghost" className="w-full text-blue-600 gap-2" onClick={() => openAddEvidenceModal(skill._id)}>
                    <FileText className="w-4 h-4" /> Add Evidence
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Skill Modal */}
      <Modal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} title="Add New Skill">
        <form onSubmit={handleSkillSubmit(onAddSkill)} className="space-y-4 pt-2">
          <Input label="Skill Name *" {...registerSkill('name')} error={skillErrors.name?.message} />
          <Input label="Category *" {...registerSkill('category')} error={skillErrors.category?.message} />
          <Select 
            label="Proficiency Level *" 
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'expert', label: 'Expert' },
            ]}
            {...registerSkill('proficiencyLevel')} 
            error={skillErrors.proficiencyLevel?.message} 
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsSkillModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSkillSubmitting}>Add Skill</Button>
          </div>
        </form>
      </Modal>

      {/* Add Evidence Modal */}
      <Modal isOpen={isEvidenceModalOpen} onClose={() => setIsEvidenceModalOpen(false)} title="Add Skill Evidence">
        <form onSubmit={handleEvidenceSubmit(onAddEvidence)} className="space-y-4 pt-2">
          <Input label="Evidence Type" placeholder="e.g. Certificate, Project Repo" {...registerEvidence('evidenceType')} error={evidenceErrors.evidenceType?.message} />
          <Input label="URL" type="url" placeholder="https://..." {...registerEvidence('evidenceUrl')} error={evidenceErrors.evidenceUrl?.message} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...registerEvidence('description')}
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsEvidenceModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isEvidenceSubmitting}>Save Evidence</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
