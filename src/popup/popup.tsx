import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { PieChart } from '@mui/x-charts/PieChart'

interface WatchTimeData {
  [channel: string]: number
}

const App: React.FC = () => {
  const [watchTimeData, setWatchTimeData] = useState<WatchTimeData>({})
  const [loading, setLoading] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    loadWatchTimeData()
  }, [])

  const loadWatchTimeData = async () => {
    try {
      const result = await chrome.storage.sync.get('watchTimeData')
      setWatchTimeData(result.watchTimeData || {})
    } catch (error) {
      console.error('Error loading watch time data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearClick = () => {
    if (!showConfirm) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000) // Reset after 3 seconds
    } else {
      clearWatchTimeData()
    }
  }

  const clearWatchTimeData = async () => {
    try {
      await chrome.storage.sync.set({ watchTimeData: {} })
      setWatchTimeData({})
      setShowConfirm(false)
      console.log('Watch time data cleared')
    } catch (error) {
      console.error('Error clearing watch time data:', error)
    }
  }

  // Transform data for pie chart (sorted by watch time)
  const pieChartData = Object.entries(watchTimeData)
    .sort(([,a], [,b]) => b - a)
    .map(([channel, seconds], index) => ({
      id: index,
      value: seconds,
      label: channel
    }))

  // Get top 10 channels sorted by watch time
  const topChannels = Object.entries(watchTimeData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>YouTube Live Tracker</h1>
        </div>
        <div className="content">
          <p style={{ color: '#ffffff', textAlign: 'center' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (pieChartData.length === 0) {
    return (
      <div className="container">
        <div className="header">
          <h1>YouTube Live Tracker</h1>
        </div>
        <div className="content">
          <p style={{ color: '#ffffff', textAlign: 'center' }}>No watch time data yet.<br />Watch some streams to start tracking.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>YouTube Live Tracker</h1>
      </div>
      
      <div className="content">
        <PieChart
          series={[
            {
              data: pieChartData,
              valueFormatter: (value) => formatTime(value.value),
              highlightScope: { fade: 'global', highlight: 'item' }
            },
          ]}
          onHighlightChange={(highlightedItem) => {
            setHoveredItem(highlightedItem?.dataIndex ?? null)
          }}
          tooltip={{ trigger: 'item' }}
					{...pieParams}
        />
        
        <div className="top-channels">
          <div className="channels-header">
            <h3>Top 10 Channels</h3>
            <button onClick={handleClearClick} className="clear-btn-small">
              {showConfirm ? 'Are you sure?' : 'Clear'}
            </button>
          </div>
          <div className="channel-list">
            {topChannels.map(([channel, seconds], index) => {
              const isHighlighted = hoveredItem === index
              return (
                <div 
                  key={channel} 
                  className={`channel-item ${isHighlighted ? 'highlighted' : ''}`}
                >
                  <span className="rank">#{index + 1}</span>
                  <span className="channel-name">{channel}</span>
                  <span className="watch-time">{formatTime(seconds)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}

const pieParams = {
	width: 280,
  height: 200,
	hideLegend: true,
}
