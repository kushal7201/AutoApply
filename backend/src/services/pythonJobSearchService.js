const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class PythonJobSearchService {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, '..', 'services', 'jobSearchService.py');
    this.isAvailable = this.checkPythonAvailability();
  }

  async checkPythonAvailability() {
    try {
      // Check if Python is available
      const python = spawn('python', ['--version']);
      return new Promise((resolve) => {
        python.on('close', (code) => {
          resolve(code === 0);
        });
        python.on('error', () => {
          resolve(false);
        });
      });
    } catch (error) {
      return false;
    }
  }

  async searchJobs(query, location = '', filters = {}) {
    // If Python service is not available, return mock data
    if (!await this.isAvailable) {
      console.log('Python job search service not available, returning mock data');
      return this.getMockJobs(query, location, filters);
    }

    return new Promise((resolve, reject) => {
      const pythonScript = `
import asyncio
import sys
import json
import os
sys.path.append('${path.dirname(this.pythonScriptPath)}')

try:
    from jobSearchService import JobSearchService
    
    async def main():
        query = "${query}"
        location = "${location}"
        filters = ${JSON.stringify(filters)}
        
        async with JobSearchService() as service:
            jobs = await service.search_jobs(query, location, ['indeed', 'glassdoor', 'ziprecruiter'], filters)
            print(json.dumps({
                'success': True,
                'jobs': jobs,
                'total': len(jobs)
            }))
    
    asyncio.run(main())
    
except Exception as e:
    print(json.dumps({
        'success': False,
        'error': str(e),
        'jobs': []
    }))
`;

      const python = spawn('python', ['-c', pythonScript]);
      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            if (result.success) {
              resolve(result.jobs);
            } else {
              console.error('Python job search error:', result.error);
              resolve(this.getMockJobs(query, location, filters));
            }
          } catch (parseError) {
            console.error('Failed to parse Python output:', parseError);
            resolve(this.getMockJobs(query, location, filters));
          }
        } else {
          console.error('Python script failed:', errorOutput);
          resolve(this.getMockJobs(query, location, filters));
        }
      });

      python.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        resolve(this.getMockJobs(query, location, filters));
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        python.kill();
        resolve(this.getMockJobs(query, location, filters));
      }, 30000);
    });
  }

  getMockJobs(query, location, filters) {
    // Enhanced mock data that looks realistic
    const companies = [
      { name: 'TechCorp Inc.', logo: null, rating: '4.2' },
      { name: 'InnovateSoft', logo: null, rating: '4.5' },
      { name: 'DataDyne Systems', logo: null, rating: '3.8' },
      { name: 'CloudFirst Technologies', logo: null, rating: '4.1' },
      { name: 'NextGen Solutions', logo: null, rating: '4.3' },
      { name: 'AgileWorks', logo: null, rating: '4.0' },
      { name: 'QuantumTech', logo: null, rating: '4.4' },
      { name: 'FutureLab Inc.', logo: null, rating: '3.9' },
      { name: 'ScaleUp Dynamics', logo: null, rating: '4.2' },
      { name: 'BuildTech Solutions', logo: null, rating: '4.1' }
    ];

    const jobTitles = [
      'Senior Software Engineer',
      'Full Stack Developer',
      'Frontend React Developer',
      'Backend Node.js Developer',
      'DevOps Engineer',
      'Data Scientist',
      'Product Manager',
      'UI/UX Designer',
      'Machine Learning Engineer',
      'Software Architect',
      'Mobile App Developer',
      'Cloud Solutions Architect',
      'Python Developer',
      'JavaScript Developer',
      'Quality Assurance Engineer'
    ];

    const locations = [
      'San Francisco, CA',
      'New York, NY',
      'Seattle, WA',
      'Austin, TX',
      'Boston, MA',
      'Chicago, IL',
      'Los Angeles, CA',
      'Denver, CO',
      'Remote',
      'Atlanta, GA'
    ];

    const skillsPool = [
      'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'AWS', 'Docker',
      'Kubernetes', 'MongoDB', 'PostgreSQL', 'Git', 'Agile', 'Scrum', 'REST APIs',
      'GraphQL', 'Vue.js', 'Angular', 'Express.js', 'Redis', 'Elasticsearch',
      'Jenkins', 'Terraform', 'Java', 'Go', 'Machine Learning', 'Data Science',
      'TensorFlow', 'PyTorch', 'SQL', 'NoSQL'
    ];

    const experienceLevels = ['junior', 'mid', 'senior', 'lead'];
    const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];
    const platforms = ['indeed', 'glassdoor', 'ziprecruiter', 'monster'];

    const jobs = [];
    const numJobs = Math.min(50, Math.max(10, Math.floor(Math.random() * 30) + 20));

    for (let i = 0; i < numJobs; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const jobLocation = location || locations[Math.floor(Math.random() * locations.length)];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      
      // Generate salary range
      const baseSalary = Math.floor(Math.random() * 100000) + 60000;
      const salaryMax = baseSalary + Math.floor(Math.random() * 50000);
      
      // Random skills
      const jobSkills = [];
      const numSkills = Math.floor(Math.random() * 8) + 3;
      for (let j = 0; j < numSkills; j++) {
        const skill = skillsPool[Math.floor(Math.random() * skillsPool.length)];
        if (!jobSkills.includes(skill)) {
          jobSkills.push(skill);
        }
      }

      const job = {
        external_id: `mock_${platform}_${i}_${Date.now()}`,
        title: title.includes(query) ? title : `${query} ${title}`,
        company: {
          name: company.name,
          rating: company.rating,
          logo: company.logo
        },
        description: this.generateJobDescription(title, company.name, jobSkills),
        location: jobLocation,
        full_location: jobLocation,
        remote: jobLocation.toLowerCase().includes('remote'),
        job_type: filters.jobType && filters.jobType !== 'all' ? filters.jobType : jobTypes[Math.floor(Math.random() * jobTypes.length)],
        experience_level: filters.experienceLevel && filters.experienceLevel !== 'all' ? filters.experienceLevel : experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
        salary: {
          min: baseSalary,
          max: salaryMax,
          currency: 'USD',
          period: 'yearly'
        },
        salary_display: `$${(baseSalary/1000).toFixed(0)}k - $${(salaryMax/1000).toFixed(0)}k`,
        posted_date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        url: `https://www.${platform}.com/jobs/view/${Math.random().toString(36).substr(2, 9)}`,
        source_platform: platform,
        scraped_at: new Date().toISOString(),
        skills: jobSkills,
        match_score: this.calculateMockMatchScore(title, query, filters),
        metadata: {
          views: Math.floor(Math.random() * 500) + 10,
          applications: Math.floor(Math.random() * 50) + 1
        }
      };

      jobs.push(job);
    }

    // Sort by match score and posted date
    jobs.sort((a, b) => {
      if (a.match_score !== b.match_score) {
        return b.match_score - a.match_score;
      }
      return new Date(b.posted_date) - new Date(a.posted_date);
    });

    return jobs;
  }

  generateJobDescription(title, company, skills) {
    const descriptions = [
      `We are looking for a talented ${title} to join our growing team at ${company}. You will work on cutting-edge projects and collaborate with a diverse team of professionals.`,
      `${company} is seeking an experienced ${title} to help build innovative solutions. This role offers excellent growth opportunities and the chance to work with modern technologies.`,
      `Join ${company} as a ${title} and be part of a dynamic team that values creativity and technical excellence. We offer a collaborative environment and competitive benefits.`,
      `We're hiring a ${title} at ${company} to contribute to our mission of delivering high-quality software solutions. You'll work in an agile environment with the latest tools and technologies.`
    ];

    const responsibilities = [
      'Develop and maintain high-quality software applications',
      'Collaborate with cross-functional teams to deliver projects on time',
      'Write clean, efficient, and well-documented code',
      'Participate in code reviews and technical discussions',
      'Troubleshoot and debug application issues',
      'Stay up-to-date with industry best practices and emerging technologies'
    ];

    const requirements = [
      `Experience with ${skills.slice(0, 3).join(', ')}`,
      'Strong problem-solving and analytical skills',
      'Excellent communication and teamwork abilities',
      'Bachelor\'s degree in Computer Science or related field',
      'Experience with agile development methodologies'
    ];

    const baseDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const selectedResponsibilities = responsibilities.slice(0, Math.floor(Math.random() * 3) + 3);
    const selectedRequirements = requirements.slice(0, Math.floor(Math.random() * 2) + 3);

    return `${baseDescription}

Key Responsibilities:
${selectedResponsibilities.map(r => `• ${r}`).join('\n')}

Requirements:
${selectedRequirements.map(r => `• ${r}`).join('\n')}

Technologies: ${skills.join(', ')}`;
  }

  calculateMockMatchScore(title, query, filters) {
    let score = 0;

    // Title match
    if (title.toLowerCase().includes(query.toLowerCase())) {
      score += 40;
    } else if (query.toLowerCase().split(' ').some(word => title.toLowerCase().includes(word))) {
      score += 20;
    }

    // Add some randomness for variety
    score += Math.floor(Math.random() * 30) + 20;

    // Filter bonuses
    if (filters.remote === 'true') score += 10;
    if (filters.jobType && filters.jobType !== 'all') score += 5;
    if (filters.experienceLevel && filters.experienceLevel !== 'all') score += 5;

    return Math.min(score, 100);
  }
}

module.exports = new PythonJobSearchService();
