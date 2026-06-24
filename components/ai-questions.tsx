"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  HelpCircle,
  Database,
  Info,
} from "lucide-react";

interface AiQuestionsProps {
  jobId: string;
  applicantId: string;
  jobTitle: string;
  candidateSkills: string[];
  experienceYears: number;
}

export default function AiQuestions({
  jobId,
  applicantId,
  jobTitle,
  candidateSkills,
  experienceYears,
}: AiQuestionsProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<{
    cached: boolean;
    simulated: boolean;
  } | null>(null);
  
  // Track copy-to-clipboard state for each question index
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          skills: candidateSkills,
          experienceYears,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate interview questions. Status code ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        setQuestions(json.data.questions);
        setCacheStatus({
          cached: !!json.data.cached,
          simulated: !!json.data.simulated,
        });
      } else {
        throw new Error(json.error || "Failed to generate questions.");
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An error occurred while generating interview questions.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [jobId, applicantId, jobTitle, candidateSkills, experienceYears]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <Card className="border-border/80 bg-card shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 -z-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
      <CardHeader className="border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
            AI Interview Questions
          </CardTitle>
          <CardDescription>
            Generate tailored questions based on candidate profile & job spec
          </CardDescription>
        </div>
        {questions.length > 0 && cacheStatus && (
          <div className="flex flex-wrap gap-2">
            {cacheStatus.cached && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/25 flex items-center gap-1 text-[10px]">
                <Database className="h-3 w-3" />
                Cached
              </Badge>
            )}
            {cacheStatus.simulated && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/25 flex items-center gap-1 text-[10px]">
                <Info className="h-3 w-3" />
                AI Interview Assistant
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        {error && (
          <div className="border-destructive/30 bg-destructive/5 text-destructive p-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Generation Failed</p>
              <p className="text-xs opacity-90 leading-relaxed">{error}</p>
              <Button variant="outline" size="sm" onClick={generateQuestions} className="mt-2 border-destructive/20 text-destructive hover:bg-destructive/10">
                Retry Generation
              </Button>
            </div>
          </div>
        )}

        {questions.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border/80 rounded-2xl bg-muted/5">
            <HelpCircle className="h-10 w-10 text-muted-foreground/60 mb-3" />
            <h4 className="font-semibold text-foreground text-sm">No Questions Generated</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              Generate 5 customized technical screening questions tailored specifically for this candidate&apos;s experience.
            </p>
            <Button onClick={generateQuestions} className="mt-4 gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Questions
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground pl-1">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Analyzing profile & crafting tailored questions...</span>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-muted/20 animate-pulse space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            ))}
          </div>
        )}

        {questions.length > 0 && !loading && (
          <div className="space-y-3.5">
            {questions.map((question, index) => (
              <div
                key={index}
                className="group/q flex items-start justify-between p-4 rounded-xl border border-border/85 bg-muted/15 hover:bg-muted/30 transition-all gap-4"
              >
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground border border-border/40 font-mono mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {question}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(question, index)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
                  title="Copy question to clipboard"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
            
            <div className="pt-4 border-t border-border/60 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                AI questions cached locally for instant future loads.
              </span>
              <Button variant="outline" size="sm" onClick={generateQuestions} className="text-xs border-border/80 hover:bg-muted gap-1.5 h-8">
                <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ display: loading ? "block" : "none" }} />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
