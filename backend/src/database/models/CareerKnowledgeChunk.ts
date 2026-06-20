import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICareerKnowledgeChunk extends Document {
  sourceType: string;
  sourceId: Types.ObjectId | string;
  title: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const careerKnowledgeChunkSchema = new Schema<ICareerKnowledgeChunk>(
  {
    sourceType: { type: String, required: true },
    sourceId: { type: Schema.Types.Mixed, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    embedding: {
      type: [Number],
      required: true,
      validate: [
        (val: number[]) => val.length === 384,
        '{PATH} must be an array of length 384'
      ]
    },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

// We define the vector search index here as documentation, 
// though Atlas Vector Search indexes are typically created via the Atlas UI or API.
// Name: career_knowledge_vector
// Configuration: { "type": "vectorSearch", "fields": [{ "type": "vector", "path": "embedding", "numDimensions": 384, "similarity": "cosine" }] }

export const CareerKnowledgeChunk = mongoose.model<ICareerKnowledgeChunk>(
  'CareerKnowledgeChunk',
  careerKnowledgeChunkSchema
);
