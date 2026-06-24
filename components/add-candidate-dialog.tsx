"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Plus, Loader2 } from "lucide-react";

interface AddCandidateDialogProps {
  onSuccess: () => void;
  onToast: (message: string, type: "success" | "error") => void;
}

interface FormData {
  name: string;
  email: string;
  college: string;
  skills: string[];
  experienceYears: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  college?: string;
  skills?: string;
  experienceYears?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AddCandidateDialog({ onSuccess, onToast }: AddCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    college: "",
    skills: [],
    experienceYears: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = () => {
    setFormData({ name: "", email: "", college: "", skills: [], experienceYears: "" });
    setErrors({});
    setSkillInput("");
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      if (errors.skills) setErrors((prev) => ({ ...prev, skills: undefined }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.college.trim()) newErrors.college = "College is required.";
    if (formData.skills.length === 0) newErrors.skills = "At least one skill is required.";
    const exp = parseInt(formData.experienceYears, 10);
    if (!formData.experienceYears.trim()) {
      newErrors.experienceYears = "Experience years is required.";
    } else if (isNaN(exp) || exp < 0 || !Number.isInteger(exp)) {
      newErrors.experienceYears = "Must be a non-negative whole number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          college: formData.college.trim(),
          skills: formData.skills,
          experienceYears: parseInt(formData.experienceYears, 10),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        handleClose();
        onSuccess();
        onToast(`${formData.name.trim()} has been added as a candidate.`, "success");
      } else {
        onToast(data.error || "Failed to create candidate.", "error");
      }
    } catch {
      onToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true); }}>
      <DialogTrigger
        render={
          <Button variant="default" size="sm" className="gap-2" />
        }
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        Add Candidate
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4 text-primary" />
            Add New Candidate
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 py-1">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="candidate-name" className="text-sm font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="candidate-name"
              placeholder="e.g. John Smith"
              value={formData.name}
              onChange={(e) => {
                setFormData((p) => ({ ...p, name: e.target.value }));
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              className={errors.name ? "border-destructive focus:ring-destructive/30" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="candidate-email" className="text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="candidate-email"
              type="email"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData((p) => ({ ...p, email: e.target.value }));
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              className={errors.email ? "border-destructive focus:ring-destructive/30" : ""}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* College */}
          <div className="space-y-1.5">
            <label htmlFor="candidate-college" className="text-sm font-medium text-foreground">
              College / University <span className="text-destructive">*</span>
            </label>
            <Input
              id="candidate-college"
              placeholder="e.g. Stanford University"
              value={formData.college}
              onChange={(e) => {
                setFormData((p) => ({ ...p, college: e.target.value }));
                if (errors.college) setErrors((p) => ({ ...p, college: undefined }));
              }}
              className={errors.college ? "border-destructive focus:ring-destructive/30" : ""}
            />
            {errors.college && <p className="text-xs text-destructive">{errors.college}</p>}
          </div>

          {/* Experience Years */}
          <div className="space-y-1.5">
            <label htmlFor="candidate-exp" className="text-sm font-medium text-foreground">
              Experience (Years) <span className="text-destructive">*</span>
            </label>
            <Input
              id="candidate-exp"
              type="number"
              min="0"
              placeholder="e.g. 3"
              value={formData.experienceYears}
              onChange={(e) => {
                setFormData((p) => ({ ...p, experienceYears: e.target.value }));
                if (errors.experienceYears) setErrors((p) => ({ ...p, experienceYears: undefined }));
              }}
              className={errors.experienceYears ? "border-destructive focus:ring-destructive/30" : ""}
            />
            {errors.experienceYears && (
              <p className="text-xs text-destructive">{errors.experienceYears}</p>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <label htmlFor="candidate-skills" className="text-sm font-medium text-foreground">
              Skills <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="candidate-skills"
                placeholder="Add a skill (press Enter)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className={errors.skills && formData.skills.length === 0 ? "border-destructive focus:ring-destructive/30" : ""}
              />
              <Button type="button" variant="outline" size="icon" onClick={addSkill} className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.skills && formData.skills.length === 0 && (
              <p className="text-xs text-destructive">{errors.skills}</p>
            )}
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full border border-primary/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-destructive transition-colors ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Adding..." : "Add Candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
