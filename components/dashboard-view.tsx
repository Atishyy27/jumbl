"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  UserCheck,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  Inbox,
  GraduationCap,
  Award,
  ChevronRight,
  TrendingUp,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Applicant, Job } from "@/types/ats";
import AddCandidateDialog from "@/components/add-candidate-dialog";
import ToastNotification, { useToast } from "@/components/toast-notification";

interface DashboardApplication {
  id: string;
  applicantId: string;
  jobId: string;
  matchScore: number;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    requiredSkills: string[];
  };
}

interface DashboardApplicant extends Applicant {
  applications: DashboardApplication[];
}

const PAGE_LIMIT_OPTIONS = [10, 25, 50, 100];

export default function DashboardView() {
  const [applicants, setApplicants] = useState<DashboardApplicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [sortByScore, setSortByScore] = useState<"desc" | "asc" | "none">("none");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  // Toast
  const { toasts, addToast, dismissToast } = useToast();

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resApplicants, resJobs] = await Promise.all([
        fetch("/api/applicants"),
        fetch("/api/jobs"),
      ]);

      if (!resApplicants.ok || !resJobs.ok) {
        throw new Error("Failed to fetch data from the server.");
      }

      const jsonApplicants = await resApplicants.json();
      const jsonJobs = await resJobs.json();

      if (jsonApplicants.success && jsonJobs.success) {
        setApplicants(jsonApplicants.data);
        setJobs(jsonJobs.data);
      } else {
        throw new Error(jsonApplicants.error || jsonJobs.error || "API returned failure state.");
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An error occurred while loading the dashboard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, skillFilter, sortByScore, pageLimit]);

  // Compute stats
  const totalApplicants = applicants.length;
  const totalJobs = jobs.length;
  const applicantsInterviewing = applicants.filter((a) => a.status === "Interview").length;
  const applicantsHired = applicants.filter((a) => a.status === "Hired").length;

  // Extract all unique skills from all candidates to build the filter dropdown
  const allSkillsSet = new Set<string>();
  applicants.forEach((a) => {
    if (Array.isArray(a.skills)) {
      a.skills.forEach((s: string) => allSkillsSet.add(s));
    }
  });
  const allUniqueSkills = Array.from(allSkillsSet).sort();

  // Helper: compute candidate's max match score
  const getMaxMatchScore = (applicant: DashboardApplicant) => {
    if (!applicant.applications || applicant.applications.length === 0) return 0;
    return Math.max(...applicant.applications.map((app) => app.matchScore));
  };

  // Filter & Sort execution
  const processedApplicants = applicants
    .filter((candidate) => {
      const nameMatch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === "All" || candidate.status === statusFilter;
      const skillMatch =
        skillFilter === "All" ||
        (Array.isArray(candidate.skills) &&
          candidate.skills.some((s: string) => s.toLowerCase() === skillFilter.toLowerCase()));
      return nameMatch && statusMatch && skillMatch;
    })
    .sort((a, b) => {
      if (sortByScore === "none") return 0;
      const scoreA = getMaxMatchScore(a);
      const scoreB = getMaxMatchScore(b);
      return sortByScore === "desc" ? scoreB - scoreA : scoreA - scoreB;
    });

  // Pagination computation
  const totalFiltered = processedApplicants.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageLimit));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageLimit;
  const paginatedApplicants = processedApplicants.slice(startIdx, startIdx + pageLimit);

  // Cycle sorting state
  const handleSortToggle = () => {
    if (sortByScore === "none") setSortByScore("desc");
    else if (sortByScore === "desc") setSortByScore("asc");
    else setSortByScore("none");
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setSkillFilter("All");
    setSortByScore("none");
    setCurrentPage(1);
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

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    if (score >= 50) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
    return "bg-rose-500/10 text-rose-400 border-rose-500/25";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast notifications */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
            ATS Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage candidate applications, review technical matches, and progress candidates.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <AddCandidateDialog
            onSuccess={fetchData}
            onToast={addToast}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-2 border-border/80 hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5 text-destructive p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Failed to retrieve data</h3>
            <p className="text-sm font-medium opacity-90">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="mt-2 border-destructive/20 text-destructive hover:bg-destructive/10">
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Cards Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="relative overflow-hidden border-border/60 bg-card/60 shadow-md">
                <CardHeader className="pb-2 space-y-2">
                  <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-8 w-14 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          : [
              {
                title: "Total Applicants",
                value: totalApplicants,
                desc: "Total profiles registered",
                icon: <Users className="h-5 w-5 text-blue-400" />,
              },
              {
                title: "Total Jobs",
                value: totalJobs,
                desc: "Target roles recruiting",
                icon: <Briefcase className="h-5 w-5 text-amber-400" />,
              },
              {
                title: "Interview Stage",
                value: applicantsInterviewing,
                desc: "Meeting with team members",
                icon: <TrendingUp className="h-5 w-5 text-purple-400" />,
              },
              {
                title: "Hired",
                value: applicantsHired,
                desc: "Offers signed & confirmed",
                icon: <UserCheck className="h-5 w-5 text-emerald-400" />,
              },
            ].map((stat, idx) => (
              <Card key={idx} className="relative overflow-hidden border-border/80 bg-card hover:border-primary/30 transition-all shadow-md group">
                <div className="absolute top-0 right-0 -z-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">{stat.title}</CardTitle>
                  <div className="p-2 bg-secondary/50 rounded-lg border border-border/40">{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold tracking-tight text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Main Content Area */}
      <Card className="border-border/80 shadow-lg">
        <CardHeader className="border-b border-border/60 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                Candidates Directory
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed overview of candidates, skill fits, status, and scores
              </p>
            </div>

            {/* Filters layout */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9.5 text-sm bg-muted/40 border-border/80 focus:bg-background"
                />
              </div>

              {/* Status Select */}
              <div className="flex items-center gap-1.5 bg-muted/40 border border-border/80 px-2 py-1 rounded-lg h-9.5 text-sm shrink-0">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground text-xs font-semibold mr-1">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-foreground font-medium text-xs cursor-pointer pr-1"
                >
                  <option value="All" className="bg-card text-foreground">All Statuses</option>
                  <option value="Applied" className="bg-card text-foreground">Applied</option>
                  <option value="Screening" className="bg-card text-foreground">Screening</option>
                  <option value="Interview" className="bg-card text-foreground">Interview</option>
                  <option value="Hired" className="bg-card text-foreground">Hired</option>
                  <option value="Rejected" className="bg-card text-foreground">Rejected</option>
                </select>
              </div>

              {/* Skill Select */}
              <div className="flex items-center gap-1.5 bg-muted/40 border border-border/80 px-2 py-1 rounded-lg h-9.5 text-sm shrink-0">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground text-xs font-semibold mr-1">Skill:</span>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-foreground font-medium text-xs cursor-pointer pr-1 max-w-[140px]"
                >
                  <option value="All" className="bg-card text-foreground">All Skills</option>
                  {allUniqueSkills.map((skill) => (
                    <option key={skill} value={skill} className="bg-card text-foreground">
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Match Score */}
              <Button
                variant={sortByScore !== "none" ? "secondary" : "outline"}
                size="sm"
                onClick={handleSortToggle}
                className="gap-2 h-9.5 border-border/85"
              >
                <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">
                  {sortByScore === "none"
                    ? "Sort Score"
                    : sortByScore === "desc"
                    ? "Score: High-to-Low"
                    : "Score: Low-to-High"}
                </span>
              </Button>

              {/* Reset filter button if any active */}
              {(searchQuery || statusFilter !== "All" || skillFilter !== "All" || sortByScore !== "none") && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-9.5 text-muted-foreground hover:text-foreground">
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            /* Table Loading Skeletons */
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div className="space-y-2">
                    <div className="h-4 w-36 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Table Error Block */
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <p className="font-semibold text-foreground">Data Load Failure</p>
              <p className="text-xs mt-1">Please try refreshing the table using the button above.</p>
            </div>
          ) : processedApplicants.length === 0 ? (
            /* Empty Table State */
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
              <div className="p-4 bg-muted/30 rounded-full border border-border/40 mb-4">
                <Inbox className="h-10 w-10 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No candidates match filters</h3>
              <p className="text-sm mt-1 max-w-xs leading-relaxed">
                We couldn&apos;t find any candidate matching your exact filter selections. Try broadening your keywords or reset all options.
              </p>
              <Button size="sm" onClick={resetFilters} className="mt-5">
                Reset Filters
              </Button>
            </div>
          ) : (
            /* Main Applicant Table */
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/15 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">College</th>
                      <th className="px-6 py-4">Experience</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Match Score</th>
                      <th className="px-6 py-4 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {paginatedApplicants.map((applicant) => {
                      const bestScore = getMaxMatchScore(applicant);
                      const bestApp =
                        applicant.applications && applicant.applications.length > 0
                          ? applicant.applications.reduce((best, current) =>
                              current.matchScore > best.matchScore ? current : best
                            )
                          : null;

                      return (
                        <tr
                          key={applicant.id}
                          className="group hover:bg-muted/15 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <Link href={`/applicant/${applicant.id}`} className="block">
                              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {applicant.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {applicant.email}
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[200px]" title={applicant.college}>
                                {applicant.college}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span>
                                {applicant.experienceYears} {applicant.experienceYears === 1 ? "year" : "years"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={`text-xs font-medium px-2.5 py-0.5 ${getStatusBadgeStyle(applicant.status)}`}>
                              {applicant.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {bestApp ? (
                              <div className="inline-flex flex-col items-end gap-1">
                                <Badge
                                  variant="outline"
                                  className={`font-mono font-bold text-xs px-2 py-0.5 ${getScoreBadgeStyle(bestScore)}`}
                                >
                                  {bestScore}% Match
                                </Badge>
                                <span className="text-[10px] text-muted-foreground max-w-[130px] truncate" title={bestApp.job?.title}>
                                  {bestApp.job?.title}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground font-medium">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link href={`/applicant/${applicant.id}`} className="inline-flex items-center justify-center p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/60">
                {/* Left: rows info + limit selector */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {totalFiltered === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + pageLimit, totalFiltered)}
                    </span>{" "}
                    of <span className="font-semibold text-foreground">{totalFiltered}</span> candidates
                  </span>
                  <div className="flex items-center gap-1.5 bg-muted/40 border border-border/80 px-2 py-1 rounded-lg">
                    <span className="text-xs font-semibold text-muted-foreground">Show:</span>
                    <select
                      value={pageLimit}
                      onChange={(e) => {
                        setPageLimit(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-transparent border-none focus:outline-none text-foreground font-medium text-xs cursor-pointer pr-1"
                    >
                      {PAGE_LIMIT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-card text-foreground">
                          {opt} / page
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right: page nav */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={safePage === 1}
                    title="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page number chips */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      return p === 1 || p === totalPages || Math.abs(p - safePage) <= 2;
                    })
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) {
                        acc.push("…");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm select-none">
                          …
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={safePage === item ? "default" : "outline"}
                          size="icon-sm"
                          onClick={() => setCurrentPage(item as number)}
                          className="font-mono text-xs"
                        >
                          {item}
                        </Button>
                      )
                    )}

                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safePage === totalPages}
                    title="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
