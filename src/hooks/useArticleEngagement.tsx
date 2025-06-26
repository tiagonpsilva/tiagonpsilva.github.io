import { useState } from 'react'
import { useInteractionTracking } from '../contexts/MixpanelContext'

interface ArticleEngagementData {
  slug: string
  title: string
  readTime: number
  tags: string[]
}

export const useArticleEngagement = (article: ArticleEngagementData | null) => {
  const { trackClick } = useInteractionTracking()
  const [engagementData] = useState({
    startTime: Date.now(),
    maxScrollDepth: 0,
    currentScrollDepth: 0,
    readingTime: 0,
    isReading: false,
    interactions: 0
  })

  // Track article interaction
  const trackInteraction = (interactionType: string, additionalData?: any) => {
    if (!article) return

    trackClick('Article Interaction', 'Article Page', {
      article_slug: article.slug,
      article_title: article.title,
      interaction_type: interactionType,
      ...additionalData
    })
  }

  return {
    engagementData,
    trackInteraction
  }
}