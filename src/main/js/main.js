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

        loadingIndicator.style.display = 'block';
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';

        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();
            const html = data.contents;

            if (!html) {
                throw new Error('Could not fetch the content of the URL.');
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const analysis = runSeoAnalysis(doc, url);
            displayResults(analysis);

        } catch (error) {
            console.error('Error:', error);
            resultsContainer.innerHTML = `<div class="result-section"><h2>Error</h2><p>${error.message}</p></div>`;
        } finally {
            loadingIndicator.style.display = 'none';
            resultsContainer.classList.remove('hidden');
        }
    });

    function runSeoAnalysis(doc, baseUrl) {
        return {
            title: analyzeTitle(doc),
            metaDescription: analyzeMetaDescription(doc),
            headings: analyzeHeadings(doc),
            images: analyzeImages(doc),
            links: analyzeLinks(doc, baseUrl)
        };
    }

    function analyzeTitle(doc) {
        const titleElement = doc.querySelector('title');
        const title = titleElement ? titleElement.textContent : 'Not found';
        return { content: title, length: title.length };
    }

    function analyzeMetaDescription(doc) {
        const metaElement = doc.querySelector('meta[name="description"]');
        const description = metaElement ? metaElement.getAttribute('content') : 'Not found';
        return { content: description, length: description.length };
    }

    function analyzeHeadings(doc) {
        const headings = {};
        for (let i = 1; i <= 6; i++) {
            const headingElements = doc.querySelectorAll(`h${i}`);
            headings[`h${i}`] = Array.from(headingElements).map(h => h.textContent);
        }
        return headings;
    }

    function analyzeImages(doc) {
        const images = doc.querySelectorAll('img');
        const total = images.length;
        const missingAlt = Array.from(images).filter(img => !img.alt).length;
        return { total, missingAlt };
    }

    function analyzeLinks(doc, baseUrl) {
        const links = doc.querySelectorAll('a');
        let internal = 0;
        let external = 0;
        const baseHostname = new URL(baseUrl).hostname;

        links.forEach(link => {
            try {
                const linkUrl = new URL(link.href, baseUrl);
                if (linkUrl.hostname === baseHostname) {
                    internal++;
                } else {
                    external++;
                }
            } catch (e) {
                // Invalid URL, treat as internal for simplicity
                internal++;
            }
        });

        return { total: links.length, internal, external };
    }

    function displayResults(analysis) {
        resultsContainer.innerHTML = `
            <div class="result-section">
                <h2>Title Tag</h2>
                <p><strong>Content:</strong> ${analysis.title.content}</p>
                <p><strong>Length:</strong> ${analysis.title.length} characters</p>
            </div>
            <div class="result-section">
                <h2>Meta Description</h2>
                <p><strong>Content:</strong> ${analysis.metaDescription.content}</p>
                <p><strong>Length:</strong> ${analysis.metaDescription.length} characters</p>
            </div>
            <div class="result-section">
                <h2>Headings</h2>
                ${Object.entries(analysis.headings).map(([level, list]) => `
                    <h3>${level.toUpperCase()} (${list.length})</h3>
                    <ul>${list.map(item => `<li>${item}</li>`).join('')}</ul>
                `).join('')}
            </div>
            <div class="result-section">
                <h2>Image SEO</h2>
                <p><strong>Total Images:</strong> ${analysis.images.total}</p>
                <p><strong>Images Missing Alt Text:</strong> ${analysis.images.missingAlt}</p>
            </div>
            <div class="result-section">
                <h2>Link Analysis</h2>
                <p><strong>Total Links:</strong> ${analysis.links.total}</p>
                <p><strong>Internal Links:</strong> ${analysis.links.internal}</p>
                <p><strong>External Links:</strong> ${analysis.links.external}</p>
            </div>
        `;
    }
});