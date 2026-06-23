import { Job as PrismaJob, Applicant as PrismaApplicant, Application as PrismaApplication } from '@prisma/client';

export type ApplicantStatus = 'Applied' | 'Screening' | 'Interview' | 'Rejected' | 'Hired';

export interface Job extends Omit<PrismaJob, 'requiredSkills'> {
  requiredSkills: string[];
}

export interface Applicant extends Omit<PrismaApplicant, 'skills' | 'status'> {
  skills: string[];
  status: ApplicantStatus;
}

export type Application = PrismaApplication;

export interface ApplicationWithDetails extends Application {
  job: Job;
  applicant: Applicant;
}

export interface JobWithApplications extends Job {
  applications: Application[];
}

export interface ApplicantWithApplications extends Applicant {
  applications: Application[];
}
