import { Project, SkillCategory } from '../types/portfolio';

// Initial project showcase structure ready for Nithish to fill with real projects
export const sampleProjects: Project[] = [
  {
    id: 'project-1',
    number: '01',
    name: 'Distributed Systems & Real-time Telemetry',
    tagline: 'High-throughput stream processing engine with fault-tolerant worker pools',
    description: 'An exploration in building low-latency distributed pipeline architecture designed to handle concurrent event streams with minimal memory overhead and zero data loss under simulated network partitions.',
    technologies: ['TypeScript', 'Node.js', 'Redis', 'Docker', 'WebSockets'],
    image: '/src/assets/images/project_preview_systems_1790178775486.jpg',
    githubUrl: 'https://github.com/nithishs',
    liveUrl: 'https://github.com/nithishs',
    year: '2025',
  },
  {
    id: 'project-2',
    number: '02',
    name: 'Neural Perception & Feature Extraction',
    tagline: 'Computer vision framework for high-dimensional geometric embedding',
    description: 'An applied machine learning system focused on deep feature representation and spatial clustering, evaluating latent representation fidelity across multi-scale image inputs.',
    technologies: ['Python', 'PyTorch', 'Computer Vision', 'FastAPI', 'NumPy'],
    image: '/src/assets/images/project_preview_ai_model_1790178786525.jpg',
    githubUrl: 'https://github.com/nithishs',
    liveUrl: 'https://github.com/nithishs',
    year: '2025',
  },
  {
    id: 'project-3',
    number: '03',
    name: 'Developer Terminal & Interactive Workspace',
    tagline: 'Keyboard-first productivity client with sub-10ms input feedback',
    description: 'A developer environment built from first principles, integrating system telemetry, custom code editing ergonomics, and real-time execution workflows without bloat.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'REST APIs'],
    image: '/src/assets/images/project_preview_interface_1790178798622.jpg',
    githubUrl: 'https://github.com/nithishs',
    liveUrl: 'https://github.com/nithishs',
    year: '2024',
  },
];

export const skillCategories: SkillCategory[] = [
  {
    category: 'DEVELOPMENT',
    items: [
      'React',
      'TypeScript',
      'JavaScript (ESNext)',
      'Node.js',
      'Python',
      'Next.js',
      'Express',
      'Tailwind CSS',
      'REST APIs',
      'C / C++',
    ],
  },
  {
    category: 'AI / ML',
    items: [
      'PyTorch',
      'TensorFlow',
      'Scikit-Learn',
      'Computer Vision',
      'LLM Integration',
      'Data Pipelines',
      'Model Evaluation',
      'Hugging Face',
    ],
  },
  {
    category: 'DATABASES',
    items: [
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'SQLite',
      'Vector Databases',
      'Database Modeling',
      'Query Optimization',
    ],
  },
  {
    category: 'TOOLS',
    items: [
      'Git & GitHub',
      'Docker',
      'Linux CLI',
      'Postman',
      'Vite',
      'Vercel',
      'VS Code',
      'CI / CD Pipelines',
    ],
  },
];

export const personalInfo = {
  name: 'NITHISH S',
  shortBio: 'Software Developer & ISE Student',
  institution: 'RV College of Engineering, Bengaluru',
  degree: 'Information Science Engineering',
  metadataTag: 'ISE • RVCE • BENGALURU',
  headline: 'Building practical software, intelligent systems and products that solve real problems.',
  aboutParagraphs: [
    "I'm Nithish S, an Information Science Engineering student at RV College of Engineering, Bengaluru.",
    'I enjoy building software products, exploring AI/ML, and understanding how systems work underneath the interface.',
    'I care about creating projects that are technically interesting, useful and worth putting into the real world.',
  ],
  contact: {
    email: 'nithishsnithishs96@gmail.com',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    status: 'AVAILABLE FOR OPPORTUNITIES',
  },
};
