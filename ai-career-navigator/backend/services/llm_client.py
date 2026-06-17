# backend/services/llm_client.py - Wrapper for OpenAI calls
import os
import json
import logging
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

# Initialize the AsyncOpenAI client with a fallback to prevent crash if env var is missing
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "mock-key-for-testing"))

USE_MOCK = True

async def call_llm_json(system_prompt: str, user_prompt: str, model: str = "gpt-4o", fallback_default: dict = None) -> dict:
    """
    Calls the OpenAI API expecting a JSON object response.
    Includes basic error handling and fallbacks.
    """
    if fallback_default is None:
        fallback_default = {}

    if USE_MOCK:
        # Mock responses based on the prompt type to let the user test the UI for free
        if "expert technical recruiter" in system_prompt:
            return {
                "skills": ["React", "JavaScript", "Python", "Node.js", "Docker", "Tailwind CSS"],
                "experience_level": "Mid",
                "predicted_roles": ["Frontend Engineer", "Full Stack Developer", "Software Engineer"],
                "summary": "Experienced software engineer with a strong background in modern web technologies. Proven track record of building scalable web applications and RESTful APIs."
            }
        elif "career strategist" in system_prompt:
            # Learning path prompt
            return ["GraphQL", "Next.js", "Kubernetes", "AWS Fundamentals", "System Design"]
        elif "career coach" in system_prompt:
            # Suggestions prompt
            return {
                "skills_to_learn": [
                    { "skill": "GraphQL", "priority": 1, "reason": "Highly demanded by modern full-stack teams to reduce API over-fetching." },
                    { "skill": "AWS", "priority": 2, "reason": "Cloud deployment experience is a hard requirement for Mid-level roles." }
                ],
                "project_ideas": [
                    { "title": "Microservices Task Manager", "description": "Build a task manager using React and FastAPI, containerized with Docker.", "skills_demonstrated": ["React", "FastAPI", "Docker"] }
                ],
                "resume_tips": [
                    "Quantify your achievements (e.g., 'Improved load time by 30%').",
                    "Remove outdated skills and focus on modern stack."
                ]
            }
        elif "hiring manager" in system_prompt:
            # Gap analysis prompt
            missing = [line for line in user_prompt.split("\\n") if "Missing skills:" in line]
            skills_list = missing[0].replace("Missing skills:", "").split(",") if missing else ["Kubernetes", "AWS"]
            return [
                {
                    "skill": s.strip(),
                    "reason": f"This is a critical requirement for this role as the team relies heavily on {s.strip()} for their daily operations."
                } for s in skills_list
            ]

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error calling LLM: {str(e)}")
        return fallback_default
