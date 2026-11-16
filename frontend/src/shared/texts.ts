// Every fixed interface text and the site copy. Copy comes verbatim from PROFILE.md.
export const texts = {
  owner: { name: 'Yintong Zhou', role: 'Fullstack .NET Software Developer', location: 'Milan' },
  nav: { projects: 'Projects', about: 'About', skip: 'Skip to content' },
  home: {
    title: 'I build enterprise web apps & services in .NET',
    subtitle:
      'Thousands of people use them every day. I write the C# and ASP.NET backend, the SQL data layer and the JavaScript front end, then connect it all to external services.',
    seeProjects: 'See projects',
    readCv: 'Read my CV',
    scrollHint: 'Drag to turn it · Scroll to dive in',
    numbers: [
      { value: 8, suffix: '+', label: 'years building enterprise apps' },
      { value: 38, suffix: '', label: 'web apps migrated' },
      { value: 10, suffix: '+', label: 'apps moved to Single Sign-On' },
    ],
    stackTitle: 'The stack, and what it connects to',
    stack: {
      frontEnd: { label: 'Front end', detail: 'JavaScript' },
      backend: { label: 'Backend', detail: 'C#, ASP.NET MVC, Web API' },
      data: { label: 'Data', items: ['Oracle', 'SQL Server'] },
      services: { label: 'External services', items: ['Salesforce', 'ServiceNow', 'Google APIs'] },
      summary:
        'The JavaScript front end calls the C# backend, which reads Oracle and SQL Server and connects to Salesforce, ServiceNow and Google APIs.',
    },
    previewTitle: 'Projects',
    previewAll: 'See all projects',
  },
  closing: {
    title: 'Write to me',
    line: "I'm based in Milan. Write in Italian, English or Mandarin Chinese.",
    action: 'Email me',
  },
  projects: {
    title: 'Projects',
    empty: 'No projects published yet.',
    repo: 'Repository',
    site: 'Website',
    back: 'All projects',
    coverAlt: (title: string) => `Cover image of ${title}`,
  },
  about: {
    title: 'About',
    heading: 'Fullstack .NET software developer in Milan',
    paragraphs: [
      "I'm a fullstack developer based in Milan. I've been building and maintaining enterprise web applications for 8+ years on the Microsoft .NET stack: C#, ASP.NET MVC and Web API on the backend, Oracle and SQL Server for data, JavaScript on the front end.",
      'My background is in systems, networking and cybersecurity: Windows Server, VMware, VoIP and a CompTIA Security+ certification. Day to day I write the backend and connect enterprise apps to Salesforce, ServiceNow and Google APIs.',
      "I also build with AI tools, mainly Claude Code and Codex, with skills and agents. As a volunteer I'm IT manager at ICPN, an association that brings together a community connected to China and Italy: I run its website and its technical work.",
    ],
    facts: {
      basedInLabel: 'Based in',
      basedIn: 'Milan',
      languagesLabel: 'Languages',
      languages: ['Italian, native', 'English, B2', 'Mandarin Chinese, C1 speaking, B1 writing'],
    },
    cvLink: 'View my CV',
  },
  cv: {
    experience: 'Experience',
    skills: 'Skills',
    education: 'Education',
    certifications: 'Certifications',
    educationAndCertifications: 'Education and certifications',
    present: 'Present',
    download: 'Download CV (PDF)',
    empty: 'Nothing published yet.',
  },
  footer: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    email: 'Email',
    trademarks: 'Product names and logos are trademarks of their owners.',
  },
  notFound: { title: 'Page not found', back: 'Back to home' },
  errors: { load: 'Could not load this content. Try again later.' },
} as const
