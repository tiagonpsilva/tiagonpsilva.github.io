// GitHub API utilities for DORA Metrics calculation
// Based on the four key DORA metrics for DevOps performance

export interface DoraMetrics {
  deploymentFrequency: {
    value: number
    unit: 'per-day' | 'per-week' | 'per-month'
    display: string
    score: 'elite' | 'high' | 'medium' | 'low'
  }
  leadTimeForChanges: {
    value: number
    unit: 'hours' | 'days' | 'weeks'
    display: string
    score: 'elite' | 'high' | 'medium' | 'low'
  }
  changeFailureRate: {
    value: number
    unit: 'percentage'
    display: string
    score: 'elite' | 'high' | 'medium' | 'low'
  }
  meanTimeToRecovery: {
    value: number
    unit: 'hours' | 'days'
    display: string
    score: 'elite' | 'high' | 'medium' | 'low'
  }
  overallScore: 'elite' | 'high' | 'medium' | 'low'
}

export interface GitHubCommit {
  sha: string
  commit: {
    author: { date: string }
    message: string
  }
  author: { login: string } | null
}

export interface GitHubRelease {
  tag_name: string
  created_at: string
  prerelease: boolean
}

export interface GitHubPullRequest {
  number: number
  created_at: string
  merged_at: string | null
  closed_at: string | null
  state: 'open' | 'closed'
  merged: boolean
}

// Extract repository owner and name from GitHub URL
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

// Fetch commits from GitHub API
export async function fetchCommits(owner: string, repo: string, since?: string): Promise<GitHubCommit[]> {
  try {
    const sinceParam = since ? `&since=${since}` : ''
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100${sinceParam}`
    )
    
    if (!response.ok) {
      console.warn(`Failed to fetch commits for ${owner}/${repo}:`, response.status)
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.warn(`Error fetching commits for ${owner}/${repo}:`, error)
    return []
  }
}

// Fetch releases from GitHub API
export async function fetchReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=50`
    )
    
    if (!response.ok) {
      console.warn(`Failed to fetch releases for ${owner}/${repo}:`, response.status)
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.warn(`Error fetching releases for ${owner}/${repo}:`, error)
    return []
  }
}

// Fetch pull requests from GitHub API
export async function fetchPullRequests(owner: string, repo: string): Promise<GitHubPullRequest[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`
    )
    
    if (!response.ok) {
      console.warn(`Failed to fetch pull requests for ${owner}/${repo}:`, response.status)
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.warn(`Error fetching pull requests for ${owner}/${repo}:`, error)
    return []
  }
}

// Calculate Deployment Frequency based on releases and main branch commits
function calculateDeploymentFrequency(
  releases: GitHubRelease[],
  commits: GitHubCommit[]
): DoraMetrics['deploymentFrequency'] {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  
  // Count releases in last 3 months
  const recentReleases = releases.filter(release => 
    new Date(release.created_at) > threeMonthsAgo && !release.prerelease
  )
  
  // If no releases, use commits to main as deployment proxy
  const deployments = recentReleases.length > 0 ? recentReleases.length : commits.length
  const deploymentsPerWeek = (deployments / 12) // 12 weeks in 3 months
  
  if (deploymentsPerWeek >= 1) {
    return {
      value: Math.round(deploymentsPerWeek * 10) / 10,
      unit: 'per-week',
      display: `${Math.round(deploymentsPerWeek * 10) / 10}/semana`,
      score: deploymentsPerWeek >= 7 ? 'elite' : deploymentsPerWeek >= 1 ? 'high' : 'medium'
    }
  } else {
    const deploymentsPerMonth = deployments / 3
    return {
      value: Math.round(deploymentsPerMonth * 10) / 10,
      unit: 'per-month',
      display: `${Math.round(deploymentsPerMonth * 10) / 10}/mês`,
      score: deploymentsPerMonth >= 1 ? 'medium' : 'low'
    }
  }
}

// Calculate Lead Time for Changes based on PR merge times
function calculateLeadTimeForChanges(pullRequests: GitHubPullRequest[]): DoraMetrics['leadTimeForChanges'] {
  const mergedPRs = pullRequests.filter(pr => pr.merged && pr.merged_at)
  
  if (mergedPRs.length === 0) {
    return {
      value: 7,
      unit: 'days',
      display: '~7 dias',
      score: 'medium'
    }
  }
  
  const leadTimes = mergedPRs.map(pr => {
    const created = new Date(pr.created_at).getTime()
    const merged = new Date(pr.merged_at!).getTime()
    return (merged - created) / (1000 * 60 * 60) // hours
  })
  
  const avgLeadTimeHours = leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length
  
  if (avgLeadTimeHours < 24) {
    return {
      value: Math.round(avgLeadTimeHours),
      unit: 'hours',
      display: `${Math.round(avgLeadTimeHours)}h`,
      score: avgLeadTimeHours < 1 ? 'elite' : 'high'
    }
  } else {
    const avgLeadTimeDays = avgLeadTimeHours / 24
    return {
      value: Math.round(avgLeadTimeDays * 10) / 10,
      unit: 'days',
      display: `${Math.round(avgLeadTimeDays * 10) / 10} dias`,
      score: avgLeadTimeDays <= 1 ? 'high' : avgLeadTimeDays <= 7 ? 'medium' : 'low'
    }
  }
}

// Calculate Change Failure Rate based on commit messages
function calculateChangeFailureRate(commits: GitHubCommit[]): DoraMetrics['changeFailureRate'] {
  if (commits.length === 0) {
    return {
      value: 10,
      unit: 'percentage',
      display: '~10%',
      score: 'medium'
    }
  }
  
  const fixCommits = commits.filter(commit => 
    /\b(fix|hotfix|bug|error|issue|patch)\b/i.test(commit.commit.message)
  )
  
  const failureRate = (fixCommits.length / commits.length) * 100
  
  return {
    value: Math.round(failureRate * 10) / 10,
    unit: 'percentage',
    display: `${Math.round(failureRate * 10) / 10}%`,
    score: failureRate <= 15 ? 'elite' : failureRate <= 20 ? 'high' : failureRate <= 30 ? 'medium' : 'low'
  }
}

// Calculate Mean Time to Recovery based on fix commit intervals
function calculateMeanTimeToRecovery(commits: GitHubCommit[]): DoraMetrics['meanTimeToRecovery'] {
  const fixCommits = commits.filter(commit => 
    /\b(fix|hotfix|bug|error|issue|patch)\b/i.test(commit.commit.message)
  ).sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
  
  if (fixCommits.length < 2) {
    return {
      value: 24,
      unit: 'hours',
      display: '~1 dia',
      score: 'medium'
    }
  }
  
  const recoveryTimes = []
  for (let i = 0; i < fixCommits.length - 1; i++) {
    const current = new Date(fixCommits[i].commit.author.date).getTime()
    const previous = new Date(fixCommits[i + 1].commit.author.date).getTime()
    recoveryTimes.push((current - previous) / (1000 * 60 * 60)) // hours
  }
  
  const avgRecoveryHours = recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length
  
  if (avgRecoveryHours < 24) {
    return {
      value: Math.round(avgRecoveryHours),
      unit: 'hours',
      display: `${Math.round(avgRecoveryHours)}h`,
      score: avgRecoveryHours < 1 ? 'elite' : 'high'
    }
  } else {
    const avgRecoveryDays = avgRecoveryHours / 24
    return {
      value: Math.round(avgRecoveryDays * 10) / 10,
      unit: 'days',
      display: `${Math.round(avgRecoveryDays * 10) / 10} dias`,
      score: avgRecoveryDays <= 1 ? 'high' : avgRecoveryDays <= 7 ? 'medium' : 'low'
    }
  }
}

// Calculate overall DORA score
function calculateOverallScore(metrics: Omit<DoraMetrics, 'overallScore'>): DoraMetrics['overallScore'] {
  const scores = [
    metrics.deploymentFrequency.score,
    metrics.leadTimeForChanges.score,
    metrics.changeFailureRate.score,
    metrics.meanTimeToRecovery.score
  ]
  
  const scoreValues = { elite: 4, high: 3, medium: 2, low: 1 }
  const avgScore = scores.reduce((sum, score) => sum + scoreValues[score], 0) / scores.length
  
  if (avgScore >= 3.5) return 'elite'
  if (avgScore >= 2.5) return 'high'
  if (avgScore >= 1.5) return 'medium'
  return 'low'
}

// Main function to calculate all DORA metrics for a repository
export async function calculateDoraMetrics(repoUrl: string): Promise<DoraMetrics | null> {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) return null
  
  const { owner, repo } = parsed
  
  // Fetch data from GitHub API
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const [commits, releases, pullRequests] = await Promise.all([
    fetchCommits(owner, repo, threeMonthsAgo),
    fetchReleases(owner, repo),
    fetchPullRequests(owner, repo)
  ])
  
  // Calculate individual metrics
  const deploymentFrequency = calculateDeploymentFrequency(releases, commits)
  const leadTimeForChanges = calculateLeadTimeForChanges(pullRequests)
  const changeFailureRate = calculateChangeFailureRate(commits)
  const meanTimeToRecovery = calculateMeanTimeToRecovery(commits)
  
  const metrics = {
    deploymentFrequency,
    leadTimeForChanges,
    changeFailureRate,
    meanTimeToRecovery
  }
  
  const overallScore = calculateOverallScore(metrics)
  
  return {
    ...metrics,
    overallScore
  }
}

// Get badge info for DORA score
export function getDoraScoreBadge(score: DoraMetrics['overallScore']): {
  label: string
  color: string
  bgColor: string
} {
  switch (score) {
    case 'elite':
      return { label: 'Elite Performer', color: 'text-green-700', bgColor: 'bg-green-100' }
    case 'high':
      return { label: 'High Performer', color: 'text-blue-700', bgColor: 'bg-blue-100' }
    case 'medium':
      return { label: 'Medium Performer', color: 'text-yellow-700', bgColor: 'bg-yellow-100' }
    case 'low':
      return { label: 'Needs Improvement', color: 'text-red-700', bgColor: 'bg-red-100' }
  }
}