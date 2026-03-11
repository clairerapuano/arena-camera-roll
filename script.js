// Enter the Are.na channel slug here. It has to be an open or closed channel. Private channels are not supported.
let channel_title = 'camera-roll-nnn9n8atmm0';

// Are.na's base API url (V3 - V2 is deprecated)
const api = 'https://api.are.na/v3/channels/';

// Get grid element from index.html
const thumbs_el = document.querySelector('#thumbs');

// Create loading indicator
const loadingEl = document.createElement('div');
loadingEl.id = 'loading';
loadingEl.innerHTML = '<p>claire\'s camera roll is loading...</p>';
document.body.appendChild(loadingEl);

let allImages = [];
let uniqueUrls = new Set();

// Function to create and append thumbnail elements
// V3 API: item.type === 'Image', item.image has small/medium/large/square with .src
function createThumbnail(item) {
    const thumbUrl = item.image?.square?.src ?? item.image?.small?.src;
    const displayUrl = item.image?.large?.src ?? item.image?.medium?.src ?? item.image?.src;
    if (item.type === 'Image' && thumbUrl && displayUrl && !uniqueUrls.has(displayUrl)) {
        let thumb_el = document.createElement('div');
        thumb_el.classList.add('thumb');
        thumb_el.innerHTML = `<img src="${thumbUrl}" data-large="${displayUrl}" loading="lazy">`;
        thumb_el.classList.add('image');
        
        // Add click listener immediately for each thumbnail
        thumb_el.addEventListener('click', e => {
            currentImageIndex = Array.from(thumbs_el.children).indexOf(thumb_el);
            showImage(currentImageIndex);
        });
        
        thumbs_el.appendChild(thumb_el);
        uniqueUrls.add(displayUrl);
        allImages.push(item);
    }
}

async function fetchPage(page = 1, per = 50, retries = 3) {
    const url = `${api}${channel_title}/contents?page=${page}&per=${per}&sort=position_desc`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Skip delay on first request; short delay on subsequent to avoid rate limits
            if (page > 1) {
                await new Promise(resolve => setTimeout(resolve, 250));
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Cache-Control': 'no-cache',
                    'User-Agent': 'Mozilla/5.0 (compatible; CameraRoll/1.0)'
                }
            });
            
            if (response.status === 429) {
                const resetIn = response.headers.get('X-RateLimit-Reset');
                const waitMs = resetIn ? (parseInt(resetIn, 10) * 1000 - Date.now()) : 60000;
                console.warn('Rate limited. Waiting', Math.round(waitMs / 1000), 's before retry...');
                await new Promise(resolve => setTimeout(resolve, Math.min(waitMs, 60000)));
                continue;
            }
            
            if (!response.ok) {
                console.error("API request failed:", response.status, response.statusText);
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                return null;
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching page:', error);
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }
            return null;
        }
    }
    return null;
}

const PER_PAGE = 100;

function showError(msg) {
    loadingEl.innerHTML = `<p>${msg}</p><button id="retry-btn" style="margin-top:12px;padding:8px 16px;cursor:pointer;font-family:inherit;font-size:14px;background:rgb(155,221,164);color:#000;border:none;border-radius:4px;">Retry</button>`;
    document.getElementById('retry-btn').onclick = () => {
        allImages = [];
        uniqueUrls.clear();
        thumbs_el.innerHTML = '';
        loadingEl.innerHTML = '<p>claire\'s camera roll is loading...</p>';
        fetchAllContents();
    };
}

async function fetchAllContents() {
    console.log("Starting to fetch images from channel:", channel_title);
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        console.log(`Fetching page ${page}...`);
        const data = await fetchPage(page, PER_PAGE);
        
        // V3 API returns { data: [...], meta: { has_more_pages, ... } }
        const contents = data?.data ?? data?.contents;
        if (!data || !contents) {
            console.error("Invalid data returned from API:", data);
            showError('Couldn\'t load images. The channel may be private or the API is temporarily unavailable.');
            return;
        }
        
        console.log(`Got ${contents.length} items from API`);
        
        contents.forEach(block => {
            createThumbnail(block);
        });

        // Hide loading as soon as first images appear (don't wait for all pages)
        if (page === 1 && allImages.length > 0) {
            loadingEl.style.display = 'none';
        }

        if (page === 1 && contents.length > 0) {
            const firstImage = contents.find(b => b.type === 'Image' || b.class === 'Image');
            if (firstImage?.image) {
                const thumbUrl = firstImage.image.square?.src ?? firstImage.image.thumb?.url ?? firstImage.image.small?.src;
                if (thumbUrl) {
                    const favicon = document.createElement('link');
                    favicon.rel = 'icon';
                    favicon.href = thumbUrl;
                    document.head.appendChild(favicon);
                }
            }
        }
        
        const meta = data.meta;
        hasMore = meta?.has_more_pages ?? (contents.length === PER_PAGE);
        page++;
    }
    
    console.log(`Loaded ${allImages.length} unique images`);

    if (allImages.length === 0) {
        showError('No images found in this channel. Make sure the channel has image blocks and is public.');
    } else {
        loadingEl.style.display = 'none';
    }
}

// Start fetching contents
fetchAllContents();

// Add click listener for viewer to close it
const viewer = document.querySelector('#viewer');
const viewer_img = document.querySelector('#viewer img');

// Track current image index
let currentImageIndex = -1;

// Function to show image at specific index
function showImage(index) {
    // Get array of all thumbnail elements
    const thumbs = Array.from(thumbs_el.children);

    // Only proceed if index is valid (between 0 and number of thumbnails)
    if (index >= 0 && index < thumbs.length) {
        // Get the img element from the thumbnail at this index
        const img = thumbs[index].querySelector('img');
        
        // Show the viewer element by setting display to flex
        viewer.style.display = 'flex';
        
        // Show the large image element inside viewer
        viewer_img.style.display = 'block';
        
        // Set the source of the large image to the data-large attribute
        // stored on the thumbnail image
        viewer_img.src = img.dataset.large;
        
        // Keep track of which image is currently being viewed
        currentImageIndex = index;
        
        // Preload adjacent images for smooth arrow navigation
        [index - 1, index + 1].forEach(i => {
            if (i >= 0 && i < thumbs.length) {
                const adj = thumbs[i].querySelector('img');
                if (adj?.dataset.large) {
                    const preload = new Image();
                    preload.src = adj.dataset.large;
                }
            }
        });
    }
}

// Function to close viewer
function closeViewer() {
    viewer.style.display = 'none';
    viewer_img.src = '';
    currentImageIndex = -1;
}

// Add keyboard event listeners
document.addEventListener('keydown', (e) => {
    if (viewer.style.display === 'flex') {
        switch(e.key) {
            case 'Escape':
                closeViewer();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                showImage(currentImageIndex + 1);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                showImage(currentImageIndex - 1);
                break;
        }
    }
});

// Update click handlers
viewer.addEventListener('click', closeViewer);