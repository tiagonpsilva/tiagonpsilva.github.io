// Cache system for DORA Metrics with 24h TTL and fallback data
import { DoraMetrics } from './doraMetrics'

const CACHE_KEY = 'dora-metrics-cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface CacheEntry {
  data: DoraMetrics
  timestamp: number
  repoUrl: string
}

interface CacheStore {
  [repoName: string]: CacheEntry
}

// Mock data for development and fallback
const mockDoraData: Record<string, DoraMetrics> = {
  'kwanza-agent': {
    deploymentFrequency: {
      value: 2.1,
      unit: 'per-week',
      display: '2.1/semana',
      score: 'high'
    },
    leadTimeForChanges: {
      value: 18,
      unit: 'hours',
      display: '18h',
      score: 'high'
    },
    changeFailureRate: {
      value: 8.5,
      unit: 'percentage',
      display: '8.5%',
      score: 'elite'
    },
    meanTimeToRecovery: {
      value: 6,
      unit: 'hours',
      display: '6h',
      score: 'high'
    },
    overallScore: 'high'
  },
  'utajiri-360': {
    deploymentFrequency: {
      value: 0.3,
      unit: 'per-month',
      display: '0.3/mês',
      score: 'low'
    },
    leadTimeForChanges: {
      value: 3.2,
      unit: 'days',
      display: '3.2 dias',
      score: 'medium'
    },
    changeFailureRate: {
      value: 25,
      unit: 'percentage',
      display: '25%',
      score: 'medium'
    },
    meanTimeToRecovery: {
      value: 1.5,
      unit: 'days',
      display: '1.5 dias',
      score: 'medium'
    },
    overallScore: 'medium'
  },
  'divino-cantar': {
    deploymentFrequency: {
      value: 1.8,
      unit: 'per-week',
      display: '1.8/semana',
      score: 'high'
    },
    leadTimeForChanges: {
      value: 12,
      unit: 'hours',
      display: '12h',
      score: 'high'
    },
    changeFailureRate: {
      value: 12,
      unit: 'percentage',
      display: '12%',
      score: 'elite'
    },
    meanTimeToRecovery: {
      value: 4,
      unit: 'hours',
      display: '4h',
      score: 'high'
    },
    overallScore: 'high'
  },
  'github-mcpilot': {
    deploymentFrequency: {
      value: 3.5,
      unit: 'per-week',
      display: '3.5/semana',
      score: 'high'
    },
    leadTimeForChanges: {
      value: 8,
      unit: 'hours',
      display: '8h',
      score: 'high'
    },
    changeFailureRate: {
      value: 6.2,
      unit: 'percentage',
      display: '6.2%',
      score: 'elite'
    },
    meanTimeToRecovery: {
      value: 2,
      unit: 'hours',
      display: '2h',
      score: 'elite'
    },
    overallScore: 'elite'
  },
  'genai-langchain-tutorial': {
    deploymentFrequency: {
      value: 1.2,
      unit: 'per-week',
      display: '1.2/semana',
      score: 'high'
    },
    leadTimeForChanges: {
      value: 1.5,
      unit: 'days',
      display: '1.5 dias',
      score: 'medium'
    },
    changeFailureRate: {
      value: 15,
      unit: 'percentage',
      display: '15%',
      score: 'elite'
    },
    meanTimeToRecovery: {
      value: 8,
      unit: 'hours',
      display: '8h',
      score: 'high'
    },
    overallScore: 'high'
  },
  'architecture-haiku': {
    deploymentFrequency: {
      value: 0.8,
      unit: 'per-week',
      display: '0.8/semana',
      score: 'medium'
    },
    leadTimeForChanges: {
      value: 24,
      unit: 'hours',
      display: '24h',
      score: 'high'
    },
    changeFailureRate: {
      value: 20,
      unit: 'percentage',
      display: '20%',
      score: 'high'
    },
    meanTimeToRecovery: {
      value: 12,
      unit: 'hours',
      display: '12h',
      score: 'high'
    },
    overallScore: 'high'
  },
  'system-design-concepts': {
    deploymentFrequency: {
      value: 0.6,
      unit: 'per-week',
      display: '0.6/semana',
      score: 'medium'
    },
    leadTimeForChanges: {
      value: 2.8,
      unit: 'days',
      display: '2.8 dias',
      score: 'medium'
    },
    changeFailureRate: {
      value: 18,
      unit: 'percentage',
      display: '18%',
      score: 'high'
    },
    meanTimeToRecovery: {
      value: 1.2,
      unit: 'days',
      display: '1.2 dias',
      score: 'medium'
    },
    overallScore: 'medium'
  },
  'modern-data-stack-training': {
    deploymentFrequency: {
      value: 1.5,
      unit: 'per-week',
      display: '1.5/semana',
      score: 'high'
    },
    leadTimeForChanges: {
      value: 16,
      unit: 'hours',
      display: '16h',
      score: 'high'
    },
    changeFailureRate: {
      value: 10,
      unit: 'percentage',
      display: '10%',
      score: 'elite'
    },
    meanTimeToRecovery: {
      value: 5,
      unit: 'hours',
      display: '5h',
      score: 'high'
    },
    overallScore: 'high'
  },
  'architecture-decision-records': {
    deploymentFrequency: {
      value: 0.4,
      unit: 'per-week',
      display: '0.4/semana',
      score: 'medium'
    },
    leadTimeForChanges: {
      value: 3.5,
      unit: 'days',
      display: '3.5 dias',
      score: 'medium'
    },
    changeFailureRate: {
      value: 22,
      unit: 'percentage',
      display: '22%',
      score: 'medium'
    },
    meanTimeToRecovery: {
      value: 2.1,
      unit: 'days',
      display: '2.1 dias',
      score: 'medium'
    },
    overallScore: 'medium'
  }
}

// Extract repository name from GitHub URL
function getRepoNameFromUrl(repoUrl: string): string {
  const match = repoUrl.match(/github\.com\/[^\/]+\/([^\/]+)/)
  return match ? match[1] : repoUrl
}

// Get cached data from localStorage
function getCacheStore(): CacheStore {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch (error) {
    console.warn('Failed to read DORA cache:', error)
    return {}
  }
}

// Save data to localStorage cache
function setCacheStore(store: CacheStore): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store))
  } catch (error) {
    console.warn('Failed to save DORA cache:', error)
  }
}

// Check if cache entry is still valid (within TTL)
function isCacheValid(entry: CacheEntry): boolean {
  const now = Date.now()
  return (now - entry.timestamp) < CACHE_TTL
}

// Get DORA metrics from cache or return mock data
export function getCachedDoraMetrics(repoUrl: string): DoraMetrics | null {
  const repoName = getRepoNameFromUrl(repoUrl)
  const cache = getCacheStore()
  const entry = cache[repoName]

  // Return cached data if valid
  if (entry && isCacheValid(entry)) {
    console.log(`📊 DORA Metrics from cache: ${repoName}`)
    return entry.data
  }

  // Return mock data as fallback
  if (mockDoraData[repoName]) {
    console.log(`📊 DORA Metrics from mock data: ${repoName}`)
    return mockDoraData[repoName]
  }

  return null
}

// Cache DORA metrics data
export function setCachedDoraMetrics(repoUrl: string, data: DoraMetrics): void {
  const repoName = getRepoNameFromUrl(repoUrl)
  const cache = getCacheStore()
  
  cache[repoName] = {
    data,
    timestamp: Date.now(),
    repoUrl
  }
  
  setCacheStore(cache)
  console.log(`💾 DORA Metrics cached: ${repoName}`)
}

// Check if we should fetch fresh data (cache miss or expired)
export function shouldFetchDoraMetrics(repoUrl: string): boolean {
  const repoName = getRepoNameFromUrl(repoUrl)
  const cache = getCacheStore()
  const entry = cache[repoName]
  
  // Fetch if no cache entry or if cache is expired
  return !entry || !isCacheValid(entry)
}

// Clear expired cache entries
export function cleanExpiredCache(): void {
  const cache = getCacheStore()
  const cleanedCache: CacheStore = {}
  
  Object.entries(cache).forEach(([repoName, entry]) => {
    if (isCacheValid(entry)) {
      cleanedCache[repoName] = entry
    }
  })
  
  setCacheStore(cleanedCache)
  console.log('🧹 Expired DORA cache entries cleaned')
}

// Get cache statistics
export function getCacheStats(): {
  totalEntries: number
  validEntries: number
  expiredEntries: number
  oldestEntry?: string
  newestEntry?: string
} {
  const cache = getCacheStore()
  const entries = Object.entries(cache)
  
  let validEntries = 0
  let expiredEntries = 0
  let oldestTimestamp = Infinity
  let newestTimestamp = 0
  let oldestEntry = ''
  let newestEntry = ''
  
  entries.forEach(([repoName, entry]) => {
    if (isCacheValid(entry)) {
      validEntries++
    } else {
      expiredEntries++
    }
    
    if (entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp
      oldestEntry = repoName
    }
    
    if (entry.timestamp > newestTimestamp) {
      newestTimestamp = entry.timestamp
      newestEntry = repoName
    }
  })
  
  return {
    totalEntries: entries.length,
    validEntries,
    expiredEntries,
    oldestEntry: oldestEntry || undefined,
    newestEntry: newestEntry || undefined
  }
}

// Development helper: Force refresh cache for a repository
export function forceCacheRefresh(repoUrl: string): void {
  const repoName = getRepoNameFromUrl(repoUrl)
  const cache = getCacheStore()
  
  if (cache[repoName]) {
    delete cache[repoName]
    setCacheStore(cache)
    console.log(`🔄 Cache refreshed for: ${repoName}`)
  }
}