import { Project, SkillCategory } from '../types/portfolio';

// Initial project showcase structure ready for Nithish to fill with real projects
export const sampleProjects: Project[] = [
  {
    id: 'project-1',
    number: '01',
    name: 'Distributed Systems & Real-time Telemetry',
    tagline: 'High-throughput stream processing engine with fault-tolerant worker pools',
    description: 'An exploration in building low-latency distributed pipeline architecture designed to handle concurrent event streams with minimal memory overhead and zero data loss under simulated network partitions.',
    category: 'SYSTEMS',
    technologies: ['TypeScript', 'Node.js', 'Redis', 'Docker', 'WebSockets'],
    metrics: [
      { label: 'Latency', value: '< 1.2ms' },
      { label: 'Throughput', value: '100K msg/s' },
      { label: 'Resilience', value: '99.99%' },
    ],
    architecturePoints: [
      'Multi-stage event ingestion with backpressure regulation and Redis streaming buffers.',
      'Worker pool failover mechanism with automated heartbeat consensus.',
      'Sub-millisecond WebSocket broadcast pipeline for real-time telemetry analytics.',
    ],
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
    category: 'AI / ML',
    technologies: ['Python', 'PyTorch', 'Computer Vision', 'FastAPI', 'NumPy'],
    metrics: [
      { label: 'Fidelity', value: '98.4%' },
      { label: 'Inference', value: '18ms' },
      { label: 'Embedding', value: '512-dim' },
    ],
    architecturePoints: [
      'Convolutional feature extraction pipeline with attention-weighted spatial pooling.',
      'Vector dimensionality reduction and t-SNE projection for cluster visualization.',
      'FastAPI async inference microservice with GPU tensor quantization.',
    ],
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
    category: 'INTERFACES',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'REST APIs'],
    metrics: [
      { label: 'Input Latency', value: '< 8ms' },
      { label: 'FPS Target', value: '60 FPS' },
      { label: 'Bundle', value: '< 180KB' },
    ],
    architecturePoints: [
      'Virtualised DOM rendering engine maintaining rock-solid 60 FPS under heavy keystroke rate.',
      'Custom command parser with fuzzy matching and contextual autocomplete.',
      'Zero-dependency state store with decoupled render cycles for minimal repaint churn.',
    ],
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
    github: 'https://github.com/nithishs',
    linkedin: 'https://www.linkedin.com/in/nithish-s1',
    status: 'AVAILABLE FOR OPPORTUNITIES',
  },
};

export const timelineData = [
  {
    id: 'edu-1',
    period: '2022 – 2026',
    title: 'B.E. in Information Science and Engineering',
    institution: 'RV College of Engineering (RVCE)',
    location: 'Bengaluru, India',
    description: 'Undergraduate engineering curriculum emphasizing discrete mathematics, advanced data structures, algorithmic complexity, distributed systems architecture, and intelligent systems.',
    tags: ['Algorithms', 'Distributed Systems', 'Operating Systems', 'DBMS', 'Computer Networks'],
  },
  {
    id: 'proj-1',
    period: '2024 – 2025',
    title: 'Independent Systems & Machine Learning Engineering',
    institution: 'Research & Product Exploration',
    location: 'Bengaluru, India',
    description: 'Architecting high-concurrency event stream pipelines, evaluating computer vision spatial clustering representations with PyTorch, and crafting keyboard-first developer tooling.',
    tags: ['Python', 'TypeScript', 'Redis', 'PyTorch', 'Docker', 'WebSockets'],
  },
  {
    id: 'cert-1',
    period: '2023 – 2024',
    title: 'Open Source & Technical Hackathons',
    institution: 'Community & Project Building',
    location: 'Bengaluru, India',
    description: 'Built production web apps, participated in collegiate technical hackathons, and contributed to developer tools emphasizing performance-first zero-bloat ergonomics.',
    tags: ['React', 'Next.js', 'REST APIs', 'PostgreSQL', 'Tailwind CSS'],
  },
];

export const resumeData = {
  education: {
    degree: 'B.E. in Information Science & Engineering',
    institution: 'RV College of Engineering (RVCE)',
    location: 'Bengaluru, India',
    period: '2022 – 2026',
    coursework: [
      'Data Structures & Algorithms',
      'Operating Systems',
      'Database Management Systems',
      'Computer Networks',
      'Distributed Systems',
      'Machine Learning & Deep Learning',
      'Object Oriented Design (Java / C++)',
      'Cloud Architecture',
    ],
  },
  coreStrengths: [
    'Low-latency event streaming and fault-tolerant worker pool architectures.',
    'Applied machine learning pipelines with PyTorch, NumPy, and FastAPI.',
    '60 FPS hardware-accelerated frontend engineering with WebGL, Canvas, and React.',
    'Containerized deployment workflows with Docker, Linux CLI, and CI/CD pipelines.',
  ],
};
