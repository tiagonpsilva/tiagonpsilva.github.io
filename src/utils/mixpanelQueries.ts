/**
 * Mixpanel Query API Integration
 * Sistema para executar queries diretamente no Mixpanel via API
 */

interface MixpanelQueryConfig {
  projectId: string
  username: string
  secret: string
}

interface BlogArticleMetrics {
  event: string
  article_id: string
  article_title: string
  total_events: number
  unique_users: number
  avg_reading_time?: number
  completion_rate?: number
}

/**
 * Executa query no Mixpanel para artigos mais acessados
 */
export const queryTopArticles = async (
  config: MixpanelQueryConfig,
  days: number = 30
): Promise<BlogArticleMetrics[]> => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const queryParams = {
    event: ['Article Started', 'Page Viewed'],
    type: 'general',
    unit: 'day',
    interval: days,
    from_date: startDate.toISOString().split('T')[0],
    to_date: endDate.toISOString().split('T')[0],
    where: 'properties["page_name"] == "Blog Article" or event == "Article Started"'
  }

  try {
    const response = await fetch(`https://mixpanel.com/api/2.0/events/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.secret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryParams)
    })

    if (!response.ok) {
      throw new Error(`Mixpanel API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Processar dados dos artigos
    return processArticleData(data)
  } catch (error) {
    console.error('Erro ao consultar artigos no Mixpanel:', error)
    throw error
  }
}

/**
 * Query para comportamento de leitura (scroll depth, tempo na página)
 */
export const queryReadingBehavior = async (
  config: MixpanelQueryConfig,
  days: number = 30
) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const queryParams = {
    event: ['Article Scroll Milestone', 'Article Completed', 'Article Session End'],
    type: 'average',
    unit: 'day',
    interval: days,
    from_date: startDate.toISOString().split('T')[0],
    to_date: endDate.toISOString().split('T')[0]
  }

  try {
    const response = await fetch(`https://mixpanel.com/api/2.0/events/properties/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.secret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...queryParams,
        name: 'scroll_depth'
      })
    })

    if (!response.ok) {
      throw new Error(`Mixpanel API error: ${response.status}`)
    }

    const scrollData = await response.json()
    
    // Query separada para tempo de leitura
    const timeResponse = await fetch(`https://mixpanel.com/api/2.0/events/properties/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.secret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...queryParams,
        name: 'reading_time_minutes'
      })
    })

    const timeData = await timeResponse.json()

    return {
      avg_scroll_depth: calculateAverage(scrollData),
      avg_reading_time: calculateAverage(timeData),
      completion_rate: await getCompletionRate(config, days)
    }
  } catch (error) {
    console.error('Erro ao consultar comportamento de leitura:', error)
    throw error
  }
}

/**
 * Query para segmentação de usuários (novos vs recorrentes)
 */
export const queryUserSegmentation = async (
  config: MixpanelQueryConfig,
  days: number = 30
) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  try {
    // Query para usuários novos
    const newUsersResponse = await fetch(`https://mixpanel.com/api/2.0/events/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.secret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: ['Page Viewed'],
        type: 'unique',
        unit: 'day',
        interval: days,
        from_date: startDate.toISOString().split('T')[0],
        to_date: endDate.toISOString().split('T')[0],
        where: 'properties["user_type"] == "new"'
      })
    })

    // Query para usuários recorrentes
    const returningUsersResponse = await fetch(`https://mixpanel.com/api/2.0/events/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.secret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: ['Page Viewed'],
        type: 'unique',
        unit: 'day',
        interval: days,
        from_date: startDate.toISOString().split('T')[0],
        to_date: endDate.toISOString().split('T')[0],
        where: 'properties["user_type"] == "returning"'
      })
    })

    const [newUsers, returningUsers] = await Promise.all([
      newUsersResponse.json(),
      returningUsersResponse.json()
    ])

    return {
      new_users: sumEventCounts(newUsers),
      returning_users: sumEventCounts(returningUsers),
      total_users: sumEventCounts(newUsers) + sumEventCounts(returningUsers)
    }
  } catch (error) {
    console.error('Erro ao consultar segmentação de usuários:', error)
    throw error
  }
}

/**
 * Query para canais de aquisição (UTM tracking)
 */
export const queryAcquisitionChannels = async (
  config: MixpanelQueryConfig,
  days: number = 30
) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  try {
    const response = await fetch(`https://mixpanel.com/api/2.0/events/properties/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.secret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: ['Page Viewed'],
        name: 'utm_source',
        type: 'general',
        unit: 'day',
        interval: days,
        from_date: startDate.toISOString().split('T')[0],
        to_date: endDate.toISOString().split('T')[0],
        limit: 10
      })
    })

    if (!response.ok) {
      throw new Error(`Mixpanel API error: ${response.status}`)
    }

    const data = await response.json()
    return processChannelData(data)
  } catch (error) {
    console.error('Erro ao consultar canais de aquisição:', error)
    throw error
  }
}

/**
 * Query para seções mais populares do site
 */
export const querySitePopularity = async (
  config: MixpanelQueryConfig,
  days: number = 30
) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  try {
    const response = await fetch(`https://mixpanel.com/api/2.0/events/properties/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.secret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: ['Page Viewed'],
        name: 'page_name',
        type: 'general',
        unit: 'day',
        interval: days,
        from_date: startDate.toISOString().split('T')[0],
        to_date: endDate.toISOString().split('T')[0],
        limit: 10
      })
    })

    if (!response.ok) {
      throw new Error(`Mixpanel API error: ${response.status}`)
    }

    const data = await response.json()
    return processSiteData(data)
  } catch (error) {
    console.error('Erro ao consultar popularidade do site:', error)
    throw error
  }
}

/**
 * Executa todas as queries e gera relatório completo
 */
export const generateMixpanelReport = async (
  config: MixpanelQueryConfig,
  days: number = 30
) => {
  console.log(`🔍 Gerando relatório Mixpanel para ${days} dias...`)
  
  try {
    const [
      topArticles,
      readingBehavior,
      userSegmentation,
      acquisitionChannels,
      sitePopularity
    ] = await Promise.all([
      queryTopArticles(config, days),
      queryReadingBehavior(config, days),
      queryUserSegmentation(config, days),
      queryAcquisitionChannels(config, days),
      querySitePopularity(config, days)
    ])

    const report = {
      period: `${days} dias`,
      generated_at: new Date().toISOString(),
      top_articles: topArticles,
      reading_behavior: readingBehavior,
      user_segmentation: userSegmentation,
      acquisition_channels: acquisitionChannels,
      site_popularity: sitePopularity
    }

    console.log('✅ Relatório Mixpanel gerado com sucesso!')
    return report
  } catch (error) {
    console.error('❌ Erro ao gerar relatório Mixpanel:', error)
    throw error
  }
}

// Helper functions
const processArticleData = (_data: any): BlogArticleMetrics[] => {
  // Processar dados brutos do Mixpanel para formato de artigos
  const articles: BlogArticleMetrics[] = []
  
  // TODO: Implementar lógica de processamento baseado na estrutura real da resposta
  // if (data.data) {
  //   Object.entries(data.data).forEach(([date, events]: [string, any]) => {
  //     // Processar eventos por data e artigo
  //   })
  // }
  
  return articles
}

const calculateAverage = (data: any): number => {
  // Calcular média dos valores retornados
  if (!data.data) return 0
  
  const values = Object.values(data.data).flat()
  const sum = values.reduce((a: number, b: any) => a + Number(b), 0)
  return values.length > 0 ? sum / values.length : 0
}

const getCompletionRate = async (_config: MixpanelQueryConfig, _days: number): Promise<number> => {
  // TODO: Query específica para taxa de conclusão de artigos
  // Implementar baseado nos eventos "Article Started" vs "Article Completed"
  return 0 // Placeholder
}

const sumEventCounts = (data: any): number => {
  if (!data.data) return 0
  return Object.values(data.data).reduce((sum: number, count: any) => sum + count, 0)
}

const processChannelData = (_data: any) => {
  // TODO: Processar dados de canais de aquisição
  return []
}

const processSiteData = (_data: any) => {
  // TODO: Processar dados de popularidade do site
  return []
}

/**
 * Configura credenciais do Mixpanel para queries
 */
export const createMixpanelConfig = (
  projectId: string,
  username: string,
  secret: string
): MixpanelQueryConfig => {
  return { projectId, username, secret }
}

/**
 * Testa conectividade com a API do Mixpanel
 */
export const testMixpanelConnection = async (config: MixpanelQueryConfig): Promise<boolean> => {
  try {
    const response = await fetch(`https://mixpanel.com/api/2.0/events/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.secret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: ['Page Viewed'],
        type: 'general',
        unit: 'day',
        interval: 1,
        from_date: new Date().toISOString().split('T')[0],
        to_date: new Date().toISOString().split('T')[0]
      })
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao testar conexão Mixpanel:', error)
    return false
  }
}