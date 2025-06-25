import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Article } from '@/types/blog'
import { getArticleBySlug } from '@/lib/articles'
import { useTheme } from '@/contexts/ThemeContext'

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { setDarkModeForBlog } = useTheme()

  useEffect(() => {
    // Ativar dark mode quando entrar no artigo (apenas uma vez)
    setDarkModeForBlog()
    
    const fetchArticle = async () => {
      if (!slug) {
        setNotFound(true)
        setLoading(false)
        return
      }

      try {
        const articleData = await getArticleBySlug(slug)
        if (articleData) {
          setArticle(articleData)
        } else {
          setNotFound(true)
        }
      } catch (error) {
        console.error('Erro ao carregar artigo:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug]) // Remover setDarkModeForBlog das dependências

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground mb-8">Artigo não encontrado</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back to Blog */}
      <div className="pt-24 pb-8 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <div className="pb-8 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {article.title}
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">{new Date(article.publishedAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">{article.readTime} min de leitura</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 md:px-3 py-1 text-xs md:text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
                >
                  <Tag className="w-3 h-3 md:w-4 md:h-4" />
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article Cover Image */}
      {article.slug === 'acelerando-entrega-de-valor-com-ia-sagemaker-bedrock-amazon-q' && (
        <div className="pb-6 md:pb-12 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg md:rounded-xl overflow-hidden border border-border"
            >
              <img 
                src="/content/blog/acelerando-entrega-de-valor-com-ia-sagemaker-bedrock-amazon-q/capa.png"
                alt="Capa do artigo - AWS re:Invent 2024"
                className="w-full h-auto md:max-h-[60vh] md:object-contain object-cover"
              />
            </motion.div>
          </div>
        </div>
      )}
      
      {article.slug === 'ia-em-times-de-tecnologia-mais-valor-menos-esforco-parte-1' && (
        <div className="pb-6 md:pb-12 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg md:rounded-xl overflow-hidden border border-border"
            >
              <img 
                src="/content/blog/ia-em-times-de-tecnologia-mais-valor-menos-esforco-parte-1/capa.png"
                alt="Capa do artigo - IA em Times de Tecnologia"
                className="w-full h-auto md:max-h-[60vh] md:object-contain object-cover"
              />
            </motion.div>
          </div>
        </div>
      )}
      
      {article.slug === 'como-ia-esta-revolucionando-engenharia-de-software-mcp' && (
        <div className="pb-6 md:pb-12 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg md:rounded-xl overflow-hidden border border-border"
            >
              <img 
                src="/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/capa.png"
                alt="Capa do artigo - IA e MCP na Engenharia de Software"
                className="w-full h-auto md:max-h-[60vh] md:object-contain object-cover"
              />
            </motion.div>
          </div>
        </div>
      )}
      
      {article.slug === 'conversando-com-ia-da-forma-certa-engenharia-de-prompt' && (
        <div className="pb-6 md:pb-12 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg md:rounded-xl overflow-hidden border border-border"
            >
              <img 
                src="/content/blog/conversando-com-ia-da-forma-certa-engenharia-de-prompt/capa.png"
                alt="Capa do artigo - Engenharia de Prompt"
                className="w-full h-auto md:max-h-[60vh] md:object-contain object-cover"
              />
            </motion.div>
          </div>
        </div>
      )}
      
      {article.slug === 'agentes-de-ia-revolucao-silenciosa' && (
        <div className="pb-6 md:pb-12 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg md:rounded-xl overflow-hidden border border-border"
            >
              <img 
                src="/content/blog/agentes-de-ia-revolucao-silenciosa/capa.png"
                alt="Capa do artigo - Agentes de IA"
                className="w-full h-auto md:max-h-[60vh] md:object-contain object-cover"
              />
            </motion.div>
          </div>
        </div>
      )}
      
      {article.slug === 'kwanza-agent-primeira-sprint' && (
        <div className="pb-6 md:pb-12 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg md:rounded-xl overflow-hidden border border-border"
            >
              <img 
                src="https://media.licdn.com/dms/image/v2/D4D12AQFhNebaEJEm_w/article-cover_image-shrink_720_1280/B4DZefYGYvGkAM-/0/1750725591022?e=2147483647&v=beta&t=1BCGcJR0QqkPDeTT-NeAlpPdH7J0ZRuyaMmzPELh17Y"
                alt="Capa do artigo - Kwanza Agent"
                className="w-full h-auto md:max-h-[60vh] md:object-contain object-cover"
              />
            </motion.div>
          </div>
        </div>
      )}
      
      {article.slug === 'da-resposta-ao-raciocinio-ia-que-pensa-em-voz-alta' && (
        <div className="pb-6 md:pb-12 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg md:rounded-xl overflow-hidden border border-border"
            >
              <img 
                src="/content/blog/da-resposta-ao-raciocinio-ia-que-pensa-em-voz-alta/capa.png"
                alt="Capa do artigo - Da Resposta ao Raciocínio"
                className="w-full h-auto md:max-h-[60vh] md:object-contain object-cover"
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="pb-12 md:pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect p-4 md:p-8 lg:p-12 rounded-xl border border-border"
          >
            <div className="prose prose-sm md:prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-li:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-em:text-foreground prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground">
              <ReactMarkdown 
                components={{
                  img: ({ src, alt }) => (
                    <div className="my-4 md:my-12 flex justify-center">
                      <img 
                        src={src} 
                        alt={alt} 
                        className="w-full md:w-[90%] h-auto md:max-h-[70vh] md:object-contain rounded-lg border border-border shadow-lg"
                      />
                    </div>
                  )
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Back to Blog Footer */}
      <div className="pb-12 md:pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              Ver todos os artigos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArticlePage