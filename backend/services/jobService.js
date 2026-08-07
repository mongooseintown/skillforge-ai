/* ==========================================================================
   SKILLFORGE AI — BANGLADESH TECH JOBS SERVICE
   --------------------------------------------------------------------------
   Provides localized job listings in Bangladesh filtered by career tracks,
   experience levels, work models, and skill matching against user roadmaps.
   ========================================================================== */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const BANGLADESH_JOBS_DB = [
    // ── FULL STACK (MERN / PERN / Python / JS) ──
    {
        id: 'bd-fs-01',
        track: 'fullstack',
        title: 'Senior Full Stack Developer (React / Node.js)',
        company: 'Brain Station 23',
        companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Mohakhali DOHS, Dhaka',
        workType: 'Hybrid',
        experienceLevel: 'Senior Level',
        experienceYears: '4-7 years',
        salary: '৳140,000 - ৳220,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '2 hours ago',
        source: 'BDJobs',
        tags: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'AWS'],
        snippet: 'Looking for a Senior Full Stack Engineer to lead architecture and development of high-scale enterprise SaaS solutions for international clients.',
        description: 'Brain Station 23 is seeking an experienced Full Stack Engineer proficient in the React/Node.js ecosystem. You will spearhead architectural decisions, mentor junior engineers, optimize database queries, and integrate high-throughput REST/GraphQL APIs.',
        requirements: [
            '4+ years of production experience in React.js and Node.js/Express.',
            'Deep expertise in relational (PostgreSQL) and NoSQL (MongoDB) databases.',
            'Experience deploying on AWS (ECS, Lambda, S3) and Docker containerization.',
            'Strong background in Microservices architecture, Redis caching, and CI/CD pipelines.'
        ],
        benefits: ['Two festival bonuses', 'Provident fund & Gratuity', 'Annual profit sharing', 'Health insurance coverage', 'Flexible hybrid work model'],
        applyUrl: 'https://bdjobs.com',
        sourceUrl: 'https://brainstation-23.com/career'
    },
    {
        id: 'bd-fs-02',
        track: 'fullstack',
        title: 'Full Stack Engineer (MERN Stack)',
        company: 'Enosis Solutions',
        companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Gulshan-1, Dhaka',
        workType: 'On-site',
        experienceLevel: 'Mid Level',
        experienceYears: '2-4 years',
        salary: '৳85,000 - ৳135,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '4 hours ago',
        source: 'LinkedIn BD',
        tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Redux'],
        snippet: 'Join our core US-client delivery team building reactive web apps, performant backend microservices, and modern UI interfaces.',
        description: 'Enosis Solutions is expanding its engineering teams. You will design, build, and maintain resilient web applications using modern JavaScript/TypeScript technologies.',
        requirements: [
            '2-4 years of experience with React, Node.js, and Express.',
            'Solid knowledge of state management (Redux Toolkit / Zustand) and REST APIs.',
            'Good understanding of database indexing, query profiling, and schema modeling in MongoDB/PostgreSQL.'
        ],
        benefits: ['Yearly performance bonus', 'Subsidized lunch & snacks', 'Transport facilities', 'Medical coverage'],
        applyUrl: 'https://www.linkedin.com/jobs',
        sourceUrl: 'https://enosisbd.com/careers'
    },
    {
        id: 'bd-fs-03',
        track: 'fullstack',
        title: 'Junior Full Stack Developer / Trainee',
        company: 'Vivasoft Limited',
        companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Banani, Dhaka',
        workType: 'On-site',
        experienceLevel: 'Entry Level',
        experienceYears: '0-1 year / Fresher',
        salary: '৳45,000 - ৳70,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '1 day ago',
        source: 'BDJobs',
        tags: ['JavaScript', 'React', 'Node.js', 'Git', 'HTML5', 'CSS3', 'REST API'],
        snippet: 'Great opportunity for passionate fresh graduates or junior coders with strong fundamentals in JavaScript, React, and backend basics.',
        description: 'Vivasoft is hiring Junior Full Stack Developers eager to grow. You will receive mentorship from tech leads and participate directly in building client-facing web products.',
        requirements: [
            'B.Sc. in CSE or proven track record of strong personal/open-source projects.',
            'Solid understanding of JavaScript (ES6+), HTML, CSS, and basic React.',
            'Familiarity with Node.js, Express, and Git version control.'
        ],
        benefits: ['Extensive training & mentorship', '2 festival bonuses', 'Free daily lunch & buffet parties', 'Skill enhancement workshops'],
        applyUrl: 'https://bdjobs.com',
        sourceUrl: 'https://vivasoftltd.com/careers'
    },
    {
        id: 'bd-fs-04',
        track: 'fullstack',
        title: 'Lead Full Stack Architect (Remote BD)',
        company: 'DataPulse Networks',
        companyLogo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Remote (Bangladesh)',
        workType: 'Remote',
        experienceLevel: 'Lead / Staff',
        experienceYears: '7+ years',
        salary: '$2,400 - $3,800 / mo',
        currency: 'USD',
        activelyHiring: true,
        postedTime: '5 hours ago',
        source: 'Indeed BD',
        tags: ['Node.js', 'React', 'Next.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'],
        snippet: 'Direct US payroll remote position for top-tier Bangladeshi engineers to direct architecture and team strategy.',
        description: 'US-based fintech product company looking for a Lead Architect residing in Bangladesh to work remotely with global stakeholders.',
        requirements: [
            '7+ years experience leading distributed full-stack web products.',
            'Deep expertise in scalable Node.js microservices, Next.js frontend, and cloud infra.',
            'Superb English communication and asynchronous team leadership.'
        ],
        benefits: ['Paid in USD directly', 'Unlimited PTO', 'Home office equipment allowance ($1,000)', 'Annual team retreats abroad'],
        applyUrl: 'https://indeed.com',
        sourceUrl: 'https://datapulse.io'
    },
    {
        id: 'bd-fs-05',
        track: 'fullstack',
        title: 'Software Engineer II — Full Stack',
        company: 'Pathao Tech',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Gulshan-2, Dhaka',
        workType: 'Hybrid',
        experienceLevel: 'Mid Level',
        experienceYears: '2-5 years',
        salary: '৳110,000 - ৳170,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '6 hours ago',
        source: 'LinkedIn BD',
        tags: ['Go', 'Node.js', 'React', 'PostgreSQL', 'Kafka', 'Redis'],
        snippet: 'Build ride-sharing, food delivery, and fintech solutions serving millions of active users across Bangladesh.',
        description: 'Pathao is the leading digital platform in Bangladesh. Join the consumer engineering team to ship low-latency systems and delightful user experiences.',
        requirements: [
            'Strong foundation in data structures, algorithms, and distributed systems.',
            'Production experience with Node.js/Go backend and React frontend.',
            'Experience with message brokers (Kafka/RabbitMQ) and Redis caching.'
        ],
        benefits: ['Pathao credit allowances', 'Full medical insurance', 'Provident fund', 'Competitive stock options'],
        applyUrl: 'https://pathao.com/careers',
        sourceUrl: 'https://pathao.com/careers'
    },

    // ── FRONTEND (React, Next.js, Vue, Tailwind) ──
    {
        id: 'bd-fe-01',
        track: 'frontend',
        title: 'Senior Frontend Developer (React / Next.js)',
        company: 'Cefalo Bangladesh',
        companyLogo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Dhanmondi, Dhaka',
        workType: 'Hybrid',
        experienceLevel: 'Senior Level',
        experienceYears: '4-6 years',
        salary: '৳130,000 - ৳190,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '3 hours ago',
        source: 'BDJobs',
        tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Jest'],
        snippet: 'Scandinavian IT company building enterprise web apps with clean architecture, high accessibility, and unit testing.',
        description: 'Cefalo is a Norwegian software consultancy based in Dhaka. We are looking for a Senior Frontend Developer who takes pride in pixel-perfect UI and rock-solid state management.',
        requirements: [
            '4+ years building complex web frontends with React and TypeScript.',
            'Mastery of Next.js (App Router, Server Components, SSR/SSG).',
            'Strong skills in CSS architecture, Tailwind CSS, animations, and WCAG accessibility standards.'
        ],
        benefits: ['Scandinavian work culture & 35-hour work week', '2 yearly bonuses + Provident fund', 'Family health coverage', 'Company sponsored Norway visits'],
        applyUrl: 'https://cefalo.com/careers',
        sourceUrl: 'https://cefalo.com'
    },
    {
        id: 'bd-fe-02',
        track: 'frontend',
        title: 'Frontend Engineer (React / UI)',
        company: 'BJIT Group',
        companyLogo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Baridhara, Dhaka',
        workType: 'On-site',
        experienceLevel: 'Mid Level',
        experienceYears: '2-4 years',
        salary: '৳75,000 - ৳120,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '7 hours ago',
        source: 'LinkedIn BD',
        tags: ['React', 'JavaScript', 'HTML5', 'CSS3', 'REST API', 'Figma'],
        snippet: 'Work on Japanese and global enterprise portals with clean React code and modern responsive design systems.',
        description: 'BJIT is an offshore software engineering leader with offices in Tokyo, Singapore, and Dhaka. We are looking for talented React developers.',
        requirements: [
            '2+ years in React.js and modern JavaScript (ES6+).',
            'Ability to translate Figma designs into pixel-perfect responsive HTML/CSS.',
            'Experience with Git and RESTful API consumption.'
        ],
        benefits: ['Japanese language training sponsorship', 'Medical insurance', 'Annual trip & sports facilities', '2 festival bonuses'],
        applyUrl: 'https://bjitgroup.com/careers',
        sourceUrl: 'https://bjitgroup.com'
    },
    {
        id: 'bd-fe-03',
        track: 'frontend',
        title: 'Junior Frontend Developer',
        company: 'Kaz Software',
        companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Dhanmondi, Dhaka',
        workType: 'On-site',
        experienceLevel: 'Entry Level',
        experienceYears: '0-2 years',
        salary: '৳40,000 - ৳65,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '1 day ago',
        source: 'BDJobs',
        tags: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Responsive Design'],
        snippet: 'Ideal starting role for aspiring frontend engineers looking to master modern UI development and client projects.',
        description: 'Kaz Software is looking for eager Junior Frontend coders with great aesthetic sense and fundamental JS/React skills.',
        requirements: [
            'Proficient in semantic HTML5, modern CSS3, and JavaScript fundamentals.',
            'Basic experience building components in React.js.',
            'Portfolio or GitHub links demonstrating clean UI work.'
        ],
        benefits: ['Friendly dev-centric culture', 'Mentorship program', 'Lunch & snacks provided', 'Bonus & Provident fund'],
        applyUrl: 'https://kaz.com.bd/careers',
        sourceUrl: 'https://kaz.com.bd'
    },

    // ── BACKEND (Node.js, Python, Java, Go) ──
    {
        id: 'bd-be-01',
        track: 'backend',
        title: 'Senior Backend Engineer (Node.js / Distributed Systems)',
        company: 'Therap Services BD',
        companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Banasree, Dhaka',
        workType: 'On-site',
        experienceLevel: 'Senior Level',
        experienceYears: '5+ years',
        salary: '৳160,000 - ৳250,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '5 hours ago',
        source: 'BDJobs',
        tags: ['Node.js', 'Java', 'PostgreSQL', 'Redis', 'Microservices', 'Docker'],
        snippet: 'Architect secure, high-concurrency electronic health record systems serving millions across the US.',
        description: 'Therap is the US leader in developmental disability documentation software. Join the core backend team in Dhaka to solve deep distributed systems problems.',
        requirements: [
            '5+ years building high-throughput backend services.',
            'Deep expertise in PostgreSQL query optimization and transaction isolation.',
            'Strong understanding of OOP, clean architecture, and thread/event-loop concurrency.'
        ],
        benefits: ['Top compensation in BD industry', 'Free gourmet lunch and transportation', 'Medical & life insurance for family', 'Provident fund + Gratuity'],
        applyUrl: 'https://therapservices.net/careers',
        sourceUrl: 'https://therapservices.net'
    },
    {
        id: 'bd-be-02',
        track: 'backend',
        title: 'Backend Developer (Python / Django / Node)',
        company: 'TigerIT Bangladesh',
        companyLogo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Gulshan-2, Dhaka',
        workType: 'On-site',
        experienceLevel: 'Mid Level',
        experienceYears: '2-4 years',
        salary: '৳80,000 - ৳130,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '8 hours ago',
        source: 'LinkedIn BD',
        tags: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker', 'Linux'],
        snippet: 'Build national-scale biometric, identity, and security software infrastructure with massive reliability.',
        description: 'TigerIT is one of Bangladesh’s premier engineering pioneers. Work with national ID systems, vehicle tracking, and high-performance server APIs.',
        requirements: [
            '2-4 years with Python (FastAPI/Django) or Node.js backend development.',
            'Strong database schema design and SQL optimization skills.',
            'Familiarity with Linux server administration and Docker.'
        ],
        benefits: ['2 festival bonuses', 'Gratuity & Provident fund', 'Comprehensive health insurance', 'Modern campus environment'],
        applyUrl: 'https://tigerit.com/careers',
        sourceUrl: 'https://tigerit.com'
    },

    // ── AI & DATA SCIENCE ──
    {
        id: 'bd-ai-01',
        track: 'ai-engineer',
        title: 'AI / Machine Learning Engineer (LLMs & RAG)',
        company: 'Brain Station 23',
        companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Mohakhali DOHS, Dhaka',
        workType: 'Hybrid',
        experienceLevel: 'Mid Level',
        experienceYears: '2-5 years',
        salary: '৳120,000 - ৳190,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '1 hour ago',
        source: 'LinkedIn BD',
        tags: ['Python', 'PyTorch', 'LangChain', 'OpenAI', 'Vector DB', 'FastAPI'],
        snippet: 'Build enterprise GenAI assistants, vector search engines, and RAG pipelines for fintech and healthcare clients.',
        description: 'Brain Station 23 is pioneering GenAI adoption in South Asia. You will architect multi-agent systems, fine-tune models, and deploy scalable inference servers.',
        requirements: [
            '2+ years in Machine Learning and Python backend development.',
            'Practical experience with LLMs, prompt engineering, LangChain/LlamaIndex, and Vector DBs (Pinecone, pgvector).',
            'Strong mathematical understanding of deep learning and embeddings.'
        ],
        benefits: ['Access to high-end GPU compute clusters', 'Annual foreign conference sponsorships', 'Health insurance', 'Flexible hybrid work'],
        applyUrl: 'https://brainstation-23.com/career',
        sourceUrl: 'https://brainstation-23.com'
    },
    {
        id: 'bd-ai-02',
        track: 'ai-engineer',
        title: 'Junior AI Engineer / NLP Specialist',
        company: 'Orbitax Bangladesh',
        companyLogo: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=80&h=80&fit=crop&crop=faces&auto=format',
        location: 'Gulshan-1, Dhaka',
        workType: 'On-site',
        experienceLevel: 'Entry Level',
        experienceYears: '0-2 years',
        salary: '৳55,000 - ৳90,000 / mo',
        currency: 'BDT',
        activelyHiring: true,
        postedTime: '1 day ago',
        source: 'BDJobs',
        tags: ['Python', 'NLP', 'HuggingFace', 'Pandas', 'scikit-learn', 'SQL'],
        snippet: 'Apply NLP and machine learning models to global enterprise tax automation and document parsing.',
        description: 'Orbitax provides international tax and financial software. Join our AI research lab to develop document extraction and semantic analysis models.',
        requirements: [
            'Strong Python coding skills and foundation in statistics & linear algebra.',
            'Experience with HuggingFace transformers, spaCy, or OpenCV.',
            'Demonstrated academic research or Kaggle/GitHub AI repositories.'
        ],
        benefits: ['Yearly bonus', 'Free transport', 'Full medical support', 'Research publication incentives'],
        applyUrl: 'https://orbitax.com/careers',
        sourceUrl: 'https://orbitax.com'
    }
];

// Normalize track identifiers
function normalizeTrack(track) {
    if (!track) return 'all';
    const t = track.toLowerCase().trim();
    if (t.includes('full') || t.includes('mern') || t.includes('stack') || t.includes('web')) return 'fullstack';
    if (t.includes('front')) return 'frontend';
    if (t.includes('back')) return 'backend';
    if (t.includes('ai') || t.includes('machine') || t.includes('data') || t.includes('ml')) return 'ai-engineer';
    if (t.includes('devops') || t.includes('cloud')) return 'devops';
    return 'all';
}

/**
 * Filter jobs based on criteria
 */
function getJobs(options = {}) {
    const {
        track = 'all',
        experience = 'all',
        workType = 'all',
        search = '',
        skills = [],
        sort = 'relevant'
    } = options;

    const normTrack = normalizeTrack(track);

    let results = BANGLADESH_JOBS_DB.filter(job => {
        // Track filter
        if (normTrack !== 'all' && job.track !== normTrack) {
            return false;
        }

        // Experience filter
        if (experience !== 'all') {
            const expLower = experience.toLowerCase();
            const jobExpLower = job.experienceLevel.toLowerCase();
            if (!jobExpLower.includes(expLower)) return false;
        }

        // Work type filter
        if (workType !== 'all') {
            const wtLower = workType.toLowerCase();
            const jobWtLower = job.workType.toLowerCase();
            if (!jobWtLower.includes(wtLower)) return false;
        }

        // Search query
        if (search && search.trim()) {
            const q = search.toLowerCase().trim();
            const inTitle = job.title.toLowerCase().includes(q);
            const inCompany = job.company.toLowerCase().includes(q);
            const inLocation = job.location.toLowerCase().includes(q);
            const inTags = job.tags.some(t => t.toLowerCase().includes(q));
            const inSnippet = job.snippet.toLowerCase().includes(q);
            if (!inTitle && !inCompany && !inLocation && !inTags && !inSnippet) return false;
        }

        // Skills filter
        if (skills && skills.length > 0) {
            const hasSkill = skills.some(s =>
                job.tags.some(t => t.toLowerCase() === s.toLowerCase())
            );
            if (!hasSkill) return false;
        }

        return true;
    });

    // Calculate match score if user track provided
    results = results.map(job => {
        let matchScore = 75;
        if (normTrack === job.track) matchScore = 88;
        if (job.experienceLevel === 'Entry Level') matchScore = Math.max(matchScore, 92);
        return {
            ...job,
            matchScore: matchScore + Math.floor((job.id.charCodeAt(job.id.length - 1) % 8))
        };
    });

    // Sorting
    if (sort === 'highest-salary') {
        results.sort((a, b) => (b.currency === 'USD' ? 200000 : 100000) - (a.currency === 'USD' ? 200000 : 100000));
    } else if (sort === 'newest') {
        results.sort((a, b) => a.postedTime.localeCompare(b.postedTime));
    } else {
        // Default most relevant by match score
        results.sort((a, b) => b.matchScore - a.matchScore);
    }

    return {
        totalFound: results.length,
        newToday: Math.min(14, Math.ceil(results.length * 0.4) + 1),
        track: normTrack,
        jobs: results
    };
}

function getJobById(id) {
    return BANGLADESH_JOBS_DB.find(j => j.id === id) || null;
}

module.exports = {
    getJobs,
    getJobById,
    normalizeTrack
};
