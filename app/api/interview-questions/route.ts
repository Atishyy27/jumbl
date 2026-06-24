import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helpers";
import fs from "fs/promises";
import path from "path";

// Path to the local file cache
const CACHE_DIR = path.join(process.cwd(), ".next", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "ai-questions.json");

// Local helper to read/write cache
async function getCachedQuestions(key: string): Promise<string[] | null> {
  try {
    const fileContent = await fs.readFile(CACHE_FILE, "utf-8");
    const data = JSON.parse(fileContent);
    return data[key] || null;
  } catch {
    return null;
  }
}

async function cacheQuestions(key: string, questions: string[]) {
  try {
    // Ensure cache directory exists
    await fs.mkdir(CACHE_DIR, { recursive: true });
    
    let data: Record<string, string[]> = {};
    try {
      const fileContent = await fs.readFile(CACHE_FILE, "utf-8");
      data = JSON.parse(fileContent);
    } catch {
      // Ignore read errors (e.g. file doesn't exist yet)
    }

    data[key] = questions;
    await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write questions cache:", error);
  }
}

// Fallback deterministic questions generator when API key is missing
function generateFallbackQuestions(
  jobTitle: string,
  skills: string[],
  experience: number
): string[] {
  const topSkills = skills.slice(0, 3);
  const otherSkills = skills.slice(3, 5);

  return [
    `With ${experience} year${experience === 1 ? "" : "s"} of experience, how do you handle architectural design and scaling when building projects using ${topSkills.join(", ") || "modern frameworks"}?`,
    `Can you describe a challenging technical issue you encountered in a previous project involving ${skills[0] || "front-end development"} and how you debugged and resolved it?`,
    `As a candidate applying for the ${jobTitle} role, how do you manage dependency injection and write maintainable code in an environment using ${skills[1] || "TypeScript"}?`,
    `How do you balance performance optimizations (e.g. bundle size, query optimization) with clean code practices in technologies like ${topSkills.slice(0, 2).join(" and ") || "React"}?`,
    `If tasked with integrating ${otherSkills.join(", ") || "state management/styling tools"} in a team setting for a ${jobTitle} application, how would you structure the onboarding documentation for other engineers?`
  ];
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid request body. Expected JSON.", 400);
    }

    const { jobId, applicantId, jobTitle, candidateSkills, experienceYears } = body;

    // Validate inputs
    if (!jobId || !applicantId || !jobTitle) {
      return apiError("Missing required fields: jobId, applicantId, jobTitle", 400);
    }

    const skills = Array.isArray(candidateSkills) ? candidateSkills : [];
    const experience = typeof experienceYears === "number" ? experienceYears : 0;

    const cacheKey = `${applicantId}-${jobId}`;

    // 1. Check local file cache
    const cached = await getCachedQuestions(cacheKey);
    if (cached) {
      return apiSuccess({ questions: cached, cached: true });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // 2. If API Key is missing, generate fallback questions
    if (!apiKey) {
      console.log("No OPENAI_API_KEY found, using local fallback generator.");
      const fallbackQuestions = generateFallbackQuestions(jobTitle, skills, experience);
      await cacheQuestions(cacheKey, fallbackQuestions);
      return apiSuccess({ questions: fallbackQuestions, cached: false, simulated: true });
    }

    // 3. Call OpenAI API
    try {
      console.log("Calling OpenAI API to generate interview questions...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert technical interviewer and recruiter. Your job is to output a JSON object containing exactly 5 specific, highly technical interview questions. You must strictly output JSON in the format: { \"questions\": [\"string\", \"string\", ...] }. Do not include markdown formatting or extra text outside the JSON."
            },
            {
              role: "user",
              content: `Job Title: ${jobTitle}\nCandidate Skills: ${skills.join(", ")}\nExperience: ${experience} years\nGenerate exactly 5 interview questions tailored to evaluate this candidate's proficiency for this role.`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const result = await response.json();
      const rawText = result.choices?.[0]?.message?.content;
      
      if (!rawText) {
        throw new Error("Empty response content from OpenAI API.");
      }

      const parsed = JSON.parse(rawText);
      const generatedQuestions = parsed.questions;

      if (!Array.isArray(generatedQuestions) || generatedQuestions.length !== 5) {
        throw new Error("Invalid questions array structure returned from OpenAI API.");
      }

      // Cache and return
      await cacheQuestions(cacheKey, generatedQuestions);
      return apiSuccess({ questions: generatedQuestions, cached: false });
    } catch (apiErr) {
      console.error("OpenAI API call failed, generating high-quality fallback questions instead:", apiErr);
      // Fallback to local questions in case of API failure so service remains robust
      const fallbackQuestions = generateFallbackQuestions(jobTitle, skills, experience);
      await cacheQuestions(cacheKey, fallbackQuestions);
      return apiSuccess({ questions: fallbackQuestions, cached: false, simulated: true, error: true });
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return apiError("Internal server error while generating interview questions.", 500);
  }
}
