import { Article } from '@/types/blog'

// Lista de artigos disponíveis - agora buscamos dos arquivos markdown
const articleSlugs = [
  'kwanza-agent-primeira-sprint',
  'da-resposta-ao-raciocinio-ia-que-pensa-em-voz-alta',
  'agentes-de-ia-revolucao-silenciosa',
  'conversando-com-ia-da-forma-certa-engenharia-de-prompt',
  'como-ia-esta-revolucionando-engenharia-de-software-mcp',
  'ia-em-times-de-tecnologia-mais-valor-menos-esforco-parte-1',
  'acelerando-entrega-de-valor-com-ia-sagemaker-bedrock-amazon-q'
]

// Função para buscar o conteúdo de um artigo markdown
async function fetchArticleContent(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`/content/blog/${slug}/index.md`)
    if (!response.ok) {
      throw new Error(`Artigo não encontrado: ${slug}`)
    }
    
    const markdownContent = await response.text()
    
    // Parse do frontmatter e content
    const frontmatterMatch = markdownContent.match(/^---\s*\n(.*?)\n---\s*\n(.*)/s)
    if (!frontmatterMatch) {
      throw new Error(`Frontmatter inválido no artigo: ${slug}`)
    }
    
    const [, frontmatterText, content] = frontmatterMatch
    
    // Parse manual do frontmatter YAML
    const frontmatter: any = {}
    frontmatterText.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim()
        
        // Parse de arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          frontmatter[key.trim()] = value.slice(1, -1).split(',').map(item => item.trim())
        } else {
          frontmatter[key.trim()] = value
        }
      }
    })
    
    // Criar objeto Article
    const article: Article = {
      id: frontmatter.id || slug,
      title: frontmatter.title || '',
      excerpt: frontmatter.excerpt || '',
      publishedAt: frontmatter.publishedAt || '',
      tags: frontmatter.tags || [],
      linkedinUrl: frontmatter.linkedinUrl,
      slug: slug,
      readTime: parseInt(frontmatter.readTime) || 5,
      content: content.trim()
    }
    
    return article
  } catch (error) {
    console.error(`Erro ao carregar artigo ${slug}:`, error)
    return null
  }
}

export async function getAllArticles(): Promise<Article[]> {
  const articles: Article[] = []
  
  for (const slug of articleSlugs) {
    const article = await fetchArticleContent(slug)
    if (article) {
      articles.push(article)
    }
  }
  
  return articles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return await fetchArticleContent(slug)
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  const articles = await getAllArticles()
  return articles.filter(article => 
    article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}