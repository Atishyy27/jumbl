import prisma from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return apiSuccess(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    if (error instanceof Error && error.stack) {
      console.error('STACK TRACE:', error.stack);
    }
    return apiError('Failed to retrieve jobs from the database.', 500);
  }
}
