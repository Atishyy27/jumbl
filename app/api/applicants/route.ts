import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { apiSuccess, apiError, isValidEmail, isValidStatus } from '@/lib/api-helpers';

// GET /api/applicants - List all applicants
export async function GET() {
  try {
    const applicants = await prisma.applicant.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
    return apiSuccess(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return apiError('Failed to retrieve applicants from the database.', 500);
  }
}

// POST /api/applicants - Create a new applicant
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid request body. Expected JSON.', 400);
    }

    const { name, email, college, skills, experienceYears, status } = body;

    // 1. Validate required fields
    const missingFields: string[] = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!college) missingFields.push('college');
    if (skills === undefined) missingFields.push('skills');
    if (experienceYears === undefined) missingFields.push('experienceYears');

    if (missingFields.length > 0) {
      return apiError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // 2. Validate field formats and types
    if (typeof name !== 'string' || name.trim().length === 0) {
      return apiError('Field "name" must be a non-empty string.', 400);
    }

    if (typeof email !== 'string' || !isValidEmail(email)) {
      return apiError('Field "email" must be a valid email address.', 400);
    }

    if (typeof college !== 'string' || college.trim().length === 0) {
      return apiError('Field "college" must be a non-empty string.', 400);
    }

    if (!Array.isArray(skills) || !skills.every(skill => typeof skill === 'string')) {
      return apiError('Field "skills" must be an array of strings.', 400);
    }

    if (typeof experienceYears !== 'number' || experienceYears < 0 || !Number.isInteger(experienceYears)) {
      return apiError('Field "experienceYears" must be a non-negative integer.', 400);
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || !isValidStatus(status)) {
        return apiError('Field "status" must be one of: Applied, Screening, Interview, Rejected, Hired.', 400);
      }
    }

    // 3. Check for unique email constraint
    const existingApplicant = await prisma.applicant.findUnique({
      where: { email },
    });

    if (existingApplicant) {
      return apiError('An applicant with this email address already exists.', 409);
    }

    // 4. Create the record in SQLite via Prisma client
    const newApplicant = await prisma.applicant.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        college: college.trim(),
        skills,
        experienceYears,
        status: status || 'Applied',
      },
    });

    return apiSuccess(newApplicant, 201);
  } catch (error) {
    console.error('Error creating applicant:', error);
    return apiError('Failed to create applicant in the database.', 500);
  }
}
