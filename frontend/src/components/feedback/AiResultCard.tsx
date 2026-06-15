import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { roadmapApi } from '../../features/acrg/api/roadmap.api';
import { useToast } from '../../lib/ToastContext';
import { useNavigate } from 'react-router-dom';

export const AiResultCard: React.FC<{ result: any; gapAnalysisId: string }> = ({ result, gapAnalysisId }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    try {
      await roadmapApi.createRoadmap({ gapAnalysisId });
      showToast('Roadmap generated successfully!', 'success');
      navigate('/roadmap');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to generate roadmap';
      showToast(msg, 'error');
      setIsGenerating(false);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-blue-600 px-6 py-4">
        <h3 className="text-lg font-bold text-white">AI Gap Analysis Result</h3>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {(result?.phases || []).map((phase: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">Phase {index + 1}: {phase.title}</h4>
                <Badge status="processing" label={`${phase.durationWeeks} weeks`} />
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Skills to Learn</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {(phase.skills || phase.skillsToLearn || []).map((skill: any, i: number) => (
                      <li key={i}>
                        {typeof skill === 'string' ? skill : (skill.name || String(skill))}
                      </li>
                    ))}
                    {!(phase.skills || phase.skillsToLearn || []).length && <li>None</li>}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Resources</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {(phase.resources || []).map((resource: any, i: number) => (
                      <li key={i} className="truncate">
                        {typeof resource === 'string' ? resource : (
                          <>
                            <a href={resource.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              {resource.title}
                            </a>
                            {resource.type && <span> — {resource.type}</span>}
                          </>
                        )}
                      </li>
                    ))}
                    {!(phase.resources || []).length && <li>None</li>}
                  </ul>
                </div>
                <div className="md:col-span-2 mt-2">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Milestones</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {(phase.milestones || []).map((milestone: any, i: number) => (
                      <li key={i}>
                        {typeof milestone === 'string' ? milestone : (
                          <>
                            <strong>{milestone.title}</strong>
                            {milestone.description && <p className="text-xs text-gray-500 pl-4">{milestone.description}</p>}
                          </>
                        )}
                      </li>
                    ))}
                    {!(phase.milestones || []).length && <li>None</li>}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p><strong>Total Duration:</strong> {result?.totalWeeks} weeks</p>
          <p><strong>Confidence:</strong> {result?.confidenceNote}</p>
          <p className="text-xs text-gray-500 mt-2 border-t pt-2 border-gray-200">
            <strong>Disclaimer:</strong> {result?.limitations}
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleGenerateRoadmap} isLoading={isGenerating}>
            Generate Roadmap from This Result &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
};
