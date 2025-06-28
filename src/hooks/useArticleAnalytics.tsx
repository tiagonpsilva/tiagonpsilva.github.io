import { useEffect, useRef, useState } from 'react'
import { useMixpanel } from '@/contexts/MixpanelContext'
import type { Article } from '@/types/blog'

interface ArticleAnalyticsOptions {
  article: Article
  contentRef?: React.RefObject<HTMLElement>
}

interface ReadingProgress {
  scrollDepth: number
  timeOnPage: number
  isReading: boolean
  hasFinished: boolean
}

export const useArticleAnalytics = ({ article, contentRef }: ArticleAnalyticsOptions) => {
  const { track } = useMixpanel()
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>({
    scrollDepth: 0,
    timeOnPage: 0,
    isReading: false,
    hasFinished: false
  })
  
  const startTime = useRef<number>(Date.now())
  const lastScrollTime = useRef<number>(Date.now())
  const hasTrackedStart = useRef<boolean>(false)
  const hasTrackedMidpoint = useRef<boolean>(false)
  const hasTrackedFinish = useRef<boolean>(false)
  const scrollDepthMilestones = useRef<Set<number>>(new Set())

  // Track article start
  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true
      startTime.current = Date.now()
      
      track('Article Started', {
        article_id: article.id,
        article_title: article.title,
        article_slug: article.id,
        word_count: estimateWordCount(article.content || ''),
        reading_time: article.readTime,
        tags: article.tags,
        published_date: article.publishedAt,
        start_timestamp: new Date().toISOString()
      })
    }
  }, [article, track])

  // Track scroll depth and reading progress
  useEffect(() => {
    if (!contentRef?.current) return

    const handleScroll = () => {
      const element = contentRef.current
      if (!element) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const elementTop = element.offsetTop
      const elementHeight = element.scrollHeight
      const windowHeight = window.innerHeight
      
      // Calculate scroll depth percentage
      const scrollDepth = Math.min(
        100,
        Math.max(0, (scrollTop - elementTop + windowHeight) / elementHeight * 100)
      )
      
      const now = Date.now()
      const timeOnPage = now - startTime.current
      const timeSinceLastScroll = now - lastScrollTime.current
      
      // Consider user as "reading" if they've scrolled recently (within 30 seconds)
      const isReading = timeSinceLastScroll < 30000
      
      lastScrollTime.current = now
      
      setReadingProgress(prev => ({
        ...prev,
        scrollDepth,
        timeOnPage,
        isReading,
        hasFinished: scrollDepth >= 90
      }))

      // Track scroll depth milestones
      const milestones = [25, 50, 75, 90, 100]
      milestones.forEach(milestone => {
        if (scrollDepth >= milestone && !scrollDepthMilestones.current.has(milestone)) {
          scrollDepthMilestones.current.add(milestone)
          
          track('Article Scroll Milestone', {
            article_id: article.id,
            article_title: article.title,
            scroll_depth: milestone,
            time_to_milestone: timeOnPage,
            reading_time_minutes: Math.round(timeOnPage / 60000 * 10) / 10,
            is_actively_reading: isReading
          })
        }
      })

      // Track specific milestones
      if (scrollDepth >= 50 && !hasTrackedMidpoint.current) {
        hasTrackedMidpoint.current = true
        track('Article Midpoint Reached', {
          article_id: article.id,
          article_title: article.title,
          time_to_midpoint: timeOnPage,
          reading_speed_wpm: calculateReadingSpeed(article, timeOnPage / 2)
        })
      }

      if (scrollDepth >= 90 && !hasTrackedFinish.current) {
        hasTrackedFinish.current = true
        track('Article Completed', {
          article_id: article.id,
          article_title: article.title,
          total_reading_time: timeOnPage,
          reading_time_minutes: Math.round(timeOnPage / 60000 * 10) / 10,
          estimated_vs_actual: {
            estimated_minutes: article.readTime,
            actual_minutes: Math.round(timeOnPage / 60000 * 10) / 10
          },
          completion_rate: scrollDepth,
          reading_speed_wpm: calculateReadingSpeed(article, timeOnPage)
        })
      }
    }

    const throttledScroll = throttle(handleScroll, 1000) // Track every second
    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [article, contentRef, track])

  // Track when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - startTime.current
      
      track('Article Session End', {
        article_id: article.id,
        article_title: article.title,
        final_scroll_depth: readingProgress.scrollDepth,
        total_time_on_page: timeOnPage,
        reading_time_minutes: Math.round(timeOnPage / 60000 * 10) / 10,
        completion_status: readingProgress.hasFinished ? 'completed' : 
                          readingProgress.scrollDepth > 50 ? 'partially_read' : 'abandoned',
        engagement_quality: calculateEngagementQuality(readingProgress, timeOnPage)
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Also track when component unmounts (navigation)
      handleBeforeUnload()
    }
  }, [article, readingProgress, track])

  // Track article interactions
  const trackArticleInteraction = (interaction: string, details?: any) => {
    track('Article Interaction', {
      article_id: article.id,
      article_title: article.title,
      interaction_type: interaction,
      time_on_page: Date.now() - startTime.current,
      scroll_depth: readingProgress.scrollDepth,
      ...details
    })
  }

  return {
    readingProgress,
    trackArticleInteraction
  }
}

// Helper functions
const estimateWordCount = (content: string): number => {
  return content.trim().split(/\s+/).length
}

const calculateReadingSpeed = (article: Article, timeMs: number): number => {
  const wordCount = estimateWordCount(article.content || '')
  const timeMinutes = timeMs / 60000
  return timeMinutes > 0 ? Math.round(wordCount / timeMinutes) : 0
}

const calculateEngagementQuality = (progress: ReadingProgress, timeOnPage: number): string => {
  const timeMinutes = timeOnPage / 60000
  
  if (progress.hasFinished && timeMinutes > 1) return 'high'
  if (progress.scrollDepth > 50 && timeMinutes > 0.5) return 'medium'
  if (progress.scrollDepth > 25 || timeMinutes > 0.2) return 'low'
  return 'bounce'
}

const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}