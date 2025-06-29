#!/usr/bin/env node

/**
 * Criar dashboard com estrutura correta
 */

import fetch from 'node-fetch'

const CONFIG = {
  projectId: '3765740',
  username: 'DashCreator.79b719.mp-service-account',
  secret: 'iM7pCMxwucplhDCVvo4Ly1XZfzh44P5C'
}

console.log('🎯 Criando dashboard com estrutura correta...')

async function createCorrectDashboard() {
  try {
    const auth = Buffer.from(`${CONFIG.username}:${CONFIG.secret}`).toString('base64')
    
    console.log('\n🔨 Criando dashboard...')
    
    const createResponse = await fetch(`https://mixpanel.com/api/app/projects/${CONFIG.projectId}/dashboards/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Blog Analytics Overview - DEV',
        description: 'Dashboard de analytics do blog para ambiente de desenvolvimento'
      })
    })
    
    console.log(`📡 Status: ${createResponse.status}`)
    
    if (createResponse.ok) {
      const newDashboard = await createResponse.json()
      console.log(`🎉 Dashboard criado com sucesso!`)
      console.log(`📊 Título: ${newDashboard.title}`)
      console.log(`🆔 ID: ${newDashboard.id}`)
      
      // Criar widget simples
      console.log('\n🧩 Adicionando widget...')
      
      const widgetResponse = await fetch(`https://mixpanel.com/api/app/projects/${CONFIG.projectId}/dashboards/${newDashboard.id}/widgets/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Page Views - Últimos 30 dias',
          type: 'insights',
          size: 'medium',
          query: {
            analysis_type: 'general',
            event: 'Page Viewed',
            measure: 'total',
            unit: 'day',
            interval: 30
          }
        })
      })
      
      console.log(`🧩 Widget status: ${widgetResponse.status}`)
      
      if (widgetResponse.ok) {
        const widget = await widgetResponse.json()
        console.log('✅ Widget criado com sucesso!')
        console.log(`🆔 Widget ID: ${widget.id}`)
        
      } else {
        const widgetError = await widgetResponse.text()
        console.log(`❌ Erro widget: ${widgetError}`)
      }
      
      console.log(`\n🔗 Acesse seu dashboard em:`)
      console.log(`   https://mixpanel.com/project/${CONFIG.projectId}/view/dashboards/${newDashboard.id}/`)
      
      console.log('\n🎉 SUCESSO! Agora vou criar os 3 dashboards completos...')
      
      return newDashboard.id
      
    } else {
      const errorText = await createResponse.text()
      console.log(`❌ Erro: ${errorText}`)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

createCorrectDashboard()