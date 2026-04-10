/**
 * FrequentQueries Component
 * Displays frequently asked questions/popular prompts from the API
 * Shows in the left sidebar below conversations
 */

import React, { useState, useEffect } from 'react'
import { Sparkles, Loader } from 'lucide-react'
import logger from '../lib/logger'

export const FrequentQueries = ({ onQuerySelect }) => {
  console.log('📊 [FREQUENT_QUERIES] Component mounted!')
  
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('📊 [FREQUENT_QUERIES] useEffect called')
    fetchFrequentQueries()
  }, [])

  const fetchFrequentQueries = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📊 [FREQUENT_QUERIES] Starting fetch...')
      
      const response = await fetch('https://api.neodalsi.com/api/frequent-queries?limit=5', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('📊 [FREQUENT_QUERIES] Response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch frequent queries: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 [FREQUENT_QUERIES] Fetched data:', data)
      console.log('📊 [FREQUENT_QUERIES] Queries count:', data.frequent_queries?.length || 0)
      
      setQueries(data.frequent_queries || [])
    } catch (err) {
      console.error('❌ [FREQUENT_QUERIES] Error fetching queries:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  console.log('📊 [FREQUENT_QUERIES] Render - loading:', loading, 'queries:', queries?.length || 0)

  if (loading) {
    console.log('📊 [FREQUENT_QUERIES] Showing loading state')
    return (
      <div className="px-4 py-3 text-center">
        <Loader className="w-4 h-4 animate-spin mx-auto text-purple-400" />
      </div>
    )
  }

  if (!queries || queries.length === 0) {
    console.log('📊 [FREQUENT_QUERIES] No queries to display')
    return null
  }

  console.log('📊 [FREQUENT_QUERIES] Rendering', queries.length, 'queries')

  return (
    <div className="mt-6 px-3 py-4 border-t border-purple-500/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-xs font-semibold text-purple-300 tracking-wide uppercase">
          Popular Prompts ({queries.length})
        </h3>
      </div>

      {/* Queries List */}
      <div className="space-y-2">
        {queries.map((query, idx) => (
          <button
            key={idx}
            onClick={() => {
              logger.info('🔗 [FREQUENT_QUERIES] Selected query:', query.text)
              onQuerySelect(query.text)
            }}
            className="w-full text-left group relative overflow-hidden rounded-lg transition-all duration-200 hover:bg-purple-500/10"
            title={query.text}
          >
            {/* Content */}
            <div className="relative px-3 py-2 flex items-start gap-2">
              {/* Popularity Badge */}
              <div className="flex-shrink-0 mt-0.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors text-xs font-semibold text-purple-300">
                  {query.popularity || 0}
                </span>
              </div>

              {/* Query Text */}
              <p className="text-xs text-purple-200 group-hover:text-purple-100 transition-colors line-clamp-2 flex-1">
                {query.text}
              </p>
            </div>

            {/* Hover Border */}
            <div className="absolute inset-0 rounded-lg border border-purple-500/0 group-hover:border-purple-500/30 transition-colors pointer-events-none"></div>
          </button>
        ))}
      </div>


    </div>
  )
}

export default FrequentQueries
