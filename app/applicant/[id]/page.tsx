import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import ApplicantDetailsView from "@/components/applicant-details-view";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch applicant details with applications and related job specs
  let applicant;
  try {
    applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                requiredSkills: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Database error while fetching applicant:", error);
    notFound();
  }

  if (!applicant) {
    notFound();
  }

  return <ApplicantDetailsView initialApplicant={applicant as unknown as Parameters<typeof ApplicantDetailsView>[0]["initialApplicant"]} />;
}
