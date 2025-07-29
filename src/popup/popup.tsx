import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { PieChart } from '@mui/x-charts/PieChart'

interface WatchTimeData {
  [channel: string]: number
}

const App: React.FC = () => {
  const [watchTimeData, setWatchTimeData] = useState<WatchTimeData>({})
  const [loading, setLoading] = useState(true)

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

  // Transform data for pie chart
  const pieChartData = Object.entries(watchTimeData).map(([channel, seconds], index) => ({
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
          <p style={{ color: '#ffffff', textAlign: 'center' }}>No watch time data yet.<br />Visit some YouTube videos to start tracking!</p>
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
            },
          ]}
					{...pieParams}
        />
        
        <div className="top-channels">
          <h3>Top 10 Channels</h3>
          <div className="channel-list">
            {topChannels.map(([channel, seconds], index) => (
              <div key={channel} className="channel-item">
                <span className="rank">#{index + 1}</span>
                <span className="channel-name">{channel}</span>
                <span className="watch-time">{formatTime(seconds)}</span>
              </div>
            ))}
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
