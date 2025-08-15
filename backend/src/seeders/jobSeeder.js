const mongoose = require('mongoose');
const Job = require('../models/Job');

const sampleJobs = [
  {
    title: 'Senior Software Engineer',
    company: {
      name: 'TechCorp Inc.',
      logo: 'https://via.placeholder.com/100x100/0066cc/ffffff?text=TC',
      website: 'https://techcorp.com',
      size: 'large',
      industry: 'Technology',
      description: 'Leading technology company specializing in cloud solutions'
    },
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      remote: false,
      hybrid: true
    },
    jobType: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 120000,
      max: 180000,
      currency: 'USD',
      type: 'annual',
      disclosed: true
    },
    description: 'We are looking for a Senior Software Engineer to join our growing team. You will be responsible for developing scalable web applications and mentoring junior developers.',
    requirements: [
      '5+ years of software development experience',
      'Proficiency in JavaScript, React, and Node.js',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Strong problem-solving skills',
      'Bachelor\'s degree in Computer Science or related field'
    ],
    responsibilities: [
      'Design and develop scalable web applications',
      'Mentor junior developers and code review',
      'Collaborate with cross-functional teams',
      'Participate in architectural decisions',
      'Ensure code quality and best practices'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible work arrangements',
      '401(k) with company matching',
      'Professional development opportunities'
    ],
    skills: [
      { name: 'JavaScript', required: true, level: 'advanced' },
      { name: 'React', required: true, level: 'advanced' },
      { name: 'Node.js', required: true, level: 'intermediate' },
      { name: 'AWS', required: false, level: 'intermediate' },
      { name: 'TypeScript', required: false, level: 'intermediate' }
    ],
    applicationInfo: {
      applyUrl: 'https://techcorp.com/careers/senior-software-engineer',
      easyApply: true,
      requiresCoverLetter: false
    },
    source: {
      platform: 'linkedin',
      url: 'https://linkedin.com/jobs/view/123456',
      scrapedAt: new Date()
    },
    status: 'active',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    metadata: {
      views: 45,
      applications: 12,
      saves: 8,
      difficulty: 'medium',
      tags: ['remote-friendly', 'tech', 'startup'],
      featured: true
    }
  },
  {
    title: 'Frontend Developer',
    company: {
      name: 'StartupXYZ',
      logo: 'https://via.placeholder.com/100x100/ff6b35/ffffff?text=SX',
      website: 'https://startupxyz.com',
      size: 'startup',
      industry: 'Technology',
      description: 'Fast-growing fintech startup revolutionizing payments'
    },
    location: {
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      remote: true,
      hybrid: false
    },
    jobType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 80000,
      max: 120000,
      currency: 'USD',
      type: 'annual',
      disclosed: true
    },
    description: 'Join our dynamic team as a Frontend Developer and help build the next generation of payment solutions. Work with cutting-edge technologies in a fast-paced environment.',
    requirements: [
      '3+ years of frontend development experience',
      'Strong proficiency in React and modern JavaScript',
      'Experience with state management (Redux, Context API)',
      'Knowledge of responsive design and CSS frameworks',
      'Familiarity with testing frameworks (Jest, React Testing Library)'
    ],
    responsibilities: [
      'Develop user-facing features using React',
      'Optimize applications for maximum speed and scalability',
      'Collaborate with designers and backend developers',
      'Write clean, maintainable code',
      'Participate in code reviews and team meetings'
    ],
    benefits: [
      'Competitive salary with equity options',
      'Fully remote work environment',
      'Health and wellness stipend',
      'Learning and development budget',
      'Flexible PTO policy'
    ],
    skills: [
      { name: 'React', required: true, level: 'advanced' },
      { name: 'JavaScript', required: true, level: 'advanced' },
      { name: 'CSS', required: true, level: 'intermediate' },
      { name: 'Redux', required: false, level: 'intermediate' },
      { name: 'TypeScript', required: false, level: 'beginner' }
    ],
    applicationInfo: {
      applyUrl: 'https://startupxyz.com/jobs/frontend-developer',
      easyApply: false,
      requiresCoverLetter: true
    },
    source: {
      platform: 'indeed',
      url: 'https://indeed.com/viewjob?jk=abcd1234',
      scrapedAt: new Date()
    },
    status: 'active',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    metadata: {
      views: 32,
      applications: 8,
      saves: 15,
      difficulty: 'easy',
      tags: ['remote', 'fintech', 'react'],
      featured: false
    }
  },
  {
    title: 'Full Stack Developer',
    company: {
      name: 'Enterprise Solutions LLC',
      logo: 'https://via.placeholder.com/100x100/2c3e50/ffffff?text=ES',
      website: 'https://enterprisesolutions.com',
      size: 'large',
      industry: 'Enterprise Software',
      description: 'Leading provider of enterprise software solutions'
    },
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
      remote: false,
      hybrid: true
    },
    jobType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 90000,
      max: 130000,
      currency: 'USD',
      type: 'annual',
      disclosed: true
    },
    description: 'We are seeking a talented Full Stack Developer to join our engineering team. You will work on both frontend and backend development of our enterprise applications.',
    requirements: [
      '4+ years of full stack development experience',
      'Proficiency in both frontend and backend technologies',
      'Experience with React, Node.js, and databases',
      'Knowledge of RESTful APIs and microservices',
      'Strong understanding of software engineering principles'
    ],
    responsibilities: [
      'Develop and maintain web applications',
      'Design and implement RESTful APIs',
      'Work with databases and data modeling',
      'Collaborate with product and design teams',
      'Ensure application performance and scalability'
    ],
    benefits: [
      'Comprehensive health insurance',
      'Retirement savings plan',
      'Professional development opportunities',
      'Hybrid work model',
      'Generous vacation policy'
    ],
    skills: [
      { name: 'React', required: true, level: 'intermediate' },
      { name: 'Node.js', required: true, level: 'intermediate' },
      { name: 'MongoDB', required: true, level: 'intermediate' },
      { name: 'Express.js', required: false, level: 'intermediate' },
      { name: 'Docker', required: false, level: 'beginner' }
    ],
    applicationInfo: {
      applyUrl: 'https://enterprisesolutions.com/careers/fullstack-developer',
      easyApply: true,
      requiresCoverLetter: false
    },
    source: {
      platform: 'glassdoor',
      url: 'https://glassdoor.com/job-listing/fullstack-developer',
      scrapedAt: new Date()
    },
    status: 'active',
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    metadata: {
      views: 67,
      applications: 23,
      saves: 12,
      difficulty: 'medium',
      tags: ['hybrid', 'enterprise', 'fullstack'],
      featured: false
    }
  },
  {
    title: 'React Developer',
    company: {
      name: 'WebDev Agency',
      logo: 'https://via.placeholder.com/100x100/e74c3c/ffffff?text=WD',
      website: 'https://webdevagency.com',
      size: 'medium',
      industry: 'Digital Agency',
      description: 'Creative digital agency building amazing web experiences'
    },
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: true,
      hybrid: false
    },
    jobType: 'contract',
    experienceLevel: 'junior',
    salary: {
      min: 50,
      max: 75,
      currency: 'USD',
      type: 'hourly',
      disclosed: true
    },
    description: 'Looking for a talented React Developer to work on exciting client projects. This is a contract position with potential for full-time conversion.',
    requirements: [
      '2+ years of React development experience',
      'Strong JavaScript fundamentals',
      'Experience with modern development tools',
      'Understanding of responsive design',
      'Portfolio showcasing React projects'
    ],
    responsibilities: [
      'Build responsive React applications',
      'Work closely with design team',
      'Implement pixel-perfect designs',
      'Optimize applications for performance',
      'Participate in client meetings'
    ],
    benefits: [
      'Competitive hourly rate',
      'Flexible schedule',
      'Remote work opportunity',
      'Exposure to diverse projects',
      'Potential for full-time position'
    ],
    skills: [
      { name: 'React', required: true, level: 'intermediate' },
      { name: 'JavaScript', required: true, level: 'intermediate' },
      { name: 'HTML/CSS', required: true, level: 'intermediate' },
      { name: 'Sass', required: false, level: 'beginner' },
      { name: 'Git', required: true, level: 'beginner' }
    ],
    applicationInfo: {
      applyUrl: 'https://webdevagency.com/careers/react-developer',
      easyApply: false,
      requiresCoverLetter: true
    },
    source: {
      platform: 'company_website',
      url: 'https://webdevagency.com/careers/react-developer',
      scrapedAt: new Date()
    },
    status: 'active',
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    metadata: {
      views: 28,
      applications: 6,
      saves: 9,
      difficulty: 'easy',
      tags: ['remote', 'contract', 'agency'],
      featured: false
    }
  },
  {
    title: 'Backend Engineer',
    company: {
      name: 'DataTech Solutions',
      logo: 'https://via.placeholder.com/100x100/8e44ad/ffffff?text=DT',
      website: 'https://datatech.com',
      size: 'medium',
      industry: 'Data Analytics',
      description: 'Data analytics company providing insights to Fortune 500 companies'
    },
    location: {
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      remote: false,
      hybrid: true
    },
    jobType: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 110000,
      max: 150000,
      currency: 'USD',
      type: 'annual',
      disclosed: true
    },
    description: 'Join our backend team to build scalable data processing systems and APIs that serve millions of users. Work with cutting-edge technologies in the data analytics space.',
    requirements: [
      '5+ years of backend development experience',
      'Strong proficiency in Python or Java',
      'Experience with databases and data modeling',
      'Knowledge of cloud platforms and microservices',
      'Experience with data processing frameworks'
    ],
    responsibilities: [
      'Design and implement scalable backend systems',
      'Develop data processing pipelines',
      'Build and maintain APIs',
      'Optimize database performance',
      'Work with data science team on ML infrastructure'
    ],
    benefits: [
      'Competitive salary and bonuses',
      'Stock options',
      'Comprehensive health benefits',
      'Learning stipend',
      'Hybrid work arrangement'
    ],
    skills: [
      { name: 'Python', required: true, level: 'advanced' },
      { name: 'PostgreSQL', required: true, level: 'intermediate' },
      { name: 'AWS', required: true, level: 'intermediate' },
      { name: 'Docker', required: false, level: 'intermediate' },
      { name: 'Kubernetes', required: false, level: 'beginner' }
    ],
    applicationInfo: {
      applyUrl: 'https://datatech.com/jobs/backend-engineer',
      easyApply: true,
      requiresCoverLetter: false
    },
    source: {
      platform: 'linkedin',
      url: 'https://linkedin.com/jobs/view/789012',
      scrapedAt: new Date()
    },
    status: 'active',
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    metadata: {
      views: 53,
      applications: 18,
      saves: 21,
      difficulty: 'hard',
      tags: ['backend', 'data', 'python'],
      featured: true
    }
  }
];

const seedJobs = async () => {
  try {
    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Insert sample jobs
    const insertedJobs = await Job.insertMany(sampleJobs);
    console.log(`Inserted ${insertedJobs.length} sample jobs`);

    return insertedJobs;
  } catch (error) {
    console.error('Error seeding jobs:', error);
    throw error;
  }
};

module.exports = { seedJobs, sampleJobs };
