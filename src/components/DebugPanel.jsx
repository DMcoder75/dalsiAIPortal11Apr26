import { useState } from 'react'
import { Bug } from 'lucide-react'
import LogViewer from './LogViewer'
import logger from '../lib/logger'

export default function DebugPanel() {
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)

  if (isMinimized) {
    return (
      <>
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition z-40"
          title="Open Debug Panel"
        >
          <Bug className="w-6 h-6" />
        </button>

        <LogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} />
      </>
    )
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-40 w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">Debug Panel</span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white text-xl"
          >
            −
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-sm">
          {/* Quick Stats */}
          <div className="bg-gray-800 rounded p-3 space-y-2">
            <div className="text-gray-400">Quick Stats</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Logs:</span>
                <span className="text-white font-bold">{logger.getLogs().length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Errors:</span>
                <span className="text-red-400 font-bold">{logger.getLogsByLevel('ERROR').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Warnings:</span>
                <span className="text-yellow-400 font-bold">{logger.getLogsByLevel('WARN').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current URL:</span>
                <span className="text-gray-300 text-xs truncate">{window.location.pathname}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => setIsLogViewerOpen(true)}
              className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition"
            >
              View Full Logs
            </button>
            <button
              onClick={() => {
                const recentLogs = logger.getRecentLogs(5)
                console.log('Recent logs (last 5 min):', recentLogs)
              }}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition"
            >
              Show Recent Logs
            </button>
            <button
              onClick={() => {
                logger.exportLogsAsJSON()
              }}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition"
            >
              Export as JSON
            </button>
            <button
              onClick={() => {
                logger.clearLogs()
                alert('Logs cleared!')
              }}
              className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition"
            >
              Clear Logs
            </button>
          </div>

          {/* Info */}
          <div className="bg-gray-800 rounded p-2 text-xs text-gray-400 border border-gray-700">
            <div className="mb-1 font-bold text-gray-300">Tips:</div>
            <ul className="space-y-1">
              <li>• Access logs via: <code className="bg-gray-900 px-1 rounded">window.__logger</code></li>
              <li>• All console.log calls are captured</li>
              <li>• Logs persist across page reloads</li>
              <li>• Max 1000 logs stored</li>
            </ul>
          </div>
        </div>
      </div>

      <LogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} />
    </>
  )
}
