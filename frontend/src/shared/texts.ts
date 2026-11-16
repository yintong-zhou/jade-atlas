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
    previewTitle: 'Projects',
    previewAll: 'All projects',
    contactTitle: 'Write to me',
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
    cvLink: 'View my CV',
    body: "I'm a fullstack software developer based in Milan. I work on the Microsoft .NET stack: C#, ASP.NET MVC and Web API on the backend, Oracle and SQL Server for data, JavaScript on the frontend. Over the years I've connected enterprise applications to Salesforce, ServiceNow and Google APIs. My background is in systems and cybersecurity, and today I also build with AI tools such as Claude Code and Codex. I speak Italian, English and Mandarin Chinese, and as a volunteer I run the technical side of ICPN, an association that brings together a community connected to China and Italy.",
  },
  cv: {
    title: 'CV',
    experience: 'Experience',
    skills: 'Skills',
    education: 'Education',
    certifications: 'Certifications',
    present: 'Present',
    download: 'Download CV (PDF)',
    empty: 'Nothing published yet.',
  },
  footer: { github: 'GitHub', linkedin: 'LinkedIn', email: 'Email' },
  notFound: { title: 'Page not found', back: 'Back to home' },
  errors: { load: 'Could not load this content. Try again later.' },
} as const
