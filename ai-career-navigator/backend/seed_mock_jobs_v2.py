import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from adapters.supabase_job_repository import SupabaseJobRepository

COMPANIES = [
    "Amazon", "Apple", "Google", "Microsoft", "Meta", "Netflix", "Meesho", 
    "TCS", "Infosys", "Deloitte", "Accenture"
]
LOGOS = {
    "Amazon": "https://logo.clearbit.com/amazon.com",
    "Apple": "https://logo.clearbit.com/apple.com",
    "Google": "https://logo.clearbit.com/google.com",
    "Microsoft": "https://logo.clearbit.com/microsoft.com",
    "Meta": "https://logo.clearbit.com/meta.com",
    "Netflix": "https://logo.clearbit.com/netflix.com",
    "Meesho": "https://logo.clearbit.com/meesho.com",
    "TCS": "https://logo.clearbit.com/tcs.com",
    "Infosys": "https://logo.clearbit.com/infosys.com",
    "Deloitte": "https://logo.clearbit.com/deloitte.com",
    "Accenture": "https://logo.clearbit.com/accenture.com"
}
ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Engineer", "Data Scientist", "DevOps Engineer", "Cloud Architect", "Machine Learning Engineer", "Product Manager"]
SKILLS_POOL = ["React", "Node.js", "Python", "FastAPI", "Django", "AWS", "Docker", "Kubernetes", "SQL", "PostgreSQL", "Machine Learning", "TensorFlow", "PyTorch", "Java", "Spring Boot", "Azure", "GCP", "CI/CD", "TypeScript", "Tailwind CSS"]
EXP_LEVELS = ['Internship', 'Entry Level', 'Mid Level', 'Senior Level', 'Executive']
EMP_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
LOCATIONS = ["Remote", "New York, NY", "San Francisco, CA", "London, UK", "Bengaluru, India", "Pune, India", "Hyderabad, India", "Toronto, Canada", "Berlin, Germany"]

def generate_mock_jobs(count=150) -> List[Dict[str, Any]]:
    jobs = []
    for _ in range(count):
        company = random.choice(COMPANIES)
        role = random.choice(ROLES)
        
        # Select 3-6 random skills
        required_skills = random.sample(SKILLS_POOL, k=random.randint(3, 6))
        
        # Generate a random posted_at within the last 30 days
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        posted_at = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        job = {
            "company_name": company,
            "company_logo": LOGOS.get(company, ""),
            "role": role,
            "job_description": f"We are looking for a talented {role} to join {company}. You will be working with cutting-edge technologies to build scalable solutions. Strong proficiency in {', '.join(required_skills[:2])} is required.",
            "required_skills": required_skills,
            "experience_level": random.choice(EXP_LEVELS),
            "location": random.choice(LOCATIONS),
            "salary": f"${random.randint(60, 150)}k - ${random.randint(151, 200)}k",
            "employment_type": random.choice(EMP_TYPES),
            "posted_at": posted_at.isoformat(),
            "job_apply_link": f"https://example.com/careers/{company.lower()}/apply" if random.random() > 0.5 else None,
            "company_careers_link": f"https://careers.{company.lower().replace(' ', '')}.com",
        }
        jobs.append(job)
    return jobs

def seed_jobs():
    print("Generating mock jobs...")
    jobs = generate_mock_jobs(150)
    repo = SupabaseJobRepository()
    
    # We will do chunks of 50
    print("Inserting jobs into Supabase...")
    for i in range(0, len(jobs), 50):
        chunk = jobs[i:i+50]
        repo.insert_jobs(chunk)
        print(f"Inserted {i+len(chunk)}/{len(jobs)} jobs...")
        
    print("Successfully seeded jobs!")

if __name__ == '__main__':
    seed_jobs()
