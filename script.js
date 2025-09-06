// Enter the Are.na channel slug here. It has to be an open or closed channel. Private channels are not supported.
let channel_title = 'camera-roll-nnn9n8atmm0';

// Are.na's base API url
const api = 'https://api.are.na/v2/channels/';

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
function createThumbnail(item) {
    if (item.class == 'Image' && !uniqueUrls.has(item.image.display.url)) {
        let thumb_el = document.createElement('div');
        thumb_el.classList.add('thumb');
        thumb_el.innerHTML = `<img src="${item.image.thumb.url}" data-large="${item.image.display.url}">`;
        thumb_el.classList.add('image');
        
        // Add click listener immediately for each thumbnail
        thumb_el.addEventListener('click', e => {
            currentImageIndex = Array.from(thumbs_el.children).indexOf(thumb_el);
            showImage(currentImageIndex);
        });
        
        thumbs_el.appendChild(thumb_el);
        uniqueUrls.add(item.image.display.url);
        allImages.push(item);
    }
}

async function fetchPage(page = 1, per = 100) {
    try {
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fix the URL construction
        const url = `${api}${channel_title}/contents?page=${page}&per=${per}&direction=desc`;
        console.log("Fetching URL:", url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 
                'Cache-Control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (compatible; CameraRoll/1.0)'
            }
        });
        
        if (!response.ok) {
            console.error("API request failed:", response.status, response.statusText);
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching page:', error);
        return null;
    }
}

async function fetchAllContents() {
    console.log("Starting to fetch images from channel:", channel_title);
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        console.log(`Fetching page ${page}...`);
        const data = await fetchPage(page, 5);
        
        // Check if data is valid and has contents
        if (!data || !data.contents) {
            console.error("Invalid data returned from API:", data);
            break;
        }
        
        console.log(`Got ${data.contents.length} items from API`);
        
        data.contents.forEach(block => {
            createThumbnail(block);
        });

        // Set favicon using first image (only on first page)
        if (page === 1 && data.contents.length > 0) {
            const firstImage = data.contents[0];
            if (firstImage.class === 'Image') {
                const favicon = document.createElement('link');
                favicon.rel = 'icon';
                favicon.href = firstImage.image.thumb.url;
                document.head.appendChild(favicon);
            }
        }
        
        hasMore = data.contents.length === 5;
        page++;
    }
    
    // Hide loading element when done
    loadingEl.style.display = 'none';
    console.log(`Loaded ${allImages.length} unique images`);
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