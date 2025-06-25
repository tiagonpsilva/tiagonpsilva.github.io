interface ArticleStats {
  views: number
  reactions: {
    like: number
  }
}

// Simula dados de analytics (em produção viria de um backend)
const articleStats: { [slug: string]: ArticleStats } = {
  'kwanza-agent-primeira-sprint': {
    views: 1847,
    reactions: {
      like: 42
    }
  },
  'dark-mode-react-typescript': {
    views: 892,
    reactions: {
      like: 23
    }
  }
}

// Função para incrementar visualizações
export function incrementViews(articleSlug: string): void {
  if (typeof window === 'undefined') return
  
  const viewKey = `article_viewed_${articleSlug}`
  const hasViewed = localStorage.getItem(viewKey)
  
  if (!hasViewed) {
    // Marca como visualizado para não contar múltiplas vezes
    localStorage.setItem(viewKey, Date.now().toString())
    
    // Em produção, enviaria para backend
    if (articleStats[articleSlug]) {
      articleStats[articleSlug].views++
    }
  }
}

// Função para reagir a um artigo
export function addReaction(articleSlug: string, reactionType: keyof ArticleStats['reactions']): boolean {
  if (typeof window === 'undefined') return false
  
  const reactionKey = `article_reaction_${articleSlug}`
  const existingReaction = localStorage.getItem(reactionKey)
  
  if (existingReaction === reactionType) {
    // Remove reação se clicou na mesma
    localStorage.removeItem(reactionKey)
    if (articleStats[articleSlug]) {
      articleStats[articleSlug].reactions[reactionType]--
    }
    return false
  } else {
    // Remove reação anterior se existir
    if (existingReaction && articleStats[articleSlug]) {
      articleStats[articleSlug].reactions[existingReaction as keyof ArticleStats['reactions']]--
    }
    
    // Adiciona nova reação
    localStorage.setItem(reactionKey, reactionType)
    if (articleStats[articleSlug]) {
      articleStats[articleSlug].reactions[reactionType]++
    }
    return true
  }
}

// Função para obter reação atual do usuário
export function getUserReaction(articleSlug: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(`article_reaction_${articleSlug}`)
}

// Função para obter estatísticas do artigo
export function getArticleStats(articleSlug: string): ArticleStats {
  return articleStats[articleSlug] || {
    views: 0,
    reactions: { like: 0 }
  }
}

// Função para formatar número de visualizações
export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}