import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { MatchBreakdown } from "@/components/match-breakdown";

test("renders MatchBreakdown with correct skills, status tags, and score", () => {
  render(
    <MatchBreakdown
      candidateSkills={["React", "TypeScript", "Tailwind"]}
      requiredSkills={["React", "TypeScript", "GraphQL"]}
      matchScore={67}
      jobTitle="Frontend Developer"
    />
  );

  // 1. Verify Job Title is displayed
  expect(screen.getByText("Frontend Developer")).toBeInTheDocument();

  // 2. Verify Score is displayed (in circular arc and bottom progress bar)
  expect(screen.getAllByText("67%").length).toBe(2);

  // 3. Verify Required Skills are rendered
  expect(screen.getByText("React")).toBeInTheDocument();
  expect(screen.getByText("TypeScript")).toBeInTheDocument();
  expect(screen.getByText("GraphQL")).toBeInTheDocument();

  // 4. Verify Match and Missing tags are rendered
  expect(screen.getAllByText("Match").length).toBe(2); // React and TypeScript match
  expect(screen.getAllByText("Missing").length).toBe(1); // GraphQL is missing

  // 5. Verify additional candidate skills are displayed in the secondary card
  expect(screen.getByText("Tailwind")).toBeInTheDocument();
});
