import React from 'react'
import { motion } from 'framer-motion'
import { UserCheck, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const AuthStatusBadge: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2"
    >
      {isAuthenticated && user ? (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-3 py-1.5 text-sm"
        >
          <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300 font-medium">
            Conectado
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-sm"
        >
          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            Visitante
          </span>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </motion.div>
      )}

      {/* Mobile version - just the dot */}
      <div className="md:hidden">
        {isAuthenticated ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">On</span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-500 font-medium">Off</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default AuthStatusBadge