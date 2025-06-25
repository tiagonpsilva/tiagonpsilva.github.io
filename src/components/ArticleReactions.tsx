import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, ThumbsUp } from 'lucide-react'
import { getArticleStats, addReaction, getUserReaction, formatViews } from '@/lib/analytics'

interface ArticleReactionsProps {
  articleSlug: string
}

const reactionIcons = {
  like: ThumbsUp
}

const reactionLabels = {
  like: 'Curtir'
}

const reactionColors = {
  like: 'text-blue-500 hover:text-blue-600'
}

const ArticleReactions: React.FC<ArticleReactionsProps> = ({ articleSlug }) => {
  const [stats, setStats] = useState(getArticleStats(articleSlug))
  const [userReaction, setUserReaction] = useState<string | null>(null)

  useEffect(() => {
    setUserReaction(getUserReaction(articleSlug))
  }, [articleSlug])

  const handleReaction = (reactionType: keyof typeof reactionIcons) => {
    const added = addReaction(articleSlug, reactionType)
    setStats(getArticleStats(articleSlug))
    setUserReaction(added ? reactionType : null)
  }


  return (
    <div className="space-y-6">
      {/* Views Counter */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Eye className="w-4 h-4" />
        <span className="text-sm">
          {formatViews(stats.views)} visualizações
        </span>
      </div>

      {/* Reactions */}
      <div className="space-y-4">

        <div className="flex flex-wrap gap-3">
          {Object.entries(reactionIcons).map(([key, Icon]) => {
            const reactionKey = key as keyof typeof reactionIcons
            const count = stats.reactions[reactionKey]
            const isActive = userReaction === key
            
            return (
              <motion.button
                key={key}
                onClick={() => handleReaction(reactionKey)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
                  ${isActive 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : reactionColors[reactionKey]}`} />
                <span className="text-sm font-medium">
                  {reactionLabels[reactionKey]}
                </span>
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    {count}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        {userReaction && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground"
          >
            Obrigado pelo seu feedback! 🙏
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default ArticleReactions