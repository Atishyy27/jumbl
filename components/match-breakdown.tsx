"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, X, Award, Lightbulb } from "lucide-react";

interface MatchBreakdownProps {
  candidateSkills: string[];
  requiredSkills: string[];
  matchScore: number;
  jobTitle: string;
}

export function MatchBreakdown({
  candidateSkills,
  requiredSkills,
  matchScore,
  jobTitle,
}: MatchBreakdownProps) {
  const candidateSkillsLower = candidateSkills.map((s) => s.toLowerCase());

  // Determine score colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500/30 bg-emerald-500/5";
    if (score >= 50) return "text-yellow-500 border-yellow-500/30 bg-yellow-500/5";
    return "text-rose-500 border-rose-500/30 bg-rose-500/5";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 50) return "Moderate Match";
    return "Needs Improvement";
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
    if (score >= 50) return "bg-yellow-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]";
    return "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]";
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Job Match Details
          </span>
          <h3 className="text-xl font-bold mt-1 text-foreground">
            {jobTitle}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Skill breakdown for this role application
          </p>
        </div>

        {/* Prominent Score Widget */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full border-4 border-muted shrink-0">
            {/* Simple SVG Arc for Match Score */}
            <svg className="absolute -rotate-90 w-full h-full p-1" viewBox="0 0 36 36">
              <path
                className="text-muted-foreground/10"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  matchScore >= 80
                    ? "text-emerald-500"
                    : matchScore >= 50
                    ? "text-yellow-500"
                    : "text-rose-500"
                }
                strokeWidth="2.5"
                strokeDasharray={`${matchScore}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="text-center">
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                {matchScore}%
              </span>
            </div>
          </div>
          <div>
            <Badge variant="outline" className={`font-semibold px-2.5 py-1 ${getScoreColor(matchScore)}`}>
              {getScoreText(matchScore)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Required skills covered
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 pt-6">
        {/* Required Skills Match Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
            <Award className="h-4 w-4 text-primary" />
            Required Skills Checklist
          </h4>
          <div className="space-y-2">
            {requiredSkills.length === 0 ? (
              <p className="text-xs text-muted-foreground">No required skills defined for this job.</p>
            ) : (
              requiredSkills.map((skill) => {
                const isMatched = candidateSkillsLower.includes(skill.toLowerCase());
                return (
                  <div
                    key={skill}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isMatched
                        ? "bg-emerald-500/5 border-emerald-500/10 text-foreground"
                        : "bg-rose-500/5 border-rose-500/10 text-muted-foreground"
                    }`}
                  >
                    <span className="text-sm font-medium">{skill}</span>
                    <div className="flex items-center gap-1.5">
                      {isMatched ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <Check className="h-3 w-3 shrink-0" />
                          Match
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          <X className="h-3 w-3 shrink-0" />
                          Missing
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Other Candidate Skills */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Additional Candidate Skills
          </h4>
          <div className="p-4 rounded-xl border border-border bg-muted/20 min-h-[120px] flex flex-wrap gap-2 content-start">
            {candidateSkills.filter(
              (skill) => !requiredSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
            ).length === 0 ? (
              <p className="text-xs text-muted-foreground italic my-auto mx-auto text-center">
                All candidate skills are mapped to requirements.
              </p>
            ) : (
              candidateSkills
                .filter(
                  (skill) => !requiredSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
                )
                .map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs py-1 px-3 border border-border/45 hover:bg-secondary/80 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))
            )}
          </div>
        </div>
      </div>
      
      {/* Visual match bar indicator */}
      <div className="mt-6 pt-4 border-t border-border/60">
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
          <span>Overall Match Progress</span>
          <span>{matchScore}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getScoreProgressColor(matchScore)}`}
            style={{ width: `${matchScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
