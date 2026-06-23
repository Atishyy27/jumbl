"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchBreakdown } from "@/components/match-breakdown";
import RecruiterInsight from "@/components/recruiter-insight";
import AiQuestions from "@/components/ai-questions";
import {
  ArrowLeft,
  GraduationCap,
  Award,
  Mail,
  User,
  Briefcase,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Applicant } from "@/types/ats";

interface DetailsJob {
  id: string;
  title: string;
  requiredSkills: string[];
}

interface DetailsApplication {
  id: string;
  applicantId: string;
  jobId: string;
  matchScore: number;
  createdAt: Date;
  updatedAt: Date;
  job: DetailsJob;
}

interface DetailsApplicant extends Applicant {
  applications: DetailsApplication[];
}

interface ApplicantDetailsViewProps {
  initialApplicant: DetailsApplicant;
}

export default function ApplicantDetailsView({ initialApplicant }: ApplicantDetailsViewProps) {
  const [applicant, setApplicant] = useState<DetailsApplicant>(initialApplicant);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track currently selected application for Match Breakdown
  const [selectedAppId, setSelectedAppId] = useState<string>(
    applicant.applications && applicant.applications.length > 0
      ? applicant.applications[0].id
      : ""
  );

  const selectedApplication = applicant.applications?.find((app) => app.id === selectedAppId);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/applicants/${applicant.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update applicant status.");
      }

      const json = await res.json();
      if (json.success) {
        setApplicant((prev) => ({
          ...prev,
          status: json.data.status,
        }));
      } else {
        throw new Error(json.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An error occurred while updating status.";
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-500/10 text-blue-400 border-blue-500/25";
      case "Screening":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
      case "Interview":
        return "bg-purple-500/10 text-purple-400 border-purple-500/25";
      case "Hired":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "Rejected":
        return "bg-rose-500/10 text-rose-400 border-rose-500/25";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back navigation */}
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Candidates
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <Card className="relative overflow-hidden border-border/80 bg-card shadow-lg">
        <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-primary font-bold text-xl shrink-0 shadow-inner">
                <User className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    {applicant.name}
                  </h1>
                  <Badge variant="outline" className={`font-semibold px-2.5 py-0.5 mt-0.5 ${getStatusBadgeStyle(applicant.status)}`}>
                    {applicant.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 shrink-0" />
                    {applicant.email}
                  </span>
                  <span className="hidden sm:inline">&bull;</span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    {applicant.college}
                  </span>
                  <span className="hidden sm:inline">&bull;</span>
                  <span className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 shrink-0" />
                    {applicant.experienceYears} {applicant.experienceYears === 1 ? "year" : "years"} experience
                  </span>
                </div>
              </div>
            </div>

            {/* Status Change Dropdown Container */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-secondary/30 border border-border/50 p-3 rounded-xl shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                Update Status:
              </div>
              
              <select
                value={applicant.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className="bg-background border border-border hover:border-border/80 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-foreground focus:outline-none cursor-pointer focus:ring-1 focus:ring-primary min-w-[130px] disabled:opacity-50"
              >
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Show error during patch status updates */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-rose-500 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Skills Display */}
          <div className="mt-6 pt-6 border-t border-border/60">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
              Candidate Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {applicant.skills?.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="py-1 px-3 text-xs bg-muted/60 border border-border/40 hover:bg-muted transition-colors text-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sections Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Applications List (takes 1 span) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/80 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Applications
              </CardTitle>
              <CardDescription>
                Job roles candidate has applied to
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {!applicant.applications || applicant.applications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground italic">
                  No active job applications found.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {applicant.applications.map((app) => {
                    const isSelected = app.id === selectedAppId;
                    const getScoreColor = (score: number) => {
                      if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                      if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
                      return "text-rose-500 bg-rose-500/10 border-rose-500/20";
                    };

                    return (
                      <button
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`w-full text-left p-4 transition-all flex items-center justify-between gap-4 border-l-2 ${
                          isSelected
                            ? "bg-muted/30 border-primary"
                            : "border-transparent hover:bg-muted/15"
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-foreground">
                            {app.job?.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className={`font-mono font-bold text-xs shrink-0 px-2 py-0.5 ${getScoreColor(app.matchScore)}`}>
                          {app.matchScore}% Match
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Match Breakdown Display (takes 2 spans) */}
        <div className="lg:col-span-2">
          {selectedApplication ? (
            <div className="space-y-6">
              <MatchBreakdown
                candidateSkills={applicant.skills || []}
                requiredSkills={selectedApplication.job?.requiredSkills || []}
                matchScore={selectedApplication.matchScore || 0}
                jobTitle={selectedApplication.job?.title || "Role Application"}
              />
              <RecruiterInsight
                matchScore={selectedApplication.matchScore || 0}
                experienceYears={applicant.experienceYears}
                candidateSkills={applicant.skills || []}
                requiredSkills={selectedApplication.job?.requiredSkills || []}
              />
              <AiQuestions
                jobId={selectedApplication.jobId}
                applicantId={applicant.id}
                jobTitle={selectedApplication.job?.title || ""}
                candidateSkills={applicant.skills || []}
                experienceYears={applicant.experienceYears}
              />
            </div>
          ) : (
            <Card className="h-full border-border/80 bg-muted/10 flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
              <Sparkles className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <h3 className="font-semibold text-foreground">Select an application</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Choose one of the job applications from the list to view its visual skill match breakdown.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
