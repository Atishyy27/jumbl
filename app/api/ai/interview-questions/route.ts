import { NextRequest } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { apiSuccess, apiError } from "@/lib/api-helpers";

// ─── Deterministic fallback ──────────────────────────────────────────────────
function generateFallbackQuestions(
  jobTitle: string,
  skills: string[],
  experience: number
): string[] {
  const top = skills.slice(0, 3);
  const pair = skills.slice(0, 2);
  const extra = skills.slice(3, 5);
  return [
    `With ${experience} year${experience === 1 ? "" : "s"} of experience, how do you approach architectural design and scaling in projects that use ${top.join(", ") || "modern frameworks"}?`,
    `Describe a difficult bug you encountered while working with ${skills[0] || "your primary technology"} and walk us through how you diagnosed and resolved it.`,
    `As a ${jobTitle}, how do you ensure maintainable, well-tested code in a codebase using ${skills[1] || "TypeScript"}? What patterns or tooling do you rely on?`,
    `How do you balance performance optimisation (e.g. bundle size, query efficiency) with readability when working with ${pair.join(" and ") || "React and Node.js"}?`,
    `If you were onboarding a junior engineer to a ${jobTitle} project that uses ${extra.join(", ") || "your core stack"}, how would you structure their ramp-up plan?`,
  ];
}

// ─── Route handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid request body. Expected JSON.", 400);
    }

    const { jobTitle, skills, experienceYears } = body as {
      jobTitle?: string;
      skills?: unknown;
      experienceYears?: unknown;
    };

    if (!jobTitle || typeof jobTitle !== "string" || !jobTitle.trim()) {
      return apiError("Missing required field: jobTitle", 400);
    }

    const candidateSkills: string[] = Array.isArray(skills)
      ? (skills as unknown[]).filter((s): s is string => typeof s === "string")
      : [];
    const experience: number =
      typeof experienceYears === "number" && experienceYears >= 0
        ? experienceYears
        : 0;

    const geminiKey = process.env.GEMINI_API_KEY;

    // ── Try Gemini ────────────────────────────────────────────────────────────
    if (geminiKey && geminiKey.trim().length > 0) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey.trim());

        // Use gemini-2.5-flash (latest Flash)
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        });

        const prompt = `You are a senior engineering interviewer.

Generate exactly 5 technical interview questions.

Job Title: ${jobTitle.trim()}
Skills: ${candidateSkills.length > 0 ? candidateSkills.join(", ") : "General software engineering"}
Experience: ${experience} years

Return ONLY valid JSON in this exact format with no markdown, no code fences, no extra text:
{
  "questions": [
    "Question 1 here",
    "Question 2 here",
    "Question 3 here",
    "Question 4 here",
    "Question 5 here"
  ]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        console.log("Gemini raw response:", text);

        // Robust JSON extraction — strip markdown fences if present, then parse
        let jsonText = text;

        // Remove ```json ... ``` or ``` ... ``` fences
        const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (fenceMatch) {
          jsonText = fenceMatch[1].trim();
        } else {
          // Extract first JSON object by finding matching braces
          const start = text.indexOf("{");
          if (start !== -1) {
            let depth = 0;
            let end = -1;
            for (let i = start; i < text.length; i++) {
              if (text[i] === "{") depth++;
              else if (text[i] === "}") {
                depth--;
                if (depth === 0) { end = i; break; }
              }
            }
            if (end !== -1) jsonText = text.slice(start, end + 1);
          }
        }

        console.log("Gemini cleaned text:", jsonText);

        // Parse the JSON response safely
        let parsed: { questions?: unknown };
        try {
          parsed = JSON.parse(jsonText);
          console.log("Gemini parsed object:", JSON.stringify(parsed, null, 2));
        } catch (parseErr) {
          throw new Error(`JSON parse failed: ${parseErr}. Clean text: ${jsonText}\nRaw text: ${text}`);
        }

        const questions = parsed?.questions;

        if (
          !Array.isArray(questions) ||
          questions.length < 1 ||
          !questions.every((q) => typeof q === "string" && q.trim().length > 0)
        ) {
          throw new Error("Gemini returned an invalid questions array.");
        }

        // Ensure exactly 5 — pad with fallback if fewer returned
        const finalQuestions =
          questions.length >= 5
            ? questions.slice(0, 5)
            : [
                ...questions,
                ...generateFallbackQuestions(jobTitle, candidateSkills, experience).slice(
                  questions.length
                ),
              ];

        console.log("Gemini questions:", finalQuestions);

        return apiSuccess({
          questions: finalQuestions,
          source: "gemini",
          simulated: false,
        });
      } catch (geminiErr) {
        console.error("Gemini API call failed — falling back to deterministic generator:", geminiErr);
        // Fall through to deterministic fallback below
      }
    } else {
      console.warn("GEMINI_API_KEY not configured — using deterministic fallback.");
    }

    // ── Deterministic fallback ────────────────────────────────────────────────
    const fallbackQuestions = generateFallbackQuestions(
      jobTitle,
      candidateSkills,
      experience
    );
    return apiSuccess({
      questions: fallbackQuestions,
      source: "fallback",
      simulated: true,
    });
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return apiError("Internal server error while generating interview questions.", 500);
  }
}
