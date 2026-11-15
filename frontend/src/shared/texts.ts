// Every fixed interface text and the site copy. Copy comes verbatim from PROFILE.md.
export const texts = {
  owner: { name: 'Yintong Zhou', role: 'Fullstack .NET Software Developer', location: 'Milan' },
  nav: { projects: 'Projects', cv: 'CV', about: 'About', skip: 'Skip to content' },
  home: {
    title: 'Yintong Zhou. Fullstack .NET Software Developer.',
    subtitle:
      "For over 8 years I've been building enterprise web applications with C#, ASP.NET and Oracle, used every day by thousands of people.",
    seeProjects: 'See projects',
    readCv: 'Read my CV',
    scrollHint: 'Scroll',
    numbers: [
      { value: 8, suffix: '+', label: 'years of experience' },
      { value: 38, suffix: '', label: 'web apps migrated' },
      { value: 10, suffix: '+', label: 'applications under Single Sign-On' },
    ],
    previewTitle: 'Projects',
    previewAll: 'All projects',
    contactTitle: 'Get in touch',
  },
  projects: {
    title: 'Projects',
    empty: 'No projects published yet.',
    repo: 'Repository',
    site: 'Website',
    back: 'All projects',
    coverAlt: (title: string) => `Cover image of ${title}`,
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
  about: {
    title: 'About',
    body: "I'm a fullstack software developer based in Milan. I work on the Microsoft .NET stack: C#, ASP.NET MVC and Web API on the backend, Oracle and SQL Server for data, JavaScript on the frontend. Over the years I've connected enterprise applications to Salesforce, ServiceNow and Google APIs. My background is in systems and cybersecurity, and today I also build with AI tools such as Claude Code and Codex. I speak Italian, English and Mandarin Chinese, and as a volunteer I run the technical side of ICPN, an association that brings together a community connected to China and Italy.",
  },
  footer: { github: 'GitHub', linkedin: 'LinkedIn', email: 'Email' },
  notFound: { title: 'Page not found', back: 'Back to home' },
  errors: { load: 'Could not load this content. Try again later.' },
} as const
