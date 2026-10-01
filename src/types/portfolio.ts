export interface Project {
  id: string;
  number: string;
  name: string;
  tagline?: string;
  description: string;
  technologies: string[];
  image: string;
  githubUrl?: string;
  liveUrl?: string;
  year?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}
