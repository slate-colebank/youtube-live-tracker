// Content script for tracking YouTube live stream watch time

console.log('YouTube Live Tracker: Content script loaded');

const interval = 10000

// Check for URL changes using MutationObserver
let currentUrl = window.location.href;
let currentChannelName: String | null = null;
let time: Date = new Date();

// Check if the current page is a video page
function checkUrl(): boolean {
	// check if we are not on a video page
	if (!currentUrl.includes('/watch?')) {
		console.log('Not on video page');
		return false;
	}

	// check if there is a live video playing by looking for live chat iframe
	const liveChatIframe = document.querySelector('#chat-container ytd-live-chat-frame #chatframe');
	if (!liveChatIframe) {
		console.log("not a live video");
		return false;
	}
	
	// check if the live video is actively playing (not paused)
	const player = document.querySelector('.html5-video-player');
	const isPlaying = player?.classList.contains('playing-mode');
	
	if (isPlaying) {
		console.log("watching live video (playing)");
		return true;
	} else {
		console.log("live video is paused");
		return false;
	}
}

// Get the channel name of the current page
function getChannelName(): string {
	// Target the channel name in upload-info section
	const channelLink = document.querySelector('#upload-info ytd-channel-name #text a');
	return channelLink?.textContent?.trim() || 'Unknown Channel';
}

// Log the last channel watched
async function logWatchTime(channelName: string): Promise<void> {
	console.log('logging...');

	const timeWatched = interval / 1000; // Convert to seconds

	try {
		const result = await chrome.storage.sync.get('watchTimeData');
		const watchTimeData = result.watchTimeData || {};

		watchTimeData[channelName] = (watchTimeData[channelName] || 0) + timeWatched;

		await chrome.storage.sync.set({ watchTimeData });
		console.log(`Saved ${timeWatched}s for ${channelName} (Total: ${watchTimeData[channelName]}s)`);
	} catch (error) {
		console.error('Error saving watch time:', error);
	}
}

// Log current channel every 10 seconds
function logCurrentChannel(): void {
	currentUrl = window.location.href;
	
	if (checkUrl()) {
		const detectedChannel = getChannelName();
		logWatchTime(detectedChannel);
		console.log(`Current channel: ${detectedChannel}`);
	} else {
		console.log('not logging')
	}
}

setInterval(logCurrentChannel, interval);

setTimeout(logCurrentChannel, 1000);
