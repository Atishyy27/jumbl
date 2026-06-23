import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { apiSuccess, apiError, isValidUuid } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID pattern
    if (!isValidUuid(id)) {
      return apiError('Invalid applicant ID format. Expected a valid UUID.', 400);
    }

    // Query applicant with their applications and job details
    const applicant = await prisma.applicant.findUnique({
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

    if (!applicant) {
      return apiError('Applicant not found.', 404);
    }

    return apiSuccess(applicant);
  } catch (error) {
    console.error('Error fetching applicant:', error);
    return apiError('Failed to retrieve applicant details.', 500);
  }
}
