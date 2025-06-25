import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Tag, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Article } from '@/types/blog'
import { getAllArticles } from '@/lib/articles'
import { useTheme } from '@/contexts/ThemeContext'

const BlogPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const { setDarkModeForBlog } = useTheme()

  // Função para obter a imagem de capa baseada no slug
  const getCoverImage = (slug: string): string => {
    switch (slug) {
      case 'acelerando-entrega-de-valor-com-ia-sagemaker-bedrock-amazon-q':
        return '/content/blog/acelerando-entrega-de-valor-com-ia-sagemaker-bedrock-amazon-q/capa.png'
      case 'ia-em-times-de-tecnologia-mais-valor-menos-esforco-parte-1':
        return '/content/blog/ia-em-times-de-tecnologia-mais-valor-menos-esforco-parte-1/capa.png'
      case 'como-ia-esta-revolucionando-engenharia-de-software-mcp':
        return '/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/capa.png'
      case 'conversando-com-ia-da-forma-certa-engenharia-de-prompt':
        return '/content/blog/conversando-com-ia-da-forma-certa-engenharia-de-prompt/capa.png'
      case 'agentes-de-ia-revolucao-silenciosa':
        return '/content/blog/agentes-de-ia-revolucao-silenciosa/capa.png'
      case 'da-resposta-ao-raciocinio-ia-que-pensa-em-voz-alta':
        return '/content/blog/da-resposta-ao-raciocinio-ia-que-pensa-em-voz-alta/capa.png'
      case 'kwanza-agent-primeira-sprint':
        return 'https://media.licdn.com/dms/image/v2/D4D12AQFhNebaEJEm_w/article-cover_image-shrink_720_1280/B4DZefYGYvGkAM-/0/1750725591022?e=2147483647&v=beta&t=1BCGcJR0QqkPDeTT-NeAlpPdH7J0ZRuyaMmzPELh17Y'
      default:
        return '/content/blog/default-cover.png'
    }
  }

  useEffect(() => {
    // Ativar dark mode quando entrar no blog (apenas uma vez)
    setDarkModeForBlog()
    
    const fetchArticles = async () => {
      try {
        const articlesData = await getAllArticles()
        setArticles(articlesData)
      } catch (error) {
        console.error('Erro ao carregar artigos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, []) // Remover setDarkModeForBlog das dependências

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

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Hero Section */}
      <section className="pt-24 pb-12 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-8 py-8"
          >
            {/* Logo & Title */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex-shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-600/30 rounded-3xl blur-2xl"></div>
                <img 
                  src="/bantu01.png" 
                  alt="Bantu Digital Logo" 
                  className="relative w-40 h-40 object-contain drop-shadow-2xl"
                />
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Bantu Digital
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Insights sobre <span className="text-primary font-semibold">IA</span>, 
                  <span className="text-primary font-semibold"> Dados</span>, 
                  <span className="text-primary font-semibold"> Arquitetura</span> e 
                  <span className="text-primary font-semibold"> Engenharia</span> de Software
                </p>
              </motion.div>

              {/* Topic Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                {[
                  { label: "IA", icon: "🧠", color: "from-blue-500 to-purple-600" },
                  { label: "Dados", icon: "📊", color: "from-green-500 to-blue-500" },
                  { label: "Arquitetura", icon: "🏗️", color: "from-purple-500 to-pink-500" },
                  { label: "Engenharia", icon: "⚙️", color: "from-orange-500 to-red-500" }
                ].map((topic, index) => (
                  <motion.div
                    key={topic.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <div className={`bg-gradient-to-r ${topic.color} p-[1px] rounded-full group-hover:shadow-lg transition-all duration-300`}>
                      <div className="bg-background/95 backdrop-blur-sm px-5 py-2.5 rounded-full group-hover:bg-background/90 transition-all duration-300">
                        <span className="text-sm font-semibold text-foreground flex items-center gap-2.5">
                          <span className="text-lg">{topic.icon}</span>
                          {topic.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="hidden md:flex flex-col items-center gap-3 flex-shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-purple-600/40 rounded-full blur-lg"></div>
                <div className="relative bg-background/90 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center border border-primary/30">
                  <span className="text-2xl font-bold text-primary">7</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-center font-medium">
                Artigos<br/>Publicados
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <div className="pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {articles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50/80 dark:bg-background/80 backdrop-blur-sm p-8 rounded-xl border border-border hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="flex gap-6">
                  {/* Article Cover Image */}
                  <div className="flex-shrink-0">
                    <Link to={`/blog/${article.slug}`}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-48 h-36 rounded-lg overflow-hidden border border-border/50 group-hover:border-primary/30 transition-all duration-300"
                      >
                        <img 
                          src={getCoverImage(article.slug)}
                          alt={`Capa do artigo: ${article.title}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/content/blog/default-cover.png';
                          }}
                        />
                      </motion.div>
                    </Link>
                  </div>

                  {/* Article Content */}
                  <div className="flex-1 flex flex-col space-y-4">
                    {/* Article Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link 
                          to={`/blog/${article.slug}`}
                          className="block group-hover:text-primary transition-colors duration-200"
                        >
                          <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h2>
                        </Link>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Article Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.publishedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime} min de leitura</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Read More */}
                    <div className="pt-4">
                      <Link
                        to={`/blog/${article.slug}`}
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Ler artigo completo
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Empty State */}
          {articles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg">
                Nenhum artigo encontrado. Em breve novos conteúdos!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogPage