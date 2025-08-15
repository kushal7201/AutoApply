import asyncio
import aiohttp
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import json
import re
import hashlib
from bs4 import BeautifulSoup
from urllib.parse import urlencode, quote
import time
import random

logger = logging.getLogger(__name__)

class JobSearchService:
    def __init__(self):
        self.session = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        self.scrapers = {
            'linkedin': self._scrape_linkedin,
            'indeed': self._scrape_indeed,
            'glassdoor': self._scrape_glassdoor,
            'ziprecruiter': self._scrape_ziprecruiter,
            'monster': self._scrape_monster,
            'careerbuilder': self._scrape_careerbuilder
        }
        
    async def __aenter__(self):
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            headers=self.headers,
            connector=connector,
            timeout=timeout
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def search_jobs(self, 
                         query: str,
                         location: str = '',
                         platforms: List[str] = None,
                         filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Search for jobs across multiple platforms
        """
        if platforms is None:
            platforms = ['indeed', 'glassdoor', 'ziprecruiter']  # LinkedIn requires special handling
            
        if filters is None:
            filters = {}
            
        all_jobs = []
        tasks = []
        
        for platform in platforms:
            if platform in self.scrapers:
                task = asyncio.create_task(
                    self._safe_scrape(platform, query, location, filters)
                )
                tasks.append(task)
                
        # Execute all scraping tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error scraping {platforms[i]}: {result}")
            elif isinstance(result, list):
                all_jobs.extend(result)
                
        # Remove duplicates and enhance data
        unique_jobs = self._remove_duplicates(all_jobs)
        enhanced_jobs = self._enhance_job_data(unique_jobs, query, filters)
        
        return enhanced_jobs
    
    async def _safe_scrape(self, platform: str, query: str, location: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Safely execute scraping with error handling and rate limiting
        """
        try:
            # Add random delay to avoid rate limiting
            await asyncio.sleep(random.uniform(0.5, 2.0))
            
            scraper = self.scrapers[platform]
            jobs = await scraper(query, location, filters)
            
            # Add source platform to each job
            for job in jobs:
                job['source_platform'] = platform
                job['scraped_at'] = datetime.utcnow().isoformat()
                
            logger.info(f"Successfully scraped {len(jobs)} jobs from {platform}")
            return jobs
            
        except Exception as e:
            logger.error(f"Error scraping {platform}: {e}")
            return []
    
    async def _scrape_indeed(self, query: str, location: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape jobs from Indeed
        """
        jobs = []
        try:
            # Build Indeed search URL
            params = {
                'q': query,
                'l': location,
                'sort': 'date',
                'limit': 50
            }
            
            # Add filters
            if filters.get('remote'):
                params['remote'] = '1'
            if filters.get('salary_min'):
                params['salary'] = f"${filters['salary_min']}+"
            if filters.get('job_type'):
                params['jt'] = filters['job_type']
                
            url = f"https://www.indeed.com/jobs?{urlencode(params)}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Parse job listings
                    job_cards = soup.find_all('div', {'class': re.compile(r'job_seen_beacon|jobsearch-SerpJobCard')})
                    
                    for card in job_cards[:20]:  # Limit to 20 jobs per platform
                        job = self._parse_indeed_job(card)
                        if job:
                            jobs.append(job)
                            
        except Exception as e:
            logger.error(f"Error scraping Indeed: {e}")
            
        return jobs
    
    def _parse_indeed_job(self, card) -> Optional[Dict[str, Any]]:
        """
        Parse individual Indeed job card
        """
        try:
            job = {}
            
            # Title and link
            title_elem = card.find('h2', {'class': re.compile(r'jobTitle')})
            if title_elem:
                link_elem = title_elem.find('a')
                if link_elem:
                    job['title'] = link_elem.get_text(strip=True)
                    job['url'] = 'https://www.indeed.com' + link_elem.get('href', '')
                    
            # Company
            company_elem = card.find('span', {'class': re.compile(r'companyName')})
            if company_elem:
                job['company'] = {
                    'name': company_elem.get_text(strip=True)
                }
                
            # Location
            location_elem = card.find('div', {'class': re.compile(r'companyLocation')})
            if location_elem:
                job['location'] = location_elem.get_text(strip=True)
                
            # Salary
            salary_elem = card.find('span', {'class': re.compile(r'salaryText')})
            if salary_elem:
                job['salary'] = salary_elem.get_text(strip=True)
                
            # Description/Summary
            summary_elem = card.find('div', {'class': re.compile(r'summary')})
            if summary_elem:
                job['description'] = summary_elem.get_text(strip=True)
                
            # Posted date
            date_elem = card.find('span', {'class': re.compile(r'date')})
            if date_elem:
                job['posted_date'] = self._parse_date(date_elem.get_text(strip=True))
                
            # Generate unique ID
            job['external_id'] = self._generate_job_id(job.get('title', ''), job.get('company', {}).get('name', ''), 'indeed')
            
            return job if job.get('title') and job.get('company') else None
            
        except Exception as e:
            logger.error(f"Error parsing Indeed job: {e}")
            return None
    
    async def _scrape_glassdoor(self, query: str, location: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape jobs from Glassdoor
        """
        jobs = []
        try:
            # Glassdoor API-like endpoint (simplified)
            params = {
                'sc.keyword': query,
                'locT': 'C',
                'locId': self._get_location_id(location),
                'jobType': filters.get('job_type', ''),
                'fromAge': filters.get('date_posted', 1),
                'minSalary': filters.get('salary_min', ''),
                'maxSalary': filters.get('salary_max', ''),
                'radius': filters.get('radius', 25),
                'includeNoSalaryJobs': 'true'
            }
            
            # Build search URL
            base_url = "https://www.glassdoor.com/Job/jobs.htm"
            url = f"{base_url}?{urlencode({k: v for k, v in params.items() if v})}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Parse job listings
                    job_cards = soup.find_all('li', {'class': re.compile(r'JobsList_jobListItem|react-job-listing')})
                    
                    for card in job_cards[:20]:
                        job = self._parse_glassdoor_job(card)
                        if job:
                            jobs.append(job)
                            
        except Exception as e:
            logger.error(f"Error scraping Glassdoor: {e}")
            
        return jobs
    
    def _parse_glassdoor_job(self, card) -> Optional[Dict[str, Any]]:
        """
        Parse individual Glassdoor job card
        """
        try:
            job = {}
            
            # Title and link
            title_elem = card.find('a', {'class': re.compile(r'jobLink|job-title')})
            if title_elem:
                job['title'] = title_elem.get_text(strip=True)
                job['url'] = 'https://www.glassdoor.com' + title_elem.get('href', '')
                
            # Company
            company_elem = card.find('div', {'class': re.compile(r'employerName')}) or \
                          card.find('span', {'class': re.compile(r'employer')})
            if company_elem:
                job['company'] = {
                    'name': company_elem.get_text(strip=True)
                }
                
            # Location
            location_elem = card.find('div', {'class': re.compile(r'location')})
            if location_elem:
                job['location'] = location_elem.get_text(strip=True)
                
            # Salary
            salary_elem = card.find('div', {'class': re.compile(r'salary')}) or \
                         card.find('span', {'class': re.compile(r'salary')})
            if salary_elem:
                job['salary'] = salary_elem.get_text(strip=True)
                
            # Rating
            rating_elem = card.find('span', {'class': re.compile(r'rating')})
            if rating_elem:
                job['company']['rating'] = rating_elem.get_text(strip=True)
                
            # Posted date
            date_elem = card.find('div', {'class': re.compile(r'posted|age')})
            if date_elem:
                job['posted_date'] = self._parse_date(date_elem.get_text(strip=True))
                
            job['external_id'] = self._generate_job_id(job.get('title', ''), job.get('company', {}).get('name', ''), 'glassdoor')
            
            return job if job.get('title') and job.get('company') else None
            
        except Exception as e:
            logger.error(f"Error parsing Glassdoor job: {e}")
            return None
    
    async def _scrape_ziprecruiter(self, query: str, location: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape jobs from ZipRecruiter
        """
        jobs = []
        try:
            params = {
                'search': query,
                'location': location,
                'days': filters.get('date_posted', 7),
                'radius': filters.get('radius', 25)
            }
            
            if filters.get('remote'):
                params['refine_by_location_type'] = 'remote'
                
            url = f"https://www.ziprecruiter.com/jobs-search?{urlencode(params)}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    job_cards = soup.find_all('div', {'class': re.compile(r'job_content|JobCard')})
                    
                    for card in job_cards[:20]:
                        job = self._parse_ziprecruiter_job(card)
                        if job:
                            jobs.append(job)
                            
        except Exception as e:
            logger.error(f"Error scraping ZipRecruiter: {e}")
            
        return jobs
    
    def _parse_ziprecruiter_job(self, card) -> Optional[Dict[str, Any]]:
        """
        Parse individual ZipRecruiter job card
        """
        try:
            job = {}
            
            title_elem = card.find('a', {'class': re.compile(r'job_link|title')})
            if title_elem:
                job['title'] = title_elem.get_text(strip=True)
                job['url'] = title_elem.get('href', '')
                if not job['url'].startswith('http'):
                    job['url'] = 'https://www.ziprecruiter.com' + job['url']
                    
            company_elem = card.find('a', {'class': re.compile(r'company')}) or \
                          card.find('div', {'class': re.compile(r'company')})
            if company_elem:
                job['company'] = {
                    'name': company_elem.get_text(strip=True)
                }
                
            location_elem = card.find('div', {'class': re.compile(r'location')})
            if location_elem:
                job['location'] = location_elem.get_text(strip=True)
                
            salary_elem = card.find('div', {'class': re.compile(r'salary')})
            if salary_elem:
                job['salary'] = salary_elem.get_text(strip=True)
                
            summary_elem = card.find('div', {'class': re.compile(r'summary|snippet')})
            if summary_elem:
                job['description'] = summary_elem.get_text(strip=True)
                
            job['external_id'] = self._generate_job_id(job.get('title', ''), job.get('company', {}).get('name', ''), 'ziprecruiter')
            
            return job if job.get('title') and job.get('company') else None
            
        except Exception as e:
            logger.error(f"Error parsing ZipRecruiter job: {e}")
            return None
    
    async def _scrape_monster(self, query: str, location: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape jobs from Monster
        """
        jobs = []
        try:
            params = {
                'q': query,
                'where': location,
                'tm': filters.get('date_posted', 7)
            }
            
            url = f"https://www.monster.com/jobs/search?{urlencode(params)}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    job_cards = soup.find_all('div', {'class': re.compile(r'JobCard|job-card')})
                    
                    for card in job_cards[:20]:
                        job = self._parse_monster_job(card)
                        if job:
                            jobs.append(job)
                            
        except Exception as e:
            logger.error(f"Error scraping Monster: {e}")
            
        return jobs
    
    def _parse_monster_job(self, card) -> Optional[Dict[str, Any]]:
        """
        Parse individual Monster job card
        """
        try:
            job = {}
            
            title_elem = card.find('h2') or card.find('a', {'class': re.compile(r'title')})
            if title_elem:
                link = title_elem.find('a') if title_elem.name != 'a' else title_elem
                if link:
                    job['title'] = link.get_text(strip=True)
                    job['url'] = link.get('href', '')
                    if not job['url'].startswith('http'):
                        job['url'] = 'https://www.monster.com' + job['url']
                        
            company_elem = card.find('div', {'class': re.compile(r'company')})
            if company_elem:
                job['company'] = {
                    'name': company_elem.get_text(strip=True)
                }
                
            location_elem = card.find('div', {'class': re.compile(r'location')})
            if location_elem:
                job['location'] = location_elem.get_text(strip=True)
                
            job['external_id'] = self._generate_job_id(job.get('title', ''), job.get('company', {}).get('name', ''), 'monster')
            
            return job if job.get('title') and job.get('company') else None
            
        except Exception as e:
            logger.error(f"Error parsing Monster job: {e}")
            return None
    
    async def _scrape_careerbuilder(self, query: str, location: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scrape jobs from CareerBuilder
        """
        jobs = []
        try:
            params = {
                'keywords': query,
                'location': location,
                'posted': filters.get('date_posted', 7)
            }
            
            url = f"https://www.careerbuilder.com/jobs?{urlencode(params)}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    job_cards = soup.find_all('div', {'class': re.compile(r'data-results-content|job-listing')})
                    
                    for card in job_cards[:20]:
                        job = self._parse_careerbuilder_job(card)
                        if job:
                            jobs.append(job)
                            
        except Exception as e:
            logger.error(f"Error scraping CareerBuilder: {e}")
            
        return jobs
    
    def _parse_careerbuilder_job(self, card) -> Optional[Dict[str, Any]]:
        """
        Parse individual CareerBuilder job card
        """
        try:
            job = {}
            
            title_elem = card.find('h2') or card.find('a', {'class': re.compile(r'job-title')})
            if title_elem:
                link = title_elem.find('a') if title_elem.name != 'a' else title_elem
                if link:
                    job['title'] = link.get_text(strip=True)
                    job['url'] = link.get('href', '')
                    
            company_elem = card.find('div', {'class': re.compile(r'company')})
            if company_elem:
                job['company'] = {
                    'name': company_elem.get_text(strip=True)
                }
                
            location_elem = card.find('div', {'class': re.compile(r'location')})
            if location_elem:
                job['location'] = location_elem.get_text(strip=True)
                
            job['external_id'] = self._generate_job_id(job.get('title', ''), job.get('company', {}).get('name', ''), 'careerbuilder')
            
            return job if job.get('title') and job.get('company') else None
            
        except Exception as e:
            logger.error(f"Error parsing CareerBuilder job: {e}")
            return None
    
    def _remove_duplicates(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate jobs based on title and company
        """
        seen = set()
        unique_jobs = []
        
        for job in jobs:
            # Create a unique identifier
            identifier = f"{job.get('title', '').lower().strip()}|{job.get('company', {}).get('name', '').lower().strip()}"
            
            if identifier not in seen and identifier != '|':
                seen.add(identifier)
                unique_jobs.append(job)
                
        return unique_jobs
    
    def _enhance_job_data(self, jobs: List[Dict[str, Any]], query: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Enhance job data with additional fields and standardization
        """
        enhanced_jobs = []
        
        for job in jobs:
            enhanced_job = {
                'external_id': job.get('external_id'),
                'title': job.get('title', ''),
                'company': {
                    'name': job.get('company', {}).get('name', ''),
                    'rating': job.get('company', {}).get('rating'),
                    'logo': None  # Would need additional API calls
                },
                'description': job.get('description', ''),
                'location': job.get('location', ''),
                'full_location': job.get('location', ''),
                'remote': self._is_remote(job.get('location', '')),
                'job_type': self._extract_job_type(job.get('title', '') + ' ' + job.get('description', '')),
                'experience_level': self._extract_experience_level(job.get('title', '') + ' ' + job.get('description', '')),
                'salary': self._parse_salary(job.get('salary', '')),
                'salary_display': job.get('salary', ''),
                'posted_date': job.get('posted_date', datetime.utcnow()),
                'url': job.get('url', ''),
                'source_platform': job.get('source_platform', ''),
                'scraped_at': job.get('scraped_at'),
                'skills': self._extract_skills(job.get('title', '') + ' ' + job.get('description', '')),
                'match_score': self._calculate_match_score(job, query, filters),
                'metadata': {
                    'views': random.randint(10, 500),
                    'applications': random.randint(1, 50)
                }
            }
            
            enhanced_jobs.append(enhanced_job)
            
        # Sort by match score and posted date
        enhanced_jobs.sort(key=lambda x: (x['match_score'], x['posted_date']), reverse=True)
        
        return enhanced_jobs
    
    def _generate_job_id(self, title: str, company: str, platform: str) -> str:
        """
        Generate a unique job ID
        """
        data = f"{title}|{company}|{platform}".lower()
        return hashlib.md5(data.encode()).hexdigest()
    
    def _get_location_id(self, location: str) -> str:
        """
        Get location ID for APIs (simplified)
        """
        # This would normally involve geocoding API calls
        location_map = {
            'new york': '1132348',
            'san francisco': '1147401',
            'chicago': '1128808',
            'austin': '1139761',
            'seattle': '1150505'
        }
        return location_map.get(location.lower(), '1')
    
    def _parse_date(self, date_str: str) -> datetime:
        """
        Parse relative date strings like "2 days ago"
        """
        try:
            date_str = date_str.lower().strip()
            
            if 'today' in date_str or 'just now' in date_str:
                return datetime.utcnow()
            elif 'yesterday' in date_str:
                return datetime.utcnow() - timedelta(days=1)
            elif 'day' in date_str:
                days = int(re.findall(r'\d+', date_str)[0])
                return datetime.utcnow() - timedelta(days=days)
            elif 'week' in date_str:
                weeks = int(re.findall(r'\d+', date_str)[0])
                return datetime.utcnow() - timedelta(weeks=weeks)
            elif 'month' in date_str:
                months = int(re.findall(r'\d+', date_str)[0])
                return datetime.utcnow() - timedelta(days=months*30)
            else:
                return datetime.utcnow()
                
        except:
            return datetime.utcnow()
    
    def _is_remote(self, location: str) -> bool:
        """
        Determine if job is remote based on location
        """
        remote_keywords = ['remote', 'anywhere', 'work from home', 'telecommute', 'virtual']
        return any(keyword in location.lower() for keyword in remote_keywords)
    
    def _extract_job_type(self, text: str) -> str:
        """
        Extract job type from title/description
        """
        text = text.lower()
        
        if any(word in text for word in ['intern', 'internship']):
            return 'internship'
        elif any(word in text for word in ['contract', 'contractor', 'freelance']):
            return 'contract'
        elif any(word in text for word in ['part-time', 'part time']):
            return 'part-time'
        elif any(word in text for word in ['temporary', 'temp']):
            return 'temporary'
        else:
            return 'full-time'
    
    def _extract_experience_level(self, text: str) -> str:
        """
        Extract experience level from title/description
        """
        text = text.lower()
        
        if any(word in text for word in ['senior', 'sr.', 'lead', 'principal', 'staff']):
            return 'senior'
        elif any(word in text for word in ['junior', 'jr.', 'entry', 'graduate', 'new grad']):
            return 'junior'
        elif any(word in text for word in ['mid', 'intermediate', 'experienced']):
            return 'mid'
        elif any(word in text for word in ['director', 'vp', 'vice president', 'head of']):
            return 'executive'
        else:
            return 'mid'
    
    def _parse_salary(self, salary_str: str) -> Dict[str, Any]:
        """
        Parse salary information
        """
        if not salary_str:
            return {}
            
        # Extract numbers and determine if hourly/yearly
        numbers = re.findall(r'[\d,]+', salary_str.replace('$', '').replace(',', ''))
        
        if not numbers:
            return {}
            
        try:
            if 'hour' in salary_str.lower():
                # Hourly rate
                hourly = int(numbers[0])
                return {
                    'min': hourly * 40 * 52,  # Convert to annual
                    'max': hourly * 40 * 52 if len(numbers) == 1 else int(numbers[1]) * 40 * 52,
                    'currency': 'USD',
                    'period': 'yearly'
                }
            else:
                # Annual salary
                min_salary = int(numbers[0])
                max_salary = int(numbers[1]) if len(numbers) > 1 else min_salary
                
                # Handle K notation
                if 'k' in salary_str.lower():
                    min_salary *= 1000
                    max_salary *= 1000
                    
                return {
                    'min': min_salary,
                    'max': max_salary,
                    'currency': 'USD',
                    'period': 'yearly'
                }
        except:
            return {}
    
    def _extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from job title and description
        """
        # Common tech skills to look for
        tech_skills = [
            'python', 'javascript', 'java', 'react', 'node.js', 'angular', 'vue.js',
            'typescript', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
            'html', 'css', 'scss', 'sass', 'sql', 'mysql', 'postgresql',
            'mongodb', 'redis', 'elasticsearch', 'docker', 'kubernetes',
            'aws', 'azure', 'gcp', 'terraform', 'jenkins', 'git', 'github',
            'jira', 'confluence', 'slack', 'agile', 'scrum', 'devops',
            'machine learning', 'data science', 'ai', 'tensorflow', 'pytorch',
            'pandas', 'numpy', 'scikit-learn', 'spark', 'hadoop'
        ]
        
        text = text.lower()
        found_skills = []
        
        for skill in tech_skills:
            if skill in text:
                found_skills.append(skill.title())
                
        return found_skills[:10]  # Limit to 10 skills
    
    def _calculate_match_score(self, job: Dict[str, Any], query: str, filters: Dict[str, Any]) -> int:
        """
        Calculate how well the job matches the search criteria
        """
        score = 0
        
        # Title match
        if query.lower() in job.get('title', '').lower():
            score += 40
        elif any(word in job.get('title', '').lower() for word in query.lower().split()):
            score += 20
            
        # Location match
        location_filter = filters.get('location', '')
        if location_filter and location_filter.lower() in job.get('location', '').lower():
            score += 20
            
        # Remote preference
        if filters.get('remote') and job.get('remote'):
            score += 15
            
        # Experience level match
        if filters.get('experience_level') == job.get('experience_level'):
            score += 10
            
        # Job type match
        if filters.get('job_type') == job.get('job_type'):
            score += 10
            
        # Recent posting bonus
        if job.get('posted_date'):
            days_old = (datetime.utcnow() - job['posted_date']).days
            if days_old <= 1:
                score += 5
            elif days_old <= 7:
                score += 3
                
        return min(score, 100)  # Cap at 100

# Singleton instance
job_search_service = JobSearchService()
