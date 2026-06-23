import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import RecruiterInsight, { generateRecruiterInsights } from "@/components/recruiter-insight";

test("generateRecruiterInsights logic matches correct profiles", () => {
  // Test case 1: Senior candidate with high match score
  const insights1 = generateRecruiterInsights(
    85,
    6,
    ["React", "TypeScript", "Tailwind", "Node.js"],
    ["React", "TypeScript", "GraphQL"]
  );

  expect(insights1.strengths).toContain("Senior candidate with 6 years of industry experience.");
  expect(insights1.strengths).toContain("Excellent skill alignment (85% match score).");
  expect(insights1.gaps).toContain("Missing required skill: GraphQL");
  expect(insights1.recommendation).toContain("Strongly recommend proceeding to technical interview stage");

  // Test case 2: Entry level candidate with moderate match score
  const insights2 = generateRecruiterInsights(
    60,
    1,
    ["React", "CSS"],
    ["React", "TypeScript", "Tailwind"]
  );

  expect(insights2.strengths).toContain("Entry-level candidate (1 year) with fresh perspective.");
  expect(insights2.strengths).toContain("Moderate skill alignment (60% match score).");
  expect(insights2.gaps).toContain("Missing required skill: TypeScript");
  expect(insights2.gaps).toContain("Limited professional work experience (less than 2 years).");
  expect(insights2.recommendation).toContain("Proceed to initial recruiter phone screening");
});

test("renders RecruiterInsight component with generated elements", () => {
  render(
    <RecruiterInsight
      matchScore={90}
      experienceYears={4}
      candidateSkills={["React", "TypeScript", "CSS"]}
      requiredSkills={["React", "TypeScript"]}
    />
  );

  // Check titles
  expect(screen.getByText("Recruiter Intelligence")).toBeInTheDocument();
  expect(screen.getByText("Strengths")).toBeInTheDocument();
  expect(screen.getByText("Gaps Identified")).toBeInTheDocument();
  expect(screen.getByText("Recommendation")).toBeInTheDocument();

  // Check generated text rendering
  expect(screen.getByText("Solid professional experience (4 years).")).toBeInTheDocument();
  expect(screen.getByText("Excellent skill alignment (90% match score).")).toBeInTheDocument();
  expect(screen.getByText("No major skill gaps identified; candidate possesses all core required skills.")).toBeInTheDocument();
  expect(screen.getByText(/Strongly recommend proceeding to technical interview stage/)).toBeInTheDocument();
});
