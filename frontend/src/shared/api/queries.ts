import { useQuery } from '@tanstack/react-query'
import { publicApi } from './publicApi'

export const useProjects = () => useQuery({ queryKey: ['public', 'projects'], queryFn: () => publicApi.getProjects() })

export const useProject = (slug: string) =>
  useQuery({ queryKey: ['public', 'projects', slug], queryFn: () => publicApi.getProject(slug) })

export const useExperiences = () =>
  useQuery({ queryKey: ['public', 'experiences'], queryFn: () => publicApi.getExperiences() })

export const useSkills = () => useQuery({ queryKey: ['public', 'skills'], queryFn: () => publicApi.getSkills() })

export const useEducation = () => useQuery({ queryKey: ['public', 'education'], queryFn: () => publicApi.getEducation() })
