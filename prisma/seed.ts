import { prisma } from '../lib/db';

function calculateMatchScore(applicantSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 0;
  const applicantSkillsLower = applicantSkills.map(s => s.toLowerCase());
  const overlappingSkills = requiredSkills.filter(s => applicantSkillsLower.includes(s.toLowerCase()));
  const percentage = (overlappingSkills.length / requiredSkills.length) * 100;
  return Math.round(percentage);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  console.log('Clearing existing database...');
  await prisma.application.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.job.deleteMany();

  // Create Jobs
  console.log('Creating jobs...');
  const jobsData = [
    {
      title: 'Frontend Engineer',
      description: 'We are looking for a Frontend Engineer with deep expertise in styling, state management, and modern component design. You will build user-facing web applications using React and Next.js.',
      requiredSkills: ['React', 'TypeScript', 'Tailwind', 'CSS', 'HTML'],
    },
    {
      title: 'Backend Engineer',
      description: 'We are seeking a Backend Engineer to design scalable APIs, maintain databases, and establish microservices. Strong experience with Node.js and SQL is required.',
      requiredSkills: ['Node.js', 'PostgreSQL', 'Prisma', 'TypeScript', 'Express'],
    },
    {
      title: 'Product Engineer',
      description: 'Join us as a Product Engineer. You will work across the full stack, bridging the gap between engineering and product. You will own features from design to deployment.',
      requiredSkills: ['Next.js', 'React', 'Tailwind', 'PostgreSQL', 'Node.js'],
    },
  ];

  const jobs = [];
  for (const data of jobsData) {
    const job = await prisma.job.create({ data });
    jobs.push(job);
  }

  // Create Applicants (10 candidates)
  console.log('Creating applicants...');
  const applicantsData = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      college: 'Stanford University',
      skills: ['React', 'TypeScript', 'Tailwind', 'CSS', 'HTML', 'Next.js'],
      experienceYears: 3,
      status: 'Interview',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      college: 'MIT',
      skills: ['Node.js', 'PostgreSQL', 'Express', 'JavaScript', 'SQL'],
      experienceYears: 5,
      status: 'Hired',
    },
    {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      college: 'UC Berkeley',
      skills: ['React', 'HTML', 'CSS', 'Figma'],
      experienceYears: 1,
      status: 'Applied',
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      college: 'Carnegie Mellon University',
      skills: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'PostgreSQL', 'React'],
      experienceYears: 4,
      status: 'Screening',
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      college: 'Georgia Tech',
      skills: ['Python', 'Django', 'SQL', 'Docker'],
      experienceYears: 2,
      status: 'Rejected',
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      college: 'University of Washington',
      skills: ['Next.js', 'React', 'Tailwind', 'PostgreSQL', 'Node.js', 'TypeScript'],
      experienceYears: 3,
      status: 'Interview',
    },
    {
      name: 'David Lee',
      email: 'david.lee@example.com',
      college: 'UT Austin',
      skills: ['Node.js', 'PostgreSQL', 'Prisma', 'TypeScript', 'GraphQL', 'AWS'],
      experienceYears: 6,
      status: 'Hired',
    },
    {
      name: 'Jessica Taylor',
      email: 'jessica.taylor@example.com',
      college: 'Boston University',
      skills: ['HTML', 'CSS', 'React', 'TypeScript', 'Tailwind'],
      experienceYears: 2,
      status: 'Screening',
    },
    {
      name: 'Ryan Martinez',
      email: 'ryan.martinez@example.com',
      college: 'UIUC',
      skills: ['C++', 'Python', 'Java'],
      experienceYears: 1,
      status: 'Rejected',
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      college: 'Cornell University',
      skills: ['Next.js', 'React', 'Tailwind', 'Node.js', 'TypeScript', 'Express', 'PostgreSQL'],
      experienceYears: 4,
      status: 'Applied',
    },
  ];

  const applicants = [];
  for (const data of applicantsData) {
    const applicant = await prisma.applicant.create({ data });
    applicants.push(applicant);
  }

  // Create Applications and generate match scores
  console.log('Creating applications and match scores...');
  const frontendJob = jobs.find(j => j.title === 'Frontend Engineer')!;
  const backendJob = jobs.find(j => j.title === 'Backend Engineer')!;
  const productJob = jobs.find(j => j.title === 'Product Engineer')!;

  const applicationsMapping = [
    // John Doe: Frontend & Product
    { applicant: applicants[0], job: frontendJob },
    { applicant: applicants[0], job: productJob },
    // Jane Smith: Backend
    { applicant: applicants[1], job: backendJob },
    // Alex Johnson: Frontend
    { applicant: applicants[2], job: frontendJob },
    // Emily Davis: Backend & Product
    { applicant: applicants[3], job: backendJob },
    { applicant: applicants[3], job: productJob },
    // Michael Brown: Backend
    { applicant: applicants[4], job: backendJob },
    // Sarah Wilson: Frontend & Product
    { applicant: applicants[5], job: frontendJob },
    { applicant: applicants[5], job: productJob },
    // David Lee: Backend
    { applicant: applicants[6], job: backendJob },
    // Jessica Taylor: Frontend
    { applicant: applicants[7], job: frontendJob },
    // Ryan Martinez: Backend
    { applicant: applicants[8], job: backendJob },
    // Lisa Anderson: Product & Frontend
    { applicant: applicants[9], job: productJob },
    { applicant: applicants[9], job: frontendJob },
  ];

  for (const mapping of applicationsMapping) {
    const applicantSkills = mapping.applicant.skills as string[];
    const requiredSkills = mapping.job.requiredSkills as string[];
    const matchScore = calculateMatchScore(applicantSkills, requiredSkills);

    await prisma.application.create({
      data: {
        applicantId: mapping.applicant.id,
        jobId: mapping.job.id,
        matchScore,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
