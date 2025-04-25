// Website Unblocker Script

// Define the x-frame-bypass custom element
customElements.define('x-frame-bypass', class extends HTMLIFrameElement {
        constructor () {
                super()
                // Keep track of navigation history
                this.navigationHistory = [];
                this.currentHistoryIndex = -1;
        }
        connectedCallback () {
                // Only try to load if src is not empty
                if (this.src && this.src.trim() !== '') {
                        this.load(this.src)
                        this.src = ''
                }
                this.sandbox = '' + this.sandbox || 'allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation' // all except allow-top-navigation
        }
        
        // Method to go back in the custom navigation history
        goBack() {
                if (this.currentHistoryIndex > 0) {
                        this.currentHistoryIndex--;
                        const previousUrl = this.navigationHistory[this.currentHistoryIndex];
                        
                        // Load the previous URL without adding it to history again
                        this.loadWithoutHistoryTracking(previousUrl);
                        return true;
                }
                return false;
        }
        
        // Load URL without tracking in history (for back navigation)
        loadWithoutHistoryTracking(url, options) {
                if (!url || !url.startsWith('http'))
                        throw new Error(`X-Frame-Bypass src ${url} does not start with http(s)://`)
                
                console.log('X-Frame-Bypass loading (without history tracking):', url)
                
                this.srcdoc = `<html>
<head>
        <style>
        .loader {
                position: absolute;
                top: calc(50% - 25px);
                left: calc(50% - 25px);
                width: 50px;
                height: 50px;
                background-color: #333;
                border-radius: 50%;  
                animation: loader 1s infinite ease-in-out;
        }
        @keyframes loader {
                0% {
                transform: scale(0);
                }
                100% {
                transform: scale(1);
                opacity: 0;
                }
        }
        </style>
</head>
<body>
        <div class="loader"></div>
</body>
</html>`
                return this.fetchProxy(url, options, 0).then(res => res.text()).then(data => {
                        if (data) {
                                this.srcdoc = data.replace(/<head([^>]*)>/i, `<head$1>
        <base href="${url}">
        <script>
        // X-Frame-Bypass navigation event handlers
        document.addEventListener('click', e => {
                if (frameElement && document.activeElement && document.activeElement.href) {
                        e.preventDefault()
                        frameElement.load(document.activeElement.href)
                }
        })
        document.addEventListener('submit', e => {
                if (frameElement && document.activeElement && document.activeElement.form && document.activeElement.form.action) {
                        e.preventDefault()
                        if (document.activeElement.form.method === 'post')
                                frameElement.load(document.activeElement.form.action, {method: 'post', body: new FormData(document.activeElement.form)})
                        else
                                frameElement.load(document.activeElement.form.action + '?' + new URLSearchParams(new FormData(document.activeElement.form)))
                }
        })
        </script>`)
                        }
                }).catch(e => {
                        console.error('Cannot load X-Frame-Bypass:', e);
                        // Show error in the status message
                        const statusMessage = document.getElementById('status-message');
                        if (statusMessage) {
                                statusMessage.textContent = `Error loading website: ${e.message || 'Unknown error'}`;
                                statusMessage.className = 'status-message error';
                                statusMessage.style.display = 'block';
                        }
                })
        }
        load (url, options) {
                if (!url || !url.startsWith('http'))
                        throw new Error(`X-Frame-Bypass src ${url} does not start with http(s)://`)
                
                console.log('X-Frame-Bypass loading:', url)
                
                // Add to navigation history
                if (this.currentHistoryIndex >= 0 && this.navigationHistory[this.currentHistoryIndex] === url) {
                    // Don't add duplicate entries for the same URL
                    console.log('Same URL, not adding to history');
                } else {
                    // If we navigated back and then to a new page, remove forward history
                    if (this.currentHistoryIndex >= 0 && this.currentHistoryIndex < this.navigationHistory.length - 1) {
                        this.navigationHistory = this.navigationHistory.slice(0, this.currentHistoryIndex + 1);
                    }
                    
                    // Add current URL to history
                    this.navigationHistory.push(url);
                    this.currentHistoryIndex = this.navigationHistory.length - 1;
                    console.log('Navigation history:', this.navigationHistory);
                }
                
                this.srcdoc = `<html>
<head>
        <style>
        .loader {
                position: absolute;
                top: calc(50% - 25px);
                left: calc(50% - 25px);
                width: 50px;
                height: 50px;
                background-color: #333;
                border-radius: 50%;  
                animation: loader 1s infinite ease-in-out;
        }
        @keyframes loader {
                0% {
                transform: scale(0);
                }
                100% {
                transform: scale(1);
                opacity: 0;
                }
        }
        </style>
</head>
<body>
        <div class="loader"></div>
</body>
</html>`
                this.fetchProxy(url, options, 0).then(res => res.text()).then(data => {
                        if (data) {
                                // Process the HTML content
                                this.srcdoc = data.replace(/<head([^>]*)>/i, `<head$1>
        <base href="${url}">
        <script>
        // X-Frame-Bypass navigation event handlers
        document.addEventListener('click', e => {
                if (frameElement && document.activeElement && document.activeElement.href) {
                        e.preventDefault()
                        frameElement.load(document.activeElement.href)
                }
        })
        document.addEventListener('submit', e => {
                if (frameElement && document.activeElement && document.activeElement.form && document.activeElement.form.action) {
                        e.preventDefault()
                        if (document.activeElement.form.method === 'post')
                                frameElement.load(document.activeElement.form.action, {method: 'post', body: new FormData(document.activeElement.form)})
                        else
                                frameElement.load(document.activeElement.form.action + '?' + new URLSearchParams(new FormData(document.activeElement.form)))
                }
        })
        </script>`);
                                
                                // Update status message to success
                                const statusMessage = document.getElementById('status-message');
                                if (statusMessage) {
                                    statusMessage.textContent = 'Website loaded successfully!';
                                    statusMessage.className = 'status-message success';
                                    statusMessage.style.display = 'block';
                                    
                                    // Hide success message after 3 seconds
                                    setTimeout(() => {
                                        statusMessage.style.display = 'none';
                                    }, 3000);
                                }
                        } else {
                                throw new Error('No data received from the server');
                        }
                }).catch(e => {
                        console.error('Cannot load X-Frame-Bypass:', e);
                        
                        // Show error in the frame
                        this.srcdoc = `<html>
<head>
        <style>
        body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f8f9fa;
                color: #343a40;
                text-align: center;
                padding: 0 20px;
        }
        .error-icon {
                font-size: 48px;
                color: #dc3545;
                margin-bottom: 20px;
        }
        h2 {
                margin-bottom: 10px;
        }
        p {
                margin-bottom: 20px;
                color: #6c757d;
                max-width: 600px;
        }
        .try-again {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
        }
        .try-again:hover {
                background-color: #0069d9;
        }
        .error-details {
                margin-top: 20px;
                padding: 15px;
                background-color: #f1f1f1;
                border-radius: 4px;
                font-size: 14px;
                color: #666;
                max-width: 80%;
                overflow-wrap: break-word;
        }
        </style>
</head>
<body>
        <div class="error-icon">⚠️</div>
        <h2>Unable to Load Website</h2>
        <p>The website could not be loaded through our proxy. This could be due to the website blocking proxy access or having strong anti-iframe measures.</p>
        <p>Error: ${e.message || 'Unknown error'}</p>
        <button class="try-again" onclick="window.parent.location.reload()">Try Again</button>
        <div class="error-details">
                Target URL: ${url}<br>
                Time: ${new Date().toLocaleString()}
        </div>
</body>
</html>`;
                        
                        // Show error in the status message
                        const statusMessage = document.getElementById('status-message');
                        if (statusMessage) {
                                statusMessage.textContent = `Error loading website: ${e.message || 'Unknown error'}`;
                                statusMessage.className = 'status-message error';
                                statusMessage.style.display = 'block';
                        }
                })
        }
        fetchProxy (url, options, i) {
                const proxy = [
                        'https://api.allorigins.win/raw?url=',
                        'https://thingproxy.freeboard.io/fetch/',
                        'https://corsproxy.io/?',
                        'https://cors-anywhere.herokuapp.com/',
                        'https://cors.bridged.cc/',
                        'https://api.codetabs.com/v1/proxy/?quest=',
                        'https://jsonp.afeld.me/?url='
                ]
                return fetch(proxy[i] + url, options).then(res => {
                        if (!res.ok)
                                throw new Error(`${res.status} ${res.statusText}`);
                        return res
                }).catch(error => {
                        if (i === proxy.length - 1)
                                throw error
                        return this.fetchProxy(url, options, i + 1)
                })
        }
}, {extends: 'iframe'})

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the elements
    const urlInput = document.getElementById('website-url');
    const loadButton = document.getElementById('load-btn');
    const frame = document.getElementById('unblocker-frame');
    const statusMessage = document.getElementById('status-message');
    const protocolWarning = document.getElementById('protocol-warning');
    const frameContainer = document.getElementById('frame-container');
    const fullscreenButton = document.getElementById('fullscreen-btn');
    const backButton = document.getElementById('back-btn');
    const shareButton = document.getElementById('share-btn');
    const shareContainer = document.getElementById('share-container');
    const shareUrlInput = document.getElementById('share-url');
    const copyButton = document.getElementById('copy-btn');
    const shareMessage = document.getElementById('share-message');

    // Initially hide the frame until a website is loaded
    frameContainer.style.display = 'none';

    // Function to validate and fix URL
    function isValidUrl(url) {
        // If URL doesn't start with http:// or https://, return false
        if (!url.match(/^https?:\/\//i)) {
            return false;
        }
        
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch (error) {
            return false;
        }
    }
    
    // Function to fix URL by adding https:// if missing
    function fixUrl(url) {
        if (!url) return url;
        
        // If URL already starts with http:// or https://, return as is
        if (url.match(/^https?:\/\//i)) {
            return url;
        }
        
        // Add https:// to the URL
        return 'https://' + url;
    }

    // Function to load website
    function loadWebsite() {
        // Get the URL and auto-fix it if needed
        let url = urlInput.value.trim();
        
        // Hide any previous status messages
        statusMessage.style.display = 'none';
        statusMessage.className = 'status-message';
        
        // Hide protocol warning
        protocolWarning.style.display = 'none';
        
        // Validate URL
        if (!url) {
            statusMessage.textContent = 'Please enter a URL';
            statusMessage.classList.add('error');
            statusMessage.style.display = 'block';
            return;
        }
        
        // If URL doesn't have http/https, fix it and update the input
        if (!isValidUrl(url)) {
            url = fixUrl(url);
            urlInput.value = url; // Update the input field with the fixed URL
            
            // If it's still not valid after fixing
            if (!isValidUrl(url)) {
                protocolWarning.style.display = 'block';
                return;
            }
        }
        
        // Show loading status
        statusMessage.textContent = 'Loading website...';
        statusMessage.classList.add('loading');
        statusMessage.style.display = 'block';
        
        // Show the frame container
        frameContainer.style.display = 'block';
        
        try {
            // Load the website
            frame.load(url);
            // Status updates are handled by the custom element
        } catch (error) {
            // Show error
            statusMessage.textContent = `Error: ${error.message}`;
            statusMessage.classList.remove('loading');
            statusMessage.classList.add('error');
        }
    }

    // Add event listener to the load button
    loadButton.addEventListener('click', loadWebsite);
    
    // Add event listener for the Enter key in the input field
    urlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            loadWebsite();
        }
    });
    
    // Input validation feedback
    urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        if (url && !isValidUrl(url)) {
            protocolWarning.style.display = 'block';
        } else {
            protocolWarning.style.display = 'none';
        }
    });
    
    // Fullscreen functionality
    let isFullscreen = false;
    
    // Toggle fullscreen mode
    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        
        if (isFullscreen) {
            // Enter fullscreen
            frameContainer.classList.add('fullscreen');
            fullscreenButton.classList.add('active');
            fullscreenButton.innerHTML = '<i class="fullscreen-icon"></i> Exit Fullscreen';
            // Handle escape key to exit fullscreen
            document.addEventListener('keydown', exitFullscreenOnEscape);
        } else {
            // Exit fullscreen
            frameContainer.classList.remove('fullscreen');
            fullscreenButton.classList.remove('active');
            fullscreenButton.innerHTML = '<i class="fullscreen-icon"></i> Fullscreen';
            // Remove escape key listener
            document.removeEventListener('keydown', exitFullscreenOnEscape);
        }
    }
    
    // Exit fullscreen when Escape key is pressed
    function exitFullscreenOnEscape(event) {
        if (event.key === 'Escape' && isFullscreen) {
            toggleFullscreen();
        }
    }
    
    // Add click event listener to fullscreen button
    fullscreenButton.addEventListener('click', toggleFullscreen);
    
    // Back button functionality
    function goBack() {
        try {
            // First try using our custom history navigation
            if (frame.navigationHistory && frame.navigationHistory.length > 1) {
                const success = frame.goBack();
                
                if (success) {
                    // Show a brief "Going back..." message
                    statusMessage.textContent = 'Going back...';
                    statusMessage.className = 'status-message loading';
                    statusMessage.style.display = 'block';
                    
                    setTimeout(() => {
                        statusMessage.style.display = 'none';
                    }, 1500);
                    return;
                }
            }
            
            // Fall back to standard history if our custom method failed
            const iframeWindow = frame.contentWindow;
            if (iframeWindow && iframeWindow.history && iframeWindow.history.length > 1) {
                iframeWindow.history.back();
                
                // Show a brief "Going back..." message
                statusMessage.textContent = 'Going back...';
                statusMessage.className = 'status-message loading';
                statusMessage.style.display = 'block';
                
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 1500);
            } else {
                // If no history, show a message
                statusMessage.textContent = 'No previous page in history';
                statusMessage.className = 'status-message';
                statusMessage.style.display = 'block';
                
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 1500);
            }
        } catch (error) {
            console.error('Error navigating back:', error);
            // Show error message
            statusMessage.textContent = 'Unable to navigate back';
            statusMessage.className = 'status-message error';
            statusMessage.style.display = 'block';
            
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 1500);
        }
    }
    
    // Add click event listener to back button
    backButton.addEventListener('click', goBack);
    
    // Share functionality
    // Initially hide the share container
    shareContainer.style.display = 'none';
    
    // Function to generate a shareable link
    function generateShareableLink() {
        const url = urlInput.value.trim();
        
        // Validate URL
        if (!url) {
            statusMessage.textContent = 'Please enter a URL to share';
            statusMessage.classList.add('error');
            statusMessage.style.display = 'block';
            return;
        }
        
        if (!isValidUrl(url)) {
            protocolWarning.style.display = 'block';
            return;
        }
        
        // Get the current location
        const currentLocation = window.location.href.split('?')[0]; // Remove any existing query parameters
        
        // Create the shareable URL with the target website as a parameter
        const shareableUrl = `${currentLocation}?url=${encodeURIComponent(url)}`;
        
        // Display the shareable link
        shareUrlInput.value = shareableUrl;
        shareContainer.style.display = 'block';
        shareMessage.textContent = '';
    }
    
    // Function to copy the shareable link to clipboard
    function copyShareableLink() {
        // Select the text in the input
        shareUrlInput.select();
        shareUrlInput.setSelectionRange(0, 99999); // For mobile devices
        
        // Copy the text to clipboard
        document.execCommand('copy');
        
        // Show success message
        shareMessage.textContent = 'Link copied to clipboard!';
        
        // Clear the selection
        window.getSelection().removeAllRanges();
        
        // Hide message after 3 seconds
        setTimeout(() => {
            shareMessage.textContent = '';
        }, 3000);
    }
    
    // Check if a URL is provided in the query parameters on page load
    function loadUrlFromQueryParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlParam = urlParams.get('url');
        
        if (urlParam) {
            try {
                const decodedUrl = decodeURIComponent(urlParam);
                if (isValidUrl(decodedUrl)) {
                    urlInput.value = decodedUrl;
                    loadWebsite();
                }
            } catch (error) {
                console.error('Error loading URL from query parameter:', error);
            }
        }
    }
    
    // Add event listeners for share functionality
    shareButton.addEventListener('click', generateShareableLink);
    copyButton.addEventListener('click', copyShareableLink);
    
    // Load URL from query parameter if present
    loadUrlFromQueryParam();
});
