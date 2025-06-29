#!/usr/bin/env node

/**
 * Verificar dashboards criados
 */

import fetch from 'node-fetch'

const CONFIG = {
  projectId: '3765740',
  username: 'DashCreator.79b719.mp-service-account',
  secret: 'iM7pCMxwucplhDCVvo4Ly1XZfzh44P5C'
}

console.log('🔍 Verificando dashboards criados...')

async function checkDashboards() {
  try {
    const auth = Buffer.from(`${CONFIG.username}:${CONFIG.secret}`).toString('base64')
    
    const response = await fetch(`https://mixpanel.com/api/app/projects/${CONFIG.projectId}/dashboards/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📡 Status: ${response.status}`)
    
    if (response.ok) {
      const dashboards = await response.json()
      console.log(`✅ Total: ${dashboards.length} dashboards`)
      
      if (dashboards.length > 0) {
        console.log('\n📋 Dashboards encontrados:')
        dashboards.forEach((dash, index) => {
          console.log(`  ${index + 1}. ${dash.title || dash.name || 'Sem título'}`)
          console.log(`     ID: ${dash.id}`)
          console.log(`     Criado: ${dash.created_at || 'N/A'}`)
          console.log(`     URL: https://mixpanel.com/project/${CONFIG.projectId}/view/dashboards/${dash.id}/`)
          console.log('')
        })
        
        console.log('🎉 DASHBOARDS FUNCIONANDO!')
        console.log('🚀 Pronto para criar os dashboards finais do blog!')
        
      } else {
        console.log('📝 Nenhum dashboard encontrado ainda')
      }
      
    } else {
      const errorText = await response.text()
      console.log(`❌ Erro: ${errorText}`)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

checkDashboards()