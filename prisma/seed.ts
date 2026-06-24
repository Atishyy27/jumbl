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

  // Create Applicants (30+ candidates)
  console.log('Creating applicants...');
  
  const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Michael', 'Sarah', 'David', 'Jessica', 'Ryan', 'Lisa', 'Daniel', 'Emma', 'Matthew', 'Olivia', 'Andrew', 'Sophia', 'James', 'Isabella', 'William', 'Mia', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Henry', 'Harper', 'Alexander', 'Evelyn', 'Sebastian', 'Abigail'];
  const lastNames = ['Doe', 'Smith', 'Johnson', 'Davis', 'Brown', 'Wilson', 'Lee', 'Taylor', 'Martinez', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright'];
  const colleges = ['Stanford University', 'MIT', 'UC Berkeley', 'Carnegie Mellon University', 'Georgia Tech', 'University of Washington', 'UT Austin', 'Boston University', 'UIUC', 'Cornell University', 'Harvard', 'Yale', 'Princeton', 'Columbia', 'NYU'];
  const availableSkills = ['React', 'TypeScript', 'Tailwind', 'CSS', 'HTML', 'Next.js', 'Node.js', 'PostgreSQL', 'Express', 'JavaScript', 'SQL', 'Figma', 'Prisma', 'Python', 'Django', 'Docker', 'GraphQL', 'AWS', 'C++', 'Java'];
  const statuses = ['Applied', 'Screening', 'Interview', 'Rejected', 'Hired'];

  const applicantsData = [];

  for (let i = 0; i < 35; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
    const college = colleges[Math.floor(Math.random() * colleges.length)];
    
    // Pick 3-7 random skills
    const numSkills = Math.floor(Math.random() * 5) + 3;
    const shuffledSkills = [...availableSkills].sort(() => 0.5 - Math.random());
    const skills = shuffledSkills.slice(0, numSkills);
    
    const experienceYears = Math.floor(Math.random() * 8) + 1; // 1 to 8 years
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    applicantsData.push({
      name,
      email,
      college,
      skills,
      experienceYears,
      status
    });
  }

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

  const applicationsMapping = [];
  
  // Assign 1 or 2 jobs to each candidate
  for (const applicant of applicants) {
    const numJobs = Math.random() > 0.7 ? 2 : 1;
    const shuffledJobs = [frontendJob, backendJob, productJob].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numJobs; i++) {
      applicationsMapping.push({
        applicant,
        job: shuffledJobs[i]
      });
    }
  }

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
