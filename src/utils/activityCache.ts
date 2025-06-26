// Cache system for GitHub Activity data with 6h TTL
export interface ActivityData {
  date: string
  dayName: string
  repos: {
    name: string
    hours: number
    color: string
  }[]
  totalHours: number
}

const ACTIVITY_CACHE_KEY = 'github-activity-cache'
const ACTIVITY_CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours in milliseconds

interface ActivityCacheEntry {
  data: ActivityData[]
  timestamp: number
}

// Repository colors mapping
const REPO_COLORS = [
  'bg-blue-500',
  'bg-purple-500', 
  'bg-pink-500',
  'bg-green-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-teal-500'
]

// Get cached activity data
export function getCachedActivity(): ActivityData[] | null {
  try {
    const cached = localStorage.getItem(ACTIVITY_CACHE_KEY)
    if (!cached) return null

    const entry: ActivityCacheEntry = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache is still valid
    if ((now - entry.timestamp) < ACTIVITY_CACHE_TTL) {
      console.log('📊 Activity data from cache')
      return entry.data
    }

    // Cache expired
    localStorage.removeItem(ACTIVITY_CACHE_KEY)
    return null
  } catch (error) {
    console.warn('Failed to read activity cache:', error)
    return null
  }
}

// Cache activity data
export function setCachedActivity(data: ActivityData[]): void {
  try {
    const entry: ActivityCacheEntry = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(ACTIVITY_CACHE_KEY, JSON.stringify(entry))
    console.log('💾 Activity data cached')
  } catch (error) {
    console.warn('Failed to cache activity data:', error)
  }
}

// Check if we should fetch fresh data
export function shouldFetchActivity(): boolean {
  const cached = getCachedActivity()
  return cached === null
}

// Fetch real GitHub activity data
export async function fetchGitHubActivity(): Promise<ActivityData[]> {
  try {
    const username = 'tiagonpsilva'
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Format dates for GitHub API
    const since = sevenDaysAgo.toISOString()
    const until = today.toISOString()

    console.log('🔄 Fetching GitHub activity data...')
    console.log('📅 Date range:', { since, until })

    // Fetch user's repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )

    if (!reposResponse.ok) {
      throw new Error(`GitHub API error: ${reposResponse.status}`)
    }

    const repos = await reposResponse.json()
    console.log(`📦 Found ${repos.length} repositories`)
    const activityMap = new Map<string, Map<string, number>>()

    // Get commits for each repository from the last 7 days
    for (const repo of repos.slice(0, 10)) { // Limit to 10 most recent repos
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/commits?since=${since}&until=${until}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        )

        if (commitsResponse.ok) {
          const commits = await commitsResponse.json()
          console.log(`📊 ${repo.name}: ${commits.length} total commits found`)
          
          console.log(`📊 ${repo.name}: Using all ${commits.length} commits (no author filter)`)
          
          // Use ALL commits regardless of author
          commits.forEach((commit: any) => {
            const commitDate = new Date(commit.commit.author.date)
            const dateStr = commitDate.toISOString().split('T')[0]
            
            if (!activityMap.has(dateStr)) {
              activityMap.set(dateStr, new Map())
            }
            
            const dayMap = activityMap.get(dateStr)!
            const currentCount = dayMap.get(repo.name) || 0
            dayMap.set(repo.name, currentCount + 1)
          })
        } else {
          console.warn(`Failed to fetch commits for ${repo.name}: ${commitsResponse.status}`)
        }
      } catch (error) {
        console.warn(`Failed to fetch commits for ${repo.name}:`, error)
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Convert activity map to ActivityData array
    const activityData: ActivityData[] = []
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = weekDays[date.getDay()]

      const dayActivity = activityMap.get(dateStr)
      const repos: { name: string; hours: number; color: string }[] = []

      if (dayActivity) {
        let colorIndex = 0
        dayActivity.forEach((commits, repoName) => {
          // Convert commits to estimated hours (rough estimation: 0.5-2h per commit)
          const hours = Math.round((commits * (0.5 + Math.random() * 1.5)) * 10) / 10
          repos.push({
            name: repoName,
            hours,
            color: REPO_COLORS[colorIndex % REPO_COLORS.length]
          })
          colorIndex++
        })
      }

      const totalHours = repos.reduce((sum, repo) => sum + repo.hours, 0)

      activityData.push({
        date: dateStr,
        dayName,
        repos,
        totalHours: Math.round(totalHours * 10) / 10
      })
    }

    console.log('✅ GitHub activity data fetched successfully')
    console.log('📊 Activity data order:', activityData.map(d => `${d.date} (${d.dayName}) - ${d.totalHours}h`))
    console.log('📊 Activity map contents:', Object.fromEntries(activityMap))
    return activityData

  } catch (error) {
    console.error('Failed to fetch GitHub activity:', error)
    throw error
  }
}

// Get activity data with cache
export async function getActivityData(): Promise<ActivityData[]> {
  console.log('🔄 Getting activity data...')
  
  try {
    // Check if we have valid cache first
    const cached = getCachedActivity()
    if (cached && cached.length > 0) {
      console.log('📊 Using cached activity data')
      return cached
    }

    // Try to fetch fresh data from GitHub API
    console.log('🔄 Fetching fresh data from GitHub API...')
    const freshData = await fetchGitHubActivity()
    
    if (freshData && freshData.length > 0) {
      console.log('✅ Successfully fetched real GitHub data')
      setCachedActivity(freshData)
      return freshData
    } else {
      console.log('⚠️ No data from GitHub API, using fallback')
      const fallbackData = getFallbackActivityData()
      setCachedActivity(fallbackData)
      return fallbackData
    }
    
  } catch (error) {
    console.error('❌ Error fetching GitHub data, using fallback:', error)
    const fallbackData = getFallbackActivityData()
    setCachedActivity(fallbackData)
    return fallbackData
  }
}

// Fallback data when GitHub API fails
function getFallbackActivityData(): ActivityData[] {
  const fallback = [
    {
      date: '2025-06-20',
      dayName: 'Sex',
      repos: [
        { name: 'tiagonpsilva.github.io', hours: 5.5, color: 'bg-blue-500' }
      ],
      totalHours: 5.5
    },
    {
      date: '2025-06-21',
      dayName: 'Sáb',
      repos: [
        { name: 'modern-data-stack-training', hours: 3.5, color: 'bg-red-500' },
        { name: 'kwanza-agent', hours: 1.5, color: 'bg-purple-500' }
      ],
      totalHours: 5.0
    },
    {
      date: '2025-06-22',
      dayName: 'Dom',
      repos: [
        { name: 'tiagonpsilva.github.io', hours: 4.0, color: 'bg-blue-500' },
        { name: 'architecture-decision-records', hours: 1.0, color: 'bg-yellow-500' }
      ],
      totalHours: 5.0
    },
    {
      date: '2025-06-23',
      dayName: 'Seg',
      repos: [
        { name: 'github-mcpilot', hours: 2.5, color: 'bg-indigo-500' }
      ],
      totalHours: 2.5
    },
    {
      date: '2025-06-24',
      dayName: 'Ter',
      repos: [
        { name: 'divino-cantar-frontend', hours: 3.0, color: 'bg-green-500' },
        { name: 'system-design-concepts', hours: 1.5, color: 'bg-cyan-500' }
      ],
      totalHours: 4.5
    },
    {
      date: '2025-06-25',
      dayName: 'Qua',
      repos: [
        { name: 'tiagonpsilva.github.io', hours: 3.5, color: 'bg-blue-500' },
        { name: 'genai-langchain-tutorial', hours: 2.5, color: 'bg-pink-500' }
      ],
      totalHours: 6.0
    },
    {
      date: '2025-06-26',
      dayName: 'Qui',
      repos: [
        { name: 'tiagonpsilva.github.io', hours: 4.5, color: 'bg-blue-500' },
        { name: 'kwanza-agent', hours: 2.0, color: 'bg-purple-500' }
      ],
      totalHours: 6.5
    }
  ]
  return fallback
}

// Clean expired cache
export function cleanExpiredActivityCache(): void {
  const cached = getCachedActivity()
  if (!cached) {
    localStorage.removeItem(ACTIVITY_CACHE_KEY)
    console.log('🧹 Expired activity cache cleaned')
  }
}

// Force clear all activity cache (for debugging)
export function clearAllActivityCache(): void {
  localStorage.removeItem(ACTIVITY_CACHE_KEY)
  console.log('🗑️ All activity cache cleared')
}