export enum Role {
  STUDENT = 'student',
  CAREER_MENTOR = 'career_mentor',
  PLACEMENT_OFFICER = 'placement_officer',
  CAREER_CONTENT_ADMIN = 'career_content_admin',
}

export enum GoalPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum JobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  COMPLETED_WITH_FALLBACK = 'completed_with_fallback',
  FAILED = 'failed',
}

export enum EducationLevel {
  HIGH_SCHOOL = 'high_school',
  BACHELORS = 'bachelors',
  MASTERS = 'masters',
  PHD = 'phd',
  OTHER = 'other',
}
