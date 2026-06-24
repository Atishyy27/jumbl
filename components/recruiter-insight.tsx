"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, CheckCircle, AlertTriangle, PlayCircle } from "lucide-react";

interface RecruiterInsightProps {
  matchScore: number;
  experienceYears: number;
  candidateSkills: string[];
  requiredSkills: string[];
}

export function generateRecruiterInsights(
  matchScore: number,
  experienceYears: number,
  candidateSkills: string[],
  requiredSkills: string[]
) {
  const strengths: string[] = [];
  const gaps: string[] = [];
  let recommendation = "";

  const candidateSkillsLower = candidateSkills.map((s) => s.toLowerCase());
  const matched = requiredSkills.filter((s) => candidateSkillsLower.includes(s.toLowerCase()));
  const missing = requiredSkills.filter((s) => !candidateSkillsLower.includes(s.toLowerCase()));

  // 1. Determine Strengths
  if (experienceYears >= 5) {
    strengths.push(`Senior candidate with ${experienceYears} years of industry experience.`);
  } else if (experienceYears >= 3) {
    strengths.push(`Solid professional experience (${experienceYears} years).`);
  } else {
    strengths.push(`Entry-level candidate (${experienceYears} year${experienceYears === 1 ? "" : "s"}) with fresh perspective.`);
  }

  if (matchScore >= 80) {
    strengths.push(`Excellent skill alignment (${matchScore}% match score).`);
  } else if (matchScore >= 50) {
    strengths.push(`Moderate skill alignment (${matchScore}% match score).`);
  }

  if (matched.length > 0) {
    const topMatches = matched.slice(0, 3);
    strengths.push(`Strong overlap in key required skills: ${topMatches.join(", ")}.`);
  }

  // 2. Determine Gaps
  if (missing.length > 0) {
    missing.forEach((skill) => {
      gaps.push(`Missing required skill: ${skill}`);
    });
  } else if (requiredSkills.length > 0) {
    gaps.push("No major skill gaps identified; candidate possesses all core required skills.");
  }

  if (experienceYears < 2) {
    gaps.push("Limited professional work experience (less than 2 years).");
  }

  // 3. Determine Recommendation
  if (matchScore >= 80) {
    if (experienceYears >= 3) {
      recommendation = "Strongly recommend proceeding to technical interview stage. Excellent technical fit and experience.";
    } else {
      recommendation = "Proceed to technical screening. Candidate has strong skill match despite lower years of experience.";
    }
  } else if (matchScore >= 50) {
    recommendation = "Proceed to initial recruiter phone screening to evaluate domain knowledge and soft skills.";
  } else {
    recommendation = "Hold or reject. Candidate lacks multiple core technical skills required for this role.";
  }

  return { strengths, gaps, recommendation };
}

export default function RecruiterInsight({
  matchScore,
  experienceYears,
  candidateSkills,
  requiredSkills,
}: RecruiterInsightProps) {
  const { strengths, gaps, recommendation } = generateRecruiterInsights(
    matchScore,
    experienceYears,
    candidateSkills,
    requiredSkills
  );

  return (
    <Card className="border-border/80 bg-card shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 -z-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
          <Brain className="h-5 w-5 text-indigo-400" />
          Recruiter Intelligence
        </CardTitle>
        <CardDescription>
          Deterministic AI profile analysis & recommendation
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Strengths Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Strengths
          </h4>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            {strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-muted-foreground leading-relaxed pl-1">
                <span className="text-foreground">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-amber-500 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Gaps Identified
          </h4>
          {gaps.length === 0 ? (
            <p className="text-sm text-muted-foreground italic pl-1">No major gaps identified.</p>
          ) : (
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              {gaps.map((gap, idx) => (
                <li key={idx} className="text-sm text-muted-foreground leading-relaxed pl-1">
                  <span className="text-foreground">{gap}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommendation Section */}
        <div className="pt-4 border-t border-border/60 space-y-2">
          <h4 className="text-sm font-semibold text-indigo-400 flex items-center gap-1.5">
            <PlayCircle className="h-4 w-4 shrink-0" />
            Recommendation
          </h4>
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-sm font-medium text-foreground leading-relaxed">
            {recommendation}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
