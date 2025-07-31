document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('seo-form');
    const urlInput = document.getElementById('url-input');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsContainer = document.getElementById('results-container');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const url = urlInput.value;

        if (!url) {
            alert('Please enter a URL.');
            return;
        }

        // Show loading indicator and clear previous results
        loadingIndicator.style.display = 'block';
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';

        try {
            // We use a CORS proxy to fetch the website's HTML
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();
            const html = data.contents;

            if (!html) {
                throw new Error('Could not fetch the content of the URL.');
            }

            // Parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // --- SEO Analysis will go here ---
            console.log('Successfully fetched and parsed HTML.');
            // For now, just display a success message
            displayResults(doc);

        } catch (error) {
            console.error('Error:', error);
            resultsContainer.innerHTML = `<div class="result-section"><h2>Error</h2><p>${error.message}</p></div>`;
        } finally {
            // Hide loading indicator and show results
            loadingIndicator.style.display = 'none';
            resultsContainer.classList.remove('hidden');
        }
    });

    function displayResults(doc) {
        // Placeholder for where results will be displayed
        resultsContainer.innerHTML = `<div class="result-section"><h2>Analysis Complete</h2><p>Successfully fetched and parsed the page. SEO analysis features will be implemented next.</p></div>`;
    }
});