export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  number: string;
  name: string;
  tagline?: string;
  description: string;
  category: 'ALL' | 'SYSTEMS' | 'AI / ML' | 'INTERFACES';
  technologies: string[];
  metrics?: ProjectMetric[];
  architecturePoints?: string[];
  image: string;
  githubUrl?: string;
  liveUrl?: string;
  year?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface TimelineItem {
  id: string;
  period: string;
  title: string;
  institution: string;
  location: string;
  description: string;
  tags: string[];
}
