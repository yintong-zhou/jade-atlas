import type { PublicContent } from './types'

// Temporary static CV content, shipped in the build (public CV data only). Phase 4: the API and the CV seed replace it and this file goes away.
export const sampleData: PublicContent = {
  experiences: [
    {
      id: 1,
      skills: ['C#', 'ASP.NET MVC', 'Web API', 'Oracle', 'JavaScript', 'PL/SQL', 'HTML', 'CSS', 'Bootstrap', 'jQuery', 'PostgreSQL', 'IIS', 'ADFS'],
      role: 'Software Developer',
      company: 'Sirti S.p.A.',
      location: 'Milan',
      startDate: '2023-05-01',
      endDate: null,
      description:
        "Took company-wide Single Sign-On with ADFS (WS-Federation) from proof of concept to production across 10+ intranet and extranet web apps, used daily by thousands of employees and partners. Solved cookie persistence and invalidation in-house, without Microsoft consulting.\nBuilt RESTful APIs in C# and ASP.NET that send company data to external services when a scheduler calls them: about 1,500-2,000 requests a day.\nReplaced the manual printing, signing and scanning of transport documents (DDT) with a mobile-friendly web app where warehouses and couriers view, sign, email and archive them.\nAutomated job changes for the HR department, which manages all internal employees: a request opened in an external service reaches Oracle through the API, and the web app generates a document with the employee's data and the company training completed for the new role.\nPorted 38 company web apps from x86 to x64 on IIS and, for some of them, migrated VB.NET to ASP.NET C# or WebForms to ASP.NET MVC.\nBuilt the front end of an internal application that manages anomalies for customers and partners, used by about 1,100 people, including Service Work Order features for field operations through an external API (Field Service Management).",
    },
    {
      id: 2,
      skills: ['Website management', 'React', 'Vite', 'TypeScript', 'Claude Code', 'Codex', 'AI agents'],
      role: 'IT Manager (volunteer)',
      company: 'ICPN, non-profit association',
      location: 'Milan',
      startDate: '2019-03-01',
      endDate: null,
      description:
        'Run the icpn.it website and the technical tasks of the association.\nBuild every project with Claude Code and Codex, using skills and AI agents.',
    },
    {
      id: 3,
      skills: ['C#', 'ASP.NET MVC', 'WebForms', 'Console Applications', 'SQL Server', 'PostgreSQL', 'Windows Server', 'VoIP', 'VMware'],
      role: 'Software Developer / IT Technician',
      company: 'ML Sistemi',
      location: 'Monza',
      startDate: '2018-04-01',
      endDate: '2023-05-01',
      description:
        'Backend development in C# .NET with ASP.NET MVC and WebForms, on SQL Server and PostgreSQL databases.\nDeveloped background services and console applications in C#.\nInstalled, configured and managed Windows Server environments (2008-2019) for Redbox VoIP recording systems.\nManaged VMware infrastructure.',
    },
    {
      id: 4,
      skills: ['C#', '.NET', 'Wireshark', 'VoIP'],
      role: 'Software Developer Intern',
      company: 'ML Sistemi',
      location: 'Monza',
      startDate: '2017-09-01',
      endDate: '2018-04-01',
      description:
        'C# .NET development on enterprise backend applications, plus network analysis with Wireshark and Redbox VoIP systems.',
    },
  ],
  skills: [
    {
      id: 1,
      category: 'Programming languages',
      name: 'C#',
    },
    {
      id: 2,
      category: 'Programming languages',
      name: 'SQL',
    },
    {
      id: 3,
      category: 'Programming languages',
      name: 'PL/SQL',
    },
    {
      id: 4,
      category: 'Programming languages',
      name: 'JavaScript',
    },
    {
      id: 5,
      category: 'Programming languages',
      name: 'HTML',
    },
    {
      id: 6,
      category: 'Programming languages',
      name: 'CSS',
    },
    {
      id: 7,
      category: 'Backend',
      name: '.NET Framework 4.x',
    },
    {
      id: 8,
      category: 'Backend',
      name: 'ASP.NET MVC',
    },
    {
      id: 9,
      category: 'Backend',
      name: 'ASP.NET Web API',
    },
    {
      id: 10,
      category: 'Backend',
      name: 'REST API',
    },
    {
      id: 11,
      category: 'Backend',
      name: 'ASP.NET WebForms',
    },
    {
      id: 12,
      category: 'Backend',
      name: 'Entity Framework',
    },
    {
      id: 13,
      category: 'Backend',
      name: 'LINQ',
    },
    {
      id: 14,
      category: 'Backend',
      name: 'Console applications',
    },
    {
      id: 15,
      category: 'Backend',
      name: 'Background services',
    },
    {
      id: 16,
      category: 'Frontend',
      name: 'HTML',
    },
    {
      id: 17,
      category: 'Frontend',
      name: 'CSS',
    },
    {
      id: 18,
      category: 'Frontend',
      name: 'JavaScript',
    },
    {
      id: 19,
      category: 'Frontend',
      name: 'jQuery',
    },
    {
      id: 20,
      category: 'Frontend',
      name: 'Bootstrap',
    },
    {
      id: 21,
      category: 'Integrations',
      name: 'external services',
    },
    {
      id: 22,
      category: 'Integrations',
      name: 'Salesforce API',
    },
    {
      id: 23,
      category: 'Integrations',
      name: 'ServiceNow API',
    },
    {
      id: 24,
      category: 'Integrations',
      name: 'Google API',
    },
    {
      id: 25,
      category: 'AI-assisted development',
      name: 'Claude Code',
    },
    {
      id: 26,
      category: 'AI-assisted development',
      name: 'OpenAI Codex',
    },
    {
      id: 27,
      category: 'AI-assisted development',
      name: 'Skills',
    },
    {
      id: 28,
      category: 'AI-assisted development',
      name: 'AI agents',
    },
    {
      id: 29,
      category: 'Databases',
      name: 'Oracle PL/SQL',
    },
    {
      id: 30,
      category: 'Databases',
      name: 'Microsoft SQL Server',
    },
    {
      id: 31,
      category: 'Databases',
      name: 'PostgreSQL',
    },
    {
      id: 32,
      category: 'Tools',
      name: 'Visual Studio',
    },
    {
      id: 33,
      category: 'Tools',
      name: 'Git',
    },
    {
      id: 34,
      category: 'Tools',
      name: 'GitHub',
    },
    {
      id: 35,
      category: 'Tools',
      name: 'Azure DevOps',
    },
    {
      id: 36,
      category: 'Tools',
      name: 'IIS',
    },
    {
      id: 37,
      category: 'Authentication',
      name: 'Single Sign-On (SSO)',
    },
    {
      id: 38,
      category: 'Authentication',
      name: 'ADFS',
    },
    {
      id: 39,
      category: 'Authentication',
      name: 'WS-Federation',
    },
    {
      id: 40,
      category: 'Authentication',
      name: 'Active Directory',
    },
    {
      id: 41,
      category: 'Systems and infrastructure',
      name: 'Windows Server 2008-2019',
    },
    {
      id: 42,
      category: 'Systems and infrastructure',
      name: 'VMware',
    },
    {
      id: 43,
      category: 'Systems and infrastructure',
      name: 'VoIP (Redbox)',
    },
    {
      id: 44,
      category: 'Networking and security',
      name: 'Network protocols',
    },
    {
      id: 45,
      category: 'Networking and security',
      name: 'Routing and switching',
    },
    {
      id: 46,
      category: 'Networking and security',
      name: 'Wireshark',
    },
    {
      id: 47,
      category: 'Networking and security',
      name: 'Information security',
    },
  ],
  education: [
    {
      id: 1,
      type: 'certification',
      title: 'Professional specialization course in Cyber Security',
      institution: 'Volta Institute, Computer Science Specialization',
      year: 2022,
      qualifications: [
        { title: 'Cisco CCNA Routing & Switching course', institution: 'Volta Institute' },
        { title: 'CompTIA Security+', institution: 'CompTIA' },
        { title: 'EC-Council Ethical Hacking Associate', institution: 'EC-Council' },
      ],
    },
    {
      id: 3,
      type: 'education',
      title: 'Diploma in Business Information Systems (SIA)',
      institution: 'IIS Enrico De Nicola',
      year: 2017,
    },
  ],
}
