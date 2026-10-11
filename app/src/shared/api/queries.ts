import { useQuery } from '@tanstack/react-query'
import { endpoints } from './endpoints'

export const qk = {
  me: ['me'] as const,
  settings: ['settings'] as const,
  feed: (tab: string) => ['feed', tab] as const,
  works: (q: string, category: string) => ['works', q, category] as const,
  work: (id: string) => ['work', id] as const,
  saved: ['saved'] as const,
  user: (handle: string) => ['user', handle] as const,
  userWorks: (handle: string) => ['userWorks', handle] as const,
  userProjects: (handle: string) => ['projects', 'user', handle] as const,
  userCollection: (handle: string) => ['userWorks', 'collection', handle] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  eligibility: ['projects', 'eligibility'] as const,
  backings: ['projects', 'backings'] as const,
  orders: (role: string) => ['orders', role] as const,
  addOns: ['addOns'] as const,
  pricing: ['pricing'] as const,
  reviews: ['admin', 'reviews'] as const,
  review: (id: string) => ['admin', 'review', id] as const,
  reviewLogs: (id: string) => ['admin', 'logs', id] as const,
  adminSettings: ['admin', 'settings'] as const,
}

export const useMe = () => useQuery({ queryKey: qk.me, queryFn: endpoints.me, staleTime: 60_000 })
export const useSettings = () => useQuery({ queryKey: qk.settings, queryFn: endpoints.settings, staleTime: 60_000 })
