#!/usr/bin/env node

/**
 * Script para gerar reports diretamente no Mixpanel
 * Uso: node scripts/generate-mixpanel-reports.js [dias]
 */

const fs = require('fs')
const path = require('path')

// Configuração do Mixpanel (usar variáveis de ambiente)
const MIXPANEL_CONFIG = {
  projectId: process.env.MIXPANEL_PROJECT_ID || '',
  username: process.env.MIXPANEL_USERNAME || '',
  secret: process.env.MIXPANEL_SECRET || ''
}

// Validar configuração
if (!MIXPANEL_CONFIG.projectId || !MIXPANEL_CONFIG.username || !MIXPANEL_CONFIG.secret) {
  console.error('❌ Erro: Variáveis de ambiente do Mixpanel não configuradas')
  console.error('Necessário: MIXPANEL_PROJECT_ID, MIXPANEL_USERNAME, MIXPANEL_SECRET')
  process.exit(1)
}

const days = parseInt(process.argv[2]) || 30

console.log(`📊 Gerando relatório Mixpanel para os últimos ${days} dias...`)
console.log(`🔑 Projeto ID: ${MIXPANEL_CONFIG.projectId}`)

/**
 * Executa query no Mixpanel
 */
async function executeQuery(endpoint, params) {
  const url = `https://mixpanel.com/api/2.0/${endpoint}/`
  const auth = Buffer.from(`${MIXPANEL_CONFIG.username}:${MIXPANEL_CONFIG.secret}`).toString('base64')
  
  try {
    const fetch = (await import('node-fetch')).default
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      throw new Error(`Mixpanel API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`❌ Erro na query ${endpoint}:`, error.message)
    throw error
  }
}

/**
 * Query: Artigos mais acessados
 */
async function getTopArticles(days) {
  console.log('📚 Consultando artigos mais acessados...')
  
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const params = {
    event: ['Article Started', 'Page Viewed'],
    type: 'general',
    unit: 'day',
    interval: days,
    from_date: startDate.toISOString().split('T')[0],
    to_date: endDate.toISOString().split('T')[0]
  }

  try {
    const data = await executeQuery('events', params)
    
    // Processar dados dos artigos
    const articles = []
    if (data.data && data.data['Article Started']) {
      Object.entries(data.data['Article Started']).forEach(([date, count]) => {
        if (count > 0) {
          articles.push({
            date,
            article_views: count,
            event: 'Article Started'
          })
        }
      })
    }
    
    console.log(`✅ Encontrados ${articles.length} registros de artigos`)
    return articles
  } catch (error) {
    console.error('❌ Erro ao consultar artigos:', error.message)
    return []
  }
}

/**
 * Query: Usuários novos vs recorrentes
 */
async function getUserSegmentation(days) {
  console.log('👥 Consultando segmentação de usuários...')
  
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const params = {
    event: ['Page Viewed'],
    type: 'unique',
    unit: 'day', 
    interval: days,
    from_date: startDate.toISOString().split('T')[0],
    to_date: endDate.toISOString().split('T')[0]
  }

  try {
    const data = await executeQuery('events', params)
    
    let totalUsers = 0
    if (data.data && data.data['Page Viewed']) {
      totalUsers = Object.values(data.data['Page Viewed']).reduce((sum, count) => sum + count, 0)
    }
    
    console.log(`✅ Total de usuários únicos: ${totalUsers}`)
    return {
      total_unique_users: totalUsers,
      period_days: days
    }
  } catch (error) {
    console.error('❌ Erro ao consultar usuários:', error.message)
    return { total_unique_users: 0, period_days: days }
  }
}

/**
 * Query: Canais de aquisição (UTM sources)
 */
async function getAcquisitionChannels(days) {
  console.log('🔗 Consultando canais de aquisição...')
  
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const params = {
    event: ['Page Viewed'],
    name: 'utm_source',
    type: 'general',
    unit: 'day',
    interval: days,
    from_date: startDate.toISOString().split('T')[0],
    to_date: endDate.toISOString().split('T')[0],
    limit: 10
  }

  try {
    const data = await executeQuery('events/properties', params)
    
    const channels = []
    if (data.data) {
      Object.entries(data.data).forEach(([source, counts]) => {
        const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0)
        if (totalCount > 0) {
          channels.push({
            source: source || 'Direct',
            total_sessions: totalCount
          })
        }
      })
    }
    
    // Ordenar por volume
    channels.sort((a, b) => b.total_sessions - a.total_sessions)
    
    console.log(`✅ Encontrados ${channels.length} canais de aquisição`)
    return channels
  } catch (error) {
    console.error('❌ Erro ao consultar canais:', error.message)
    return []
  }
}

/**
 * Query: Páginas mais populares
 */
async function getSitePopularity(days) {
  console.log('🏠 Consultando páginas mais populares...')
  
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const params = {
    event: ['Page Viewed'],
    name: 'page_name',
    type: 'general',
    unit: 'day',
    interval: days,
    from_date: startDate.toISOString().split('T')[0],
    to_date: endDate.toISOString().split('T')[0],
    limit: 10
  }

  try {
    const data = await executeQuery('events/properties', params)
    
    const pages = []
    if (data.data) {
      Object.entries(data.data).forEach(([page, counts]) => {
        const totalViews = Object.values(counts).reduce((sum, count) => sum + count, 0)
        if (totalViews > 0) {
          pages.push({
            page_name: page,
            total_views: totalViews
          })
        }
      })
    }
    
    // Ordenar por views
    pages.sort((a, b) => b.total_views - a.total_views)
    
    console.log(`✅ Encontradas ${pages.length} páginas`)
    return pages
  } catch (error) {
    console.error('❌ Erro ao consultar páginas:', error.message)
    return []
  }
}

/**
 * Gera relatório completo
 */
async function generateReport() {
  try {
    console.log('🚀 Iniciando geração de relatório...\n')
    
    const [topArticles, userSegmentation, acquisitionChannels, sitePopularity] = await Promise.all([
      getTopArticles(days),
      getUserSegmentation(days),
      getAcquisitionChannels(days),
      getSitePopularity(days)
    ])

    const report = {
      generated_at: new Date().toISOString(),
      period_days: days,
      project_id: MIXPANEL_CONFIG.projectId,
      data: {
        top_articles: topArticles,
        user_segmentation: userSegmentation,
        acquisition_channels: acquisitionChannels,
        site_popularity: sitePopularity
      }
    }

    // Salvar relatório
    const filename = `mixpanel-report-${days}d-${new Date().toISOString().split('T')[0]}.json`
    const filepath = path.join(__dirname, '..', 'reports', filename)
    
    // Criar diretório se não existir
    const reportsDir = path.dirname(filepath)
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
    
    console.log('\n📊 RELATÓRIO GERADO COM SUCESSO!')
    console.log(`📁 Arquivo: ${filepath}`)
    console.log(`📅 Período: ${days} dias`)
    console.log(`🕐 Gerado em: ${new Date().toLocaleString('pt-BR')}`)
    
    // Mostrar resumo
    console.log('\n📈 RESUMO:')
    console.log(`👥 Usuários únicos: ${userSegmentation.total_unique_users}`)
    console.log(`📚 Registros de artigos: ${topArticles.length}`)
    console.log(`🔗 Canais de aquisição: ${acquisitionChannels.length}`)
    console.log(`🏠 Páginas populares: ${sitePopularity.length}`)
    
    if (acquisitionChannels.length > 0) {
      console.log(`🥇 Principal canal: ${acquisitionChannels[0].source} (${acquisitionChannels[0].total_sessions} sessões)`)
    }
    
    if (sitePopularity.length > 0) {
      console.log(`📄 Página mais popular: ${sitePopularity[0].page_name} (${sitePopularity[0].total_views} views)`)
    }

    return report
  } catch (error) {
    console.error('\n❌ ERRO AO GERAR RELATÓRIO:', error.message)
    process.exit(1)
  }
}

// Executar
generateReport()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Script falhou:', error.message)
    process.exit(1)
  })