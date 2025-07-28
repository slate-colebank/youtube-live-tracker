// Content script for tracking YouTube live stream watch time

console.log('YouTube Live Tracker: Content script loaded');

// Check for URL changes using MutationObserver
let currentUrl = window.location.href;
let currentChannelName: String | null = null;
let time: Date = new Date();

// Check if the current page is a video page
function checkUrl(): boolean {
	return currentUrl.includes('/watch?');
}

// Get the channel name of the current page
function getChannelName(): string {
	// Target the channel name in upload-info section
	const channelLink = document.querySelector('#upload-info ytd-channel-name #text a');
	return channelLink?.textContent?.trim() || 'Unknown Channel';
}

// Log the last channel watched
function log(): void {
	console.log('logging...');

	// log previous channel
	if (currentChannelName === null) {
		console.log('nothing to log');
	} else {
		let startTime = time;
		let endTime = new Date();
		let timeWatched = endTime.getTime() - startTime.getTime();
		if (timeWatched >= 100000) {
			// Log the time watched here
			console.log('Watched ', currentChannelName, ' for ', timeWatched);
		}
	}

	// setup next channel
	if (checkUrl()) {
		currentChannelName = getChannelName();
	} else {
		currentChannelName = null;
	}
}

// Log current channel every 10 seconds
function logCurrentChannel(): void {
	currentUrl = window.location.href;
	
	if (checkUrl()) {
		const detectedChannel = getChannelName();
		console.log(`Current channel: ${detectedChannel}`);
	} else {
		console.log('Not on video page');
	}
}

// Start the 10-second interval logging
setInterval(logCurrentChannel, 10000);

// Also run immediately on load
setTimeout(logCurrentChannel, 1000);
