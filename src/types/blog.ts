export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  readTime: number
  tags: string[]
  slug: string
  linkedinUrl?: string
}

export interface ArticleFrontMatter {
  title: string
  excerpt: string
  publishedAt: string
  tags: string[]
  linkedinUrl?: string
}