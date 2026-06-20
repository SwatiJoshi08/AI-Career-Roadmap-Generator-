import { RoadmapExplanation } from '../database/models/RoadmapExplanation';
import mongoose from 'mongoose';

export const generateExplanationsForRoadmap = async (
  roadmapId: mongoose.Types.ObjectId,
  roadmapData: any,
  gapAnalysis: any
) => {
  const explanations = [];

  // Mocking explanation generation based on the gap analysis and roadmap
  if (roadmapData.phases) {
    for (const phase of roadmapData.phases) {
      if (phase.skills) {
        for (const skill of phase.skills) {
          // Find matching retrieved document if any
          const sourceId = gapAnalysis.retrievedDocuments?.[0] || 'O*NET database';
          
          explanations.push({
            roadmapId,
            phaseId: phase.title,
            skill: skill,
            reason: `This skill is highly relevant for your target role based on industry standards.`,
            sourceType: 'career_knowledge',
            sourceId,
            confidenceScore: Math.floor(Math.random() * 20) + 80, // 80-100
          });
        }
      }
    }
  }

  if (explanations.length > 0) {
    await RoadmapExplanation.insertMany(explanations);
  }
};
