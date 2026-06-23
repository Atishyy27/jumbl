import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { apiSuccess, apiError, isValidUuid, isValidStatus } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Validate ID format
    if (!isValidUuid(id)) {
      return apiError('Invalid applicant ID format. Expected a valid UUID.', 400);
    }

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid request body. Expected JSON.', 400);
    }

    const { status } = body;

    // 3. Validate status field
    if (status === undefined) {
      return apiError('Field "status" is required in request body.', 400);
    }

    if (typeof status !== 'string' || !isValidStatus(status)) {
      return apiError('Field "status" must be one of: Applied, Screening, Interview, Rejected, Hired.', 400);
    }

    // 4. Verify applicant exists
    const applicant = await prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      return apiError('Applicant not found.', 404);
    }

    // 5. Update status
    const updatedApplicant = await prisma.applicant.update({
      where: { id },
      data: { status },
    });

    return apiSuccess(updatedApplicant);
  } catch (error) {
    console.error('Error updating applicant status:', error);
    return apiError('Failed to update applicant status.', 500);
  }
}
