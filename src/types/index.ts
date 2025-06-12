export interface Project {
  id: string
  title: string
  description: string
  longDescription?: string
  technologies: string[]
  imageUrl?: string
  demoUrl?: string
  githubUrl?: string
  featured: boolean
  category: 'web' | 'mobile' | 'fullstack' | 'leadership'
  year: number
  status: 'completed' | 'in_progress' | 'planned'
}

export interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate?: string
  description: string[]
  technologies: string[]
  achievements: string[]
  current: boolean
}

export interface Skill {
  name: string
  level: number
  category: 'frontend' | 'backend' | 'mobile' | 'devops' | 'leadership' | 'design'
  icon?: string
}

export interface ContactInfo {
  email: string
  phone?: string
  location: string
  linkedin: string
  github: string
  website?: string
}

export interface SocialLink {
  name: string
  url: string
  icon: string
}

export interface TestimonialType {
  id: string
  name: string
  position: string
  company: string
  content: string
  avatar?: string
  rating: number
}