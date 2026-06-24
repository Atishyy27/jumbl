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
    {
      title: 'DevOps Engineer',
      description: 'We need a DevOps Engineer to manage our cloud infrastructure, CI/CD pipelines, and ensure system reliability. Experience with Docker, Kubernetes, and AWS is required.',
      requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    },
    {
      title: 'ML Engineer',
      description: 'We are looking for an ML Engineer to design and deploy machine learning models at scale. Strong Python and data science background required.',
      requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'SQL'],
    },
  ];

  const jobs = [];
  for (const data of jobsData) {
    const job = await prisma.job.create({ data });
    jobs.push(job);
  }

  const frontendJob = jobs.find(j => j.title === 'Frontend Engineer')!;
  const backendJob  = jobs.find(j => j.title === 'Backend Engineer')!;
  const productJob  = jobs.find(j => j.title === 'Product Engineer')!;
  const devopsJob   = jobs.find(j => j.title === 'DevOps Engineer')!;
  const mlJob       = jobs.find(j => j.title === 'ML Engineer')!;

  // ──────────────────────────────────────────────────────────
  // 40 Candidates — realistic skill distributions by profile
  // ──────────────────────────────────────────────────────────
  console.log('Creating applicants...');

  type ApplicantSeed = {
    name: string; email: string; college: string;
    skills: string[]; experienceYears: number; status: string;
  };

  const applicantsData: ApplicantSeed[] = [
    // ── Frontend (8) ──────────────────────────────────────────
    {
      name: 'Aiden Clarke', email: 'aiden.clarke@example.com',
      college: 'Stanford University',
      skills: ['React', 'TypeScript', 'Tailwind', 'CSS', 'HTML', 'Next.js', 'Figma'],
      experienceYears: 4, status: 'Interview',
    },
    {
      name: 'Mia Thompson', email: 'mia.thompson@example.com',
      college: 'UC Berkeley',
      skills: ['React', 'CSS', 'HTML', 'JavaScript', 'Figma', 'Tailwind'],
      experienceYears: 2, status: 'Screening',
    },
    {
      name: 'Liam Foster', email: 'liam.foster@example.com',
      college: 'NYU',
      skills: ['Vue.js', 'TypeScript', 'CSS', 'HTML', 'Webpack', 'Jest'],
      experienceYears: 3, status: 'Applied',
    },
    {
      name: 'Sophia Reed', email: 'sophia.reed@example.com',
      college: 'Carnegie Mellon University',
      skills: ['React', 'TypeScript', 'Tailwind', 'HTML', 'CSS', 'Storybook'],
      experienceYears: 5, status: 'Hired',
    },
    {
      name: 'Ethan Brooks', email: 'ethan.brooks@example.com',
      college: 'University of Michigan',
      skills: ['React', 'CSS', 'HTML', 'JavaScript', 'Redux', 'Figma'],
      experienceYears: 1, status: 'Rejected',
    },
    {
      name: 'Olivia Hart', email: 'olivia.hart@example.com',
      college: 'UT Austin',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'CSS', 'HTML', 'GraphQL'],
      experienceYears: 6, status: 'Hired',
    },
    {
      name: 'Noah Bell', email: 'noah.bell@example.com',
      college: 'Boston University',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Bootstrap'],
      experienceYears: 1, status: 'Applied',
    },
    {
      name: 'Ava Mitchell', email: 'ava.mitchell@example.com',
      college: 'UIUC',
      skills: ['React', 'Tailwind', 'TypeScript', 'CSS', 'HTML', 'Cypress'],
      experienceYears: 3, status: 'Interview',
    },

    // ── Backend (8) ───────────────────────────────────────────
    {
      name: 'James Carter', email: 'james.carter@example.com',
      college: 'MIT',
      skills: ['Node.js', 'PostgreSQL', 'TypeScript', 'Express', 'Prisma', 'Docker'],
      experienceYears: 5, status: 'Hired',
    },
    {
      name: 'Isabella Young', email: 'isabella.young@example.com',
      college: 'Georgia Tech',
      skills: ['Node.js', 'PostgreSQL', 'Express', 'TypeScript', 'Redis', 'REST APIs'],
      experienceYears: 3, status: 'Screening',
    },
    {
      name: 'Mason King', email: 'mason.king@example.com',
      college: 'Cornell University',
      skills: ['Go', 'PostgreSQL', 'Docker', 'gRPC', 'Kubernetes', 'Linux'],
      experienceYears: 7, status: 'Interview',
    },
    {
      name: 'Charlotte Evans', email: 'charlotte.evans@example.com',
      college: 'University of Washington',
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Hibernate', 'REST APIs', 'Docker'],
      experienceYears: 4, status: 'Applied',
    },
    {
      name: 'Benjamin Price', email: 'benjamin.price@example.com',
      college: 'Harvard',
      skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Celery', 'Redis'],
      experienceYears: 5, status: 'Hired',
    },
    {
      name: 'Amelia Ross', email: 'amelia.ross@example.com',
      college: 'Yale',
      skills: ['Node.js', 'Express', 'MongoDB', 'TypeScript', 'GraphQL', 'JWT'],
      experienceYears: 2, status: 'Screening',
    },
    {
      name: 'Lucas White', email: 'lucas.white@example.com',
      college: 'Princeton',
      skills: ['Rust', 'PostgreSQL', 'Docker', 'Linux', 'gRPC'],
      experienceYears: 6, status: 'Applied',
    },
    {
      name: 'Harper Adams', email: 'harper.adams@example.com',
      college: 'Columbia',
      skills: ['Node.js', 'PostgreSQL', 'Prisma', 'TypeScript', 'Express', 'JWT', 'Swagger'],
      experienceYears: 3, status: 'Interview',
    },

    // ── Fullstack (8) ─────────────────────────────────────────
    {
      name: 'Logan Scott', email: 'logan.scott@example.com',
      college: 'Stanford University',
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Next.js', 'Tailwind', 'Prisma'],
      experienceYears: 5, status: 'Hired',
    },
    {
      name: 'Ella Turner', email: 'ella.turner@example.com',
      college: 'MIT',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express', 'CSS', 'HTML'],
      experienceYears: 3, status: 'Interview',
    },
    {
      name: 'Jackson Hill', email: 'jackson.hill@example.com',
      college: 'UC Berkeley',
      skills: ['Next.js', 'React', 'Node.js', 'Tailwind', 'PostgreSQL', 'Prisma', 'TypeScript'],
      experienceYears: 4, status: 'Screening',
    },
    {
      name: 'Scarlett Rivera', email: 'scarlett.rivera@example.com',
      college: 'Carnegie Mellon University',
      skills: ['React', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'CSS', 'HTML'],
      experienceYears: 4, status: 'Applied',
    },
    {
      name: 'Henry Cooper', email: 'henry.cooper@example.com',
      college: 'Georgia Tech',
      skills: ['Vue.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'Express', 'Docker'],
      experienceYears: 6, status: 'Hired',
    },
    {
      name: 'Madison Bailey', email: 'madison.bailey@example.com',
      college: 'Cornell University',
      skills: ['React', 'Node.js', 'TypeScript', 'Tailwind', 'PostgreSQL', 'GraphQL', 'REST APIs'],
      experienceYears: 2, status: 'Rejected',
    },
    {
      name: 'Sebastian Flores', email: 'sebastian.flores@example.com',
      college: 'University of Washington',
      skills: ['React', 'Express', 'Node.js', 'CSS', 'HTML', 'MongoDB', 'JavaScript'],
      experienceYears: 1, status: 'Applied',
    },
    {
      name: 'Avery Gonzalez', email: 'avery.gonzalez@example.com',
      college: 'UT Austin',
      skills: ['Next.js', 'React', 'Tailwind', 'Node.js', 'PostgreSQL', 'TypeScript', 'Prisma', 'CSS'],
      experienceYears: 5, status: 'Interview',
    },

    // ── Product Engineer (6) ──────────────────────────────────
    {
      name: 'Grace Nelson', email: 'grace.nelson@example.com',
      college: 'Stanford University',
      skills: ['React', 'Next.js', 'Node.js', 'Tailwind', 'PostgreSQL', 'Figma', 'Analytics'],
      experienceYears: 5, status: 'Interview',
    },
    {
      name: 'Elijah Carter', email: 'elijah.carter@example.com',
      college: 'MIT',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Product Thinking', 'Tailwind', 'TypeScript'],
      experienceYears: 4, status: 'Screening',
    },
    {
      name: 'Chloe Murphy', email: 'chloe.murphy@example.com',
      college: 'NYU',
      skills: ['React', 'Next.js', 'Tailwind', 'Node.js', 'PostgreSQL', 'Figma'],
      experienceYears: 3, status: 'Applied',
    },
    {
      name: 'Caleb Richardson', email: 'caleb.richardson@example.com',
      college: 'Columbia',
      skills: ['React', 'TypeScript', 'Node.js', 'Tailwind', 'PostgreSQL', 'REST APIs', 'Jira'],
      experienceYears: 6, status: 'Hired',
    },
    {
      name: 'Zoe Coleman', email: 'zoe.coleman@example.com',
      college: 'Harvard',
      skills: ['React', 'Next.js', 'Tailwind', 'Node.js', 'PostgreSQL', 'Analytics', 'CSS'],
      experienceYears: 2, status: 'Rejected',
    },
    {
      name: 'Ryan Hughes', email: 'ryan.hughes@example.com',
      college: 'Yale',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Next.js', 'Tailwind', 'TypeScript'],
      experienceYears: 4, status: 'Interview',
    },

    // ── DevOps (5) ────────────────────────────────────────────
    {
      name: 'Dylan Sanders', email: 'dylan.sanders@example.com',
      college: 'Georgia Tech',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Linux', 'CI/CD', 'Bash'],
      experienceYears: 6, status: 'Hired',
    },
    {
      name: 'Lily Patterson', email: 'lily.patterson@example.com',
      college: 'UIUC',
      skills: ['Docker', 'AWS', 'CI/CD', 'Linux', 'Ansible', 'Jenkins'],
      experienceYears: 4, status: 'Interview',
    },
    {
      name: 'Nathan Jenkins', email: 'nathan.jenkins@example.com',
      college: 'University of Michigan',
      skills: ['Kubernetes', 'Docker', 'GCP', 'Terraform', 'Linux', 'Helm', 'CI/CD'],
      experienceYears: 5, status: 'Screening',
    },
    {
      name: 'Penelope Cox', email: 'penelope.cox@example.com',
      college: 'University of Washington',
      skills: ['AWS', 'Docker', 'Linux', 'CI/CD', 'Python', 'Bash'],
      experienceYears: 3, status: 'Applied',
    },
    {
      name: 'Grayson Ward', email: 'grayson.ward@example.com',
      college: 'Carnegie Mellon University',
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Prometheus', 'Grafana'],
      experienceYears: 7, status: 'Hired',
    },

    // ── ML / Data (5) ─────────────────────────────────────────
    {
      name: 'Stella Morris', email: 'stella.morris@example.com',
      college: 'Stanford University',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'SQL', 'NumPy', 'Pandas'],
      experienceYears: 5, status: 'Hired',
    },
    {
      name: 'Owen Rogers', email: 'owen.rogers@example.com',
      college: 'MIT',
      skills: ['Python', 'PyTorch', 'scikit-learn', 'SQL', 'MLflow', 'Docker'],
      experienceYears: 4, status: 'Interview',
    },
    {
      name: 'Nora Long', email: 'nora.long@example.com',
      college: 'UC Berkeley',
      skills: ['Python', 'TensorFlow', 'Keras', 'SQL', 'NumPy', 'Pandas', 'Jupyter'],
      experienceYears: 3, status: 'Screening',
    },
    {
      name: 'Julian Foster', email: 'julian.foster@example.com',
      college: 'Harvard',
      skills: ['Python', 'scikit-learn', 'SQL', 'Pandas', 'R', 'Tableau'],
      experienceYears: 2, status: 'Applied',
    },
    {
      name: 'Vivian Peterson', email: 'vivian.peterson@example.com',
      college: 'Princeton',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'scikit-learn', 'SQL', 'Spark', 'Airflow', 'Docker'],
      experienceYears: 7, status: 'Hired',
    },
  ];

  const applicants = [];
  for (const data of applicantsData) {
    const applicant = await prisma.applicant.create({ data });
    applicants.push(applicant);
  }

  // Create Applications — each candidate applies to the most relevant job(s)
  console.log('Creating applications and match scores...');

  const applicationsMapping: { applicant: typeof applicants[0]; job: typeof jobs[0] }[] = [
    // Frontend (indices 0–7)
    { applicant: applicants[0],  job: frontendJob },
    { applicant: applicants[0],  job: productJob  },
    { applicant: applicants[1],  job: frontendJob },
    { applicant: applicants[2],  job: frontendJob },
    { applicant: applicants[3],  job: frontendJob },
    { applicant: applicants[3],  job: productJob  },
    { applicant: applicants[4],  job: frontendJob },
    { applicant: applicants[5],  job: frontendJob },
    { applicant: applicants[5],  job: productJob  },
    { applicant: applicants[6],  job: frontendJob },
    { applicant: applicants[7],  job: frontendJob },

    // Backend (indices 8–15)
    { applicant: applicants[8],  job: backendJob  },
    { applicant: applicants[9],  job: backendJob  },
    { applicant: applicants[10], job: backendJob  },
    { applicant: applicants[11], job: backendJob  },
    { applicant: applicants[12], job: backendJob  },
    { applicant: applicants[13], job: backendJob  },
    { applicant: applicants[14], job: backendJob  },
    { applicant: applicants[15], job: backendJob  },
    { applicant: applicants[15], job: productJob  },

    // Fullstack (indices 16–23)
    { applicant: applicants[16], job: productJob  },
    { applicant: applicants[16], job: backendJob  },
    { applicant: applicants[17], job: backendJob  },
    { applicant: applicants[17], job: frontendJob },
    { applicant: applicants[18], job: productJob  },
    { applicant: applicants[18], job: frontendJob },
    { applicant: applicants[19], job: backendJob  },
    { applicant: applicants[20], job: productJob  },
    { applicant: applicants[21], job: productJob  },
    { applicant: applicants[21], job: frontendJob },
    { applicant: applicants[22], job: backendJob  },
    { applicant: applicants[23], job: productJob  },
    { applicant: applicants[23], job: frontendJob },

    // Product Engineer (indices 24–29)
    { applicant: applicants[24], job: productJob  },
    { applicant: applicants[24], job: frontendJob },
    { applicant: applicants[25], job: productJob  },
    { applicant: applicants[25], job: backendJob  },
    { applicant: applicants[26], job: productJob  },
    { applicant: applicants[27], job: productJob  },
    { applicant: applicants[27], job: backendJob  },
    { applicant: applicants[28], job: productJob  },
    { applicant: applicants[29], job: productJob  },
    { applicant: applicants[29], job: frontendJob },

    // DevOps (indices 30–34)
    { applicant: applicants[30], job: devopsJob   },
    { applicant: applicants[31], job: devopsJob   },
    { applicant: applicants[32], job: devopsJob   },
    { applicant: applicants[33], job: devopsJob   },
    { applicant: applicants[34], job: devopsJob   },

    // ML (indices 35–39)
    { applicant: applicants[35], job: mlJob       },
    { applicant: applicants[36], job: mlJob       },
    { applicant: applicants[37], job: mlJob       },
    { applicant: applicants[38], job: mlJob       },
    { applicant: applicants[39], job: mlJob       },
  ];

  for (const mapping of applicationsMapping) {
    const applicantSkills = mapping.applicant.skills as string[];
    const requiredSkills  = mapping.job.requiredSkills as string[];
    const matchScore      = calculateMatchScore(applicantSkills, requiredSkills);

    await prisma.application.create({
      data: {
        applicantId: mapping.applicant.id,
        jobId:       mapping.job.id,
        matchScore,
      },
    });
  }

  console.log(`✅ Seeded ${applicantsData.length} candidates across 5 job roles.`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
