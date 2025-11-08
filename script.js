// Image Finder Application
class ImageFinder {
    constructor() {
        // Unsplash API configuration
        this.apiKey = '';
        this.baseURL = 'https://api.unsplash.com';
        this.currentPage = 1;
        this.perPage = 12;
        this.currentQuery = '';
        this.totalResults = 0;

        // DOM Elements
        this.searchInput = document.getElementById('searchInput');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.imageGrid = document.getElementById('imageGrid');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.results = document.getElementById('results');
        this.resultsCount = document.getElementById('resultsCount');
        this.loadMoreContainer = document.getElementById('loadMore');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.modal = document.getElementById('modal');
        this.modalImage = document.getElementById('modalImage');
        this.modalDescription = document.getElementById('modalDescription');
        this.downloadLink = document.getElementById('downloadLink');
        this.photographerLink = document.getElementById('photographerLink');
        this.photographerName = document.getElementById('photographerName');
        this.closeModal = document.querySelector('.close');

        this.init();
    }

    init() {
        // Load saved API key
        const savedApiKey = localStorage.getItem('unsplashApiKey');
        if (savedApiKey) {
            this.apiKey = savedApiKey;
            this.apiKeyInput.value = savedApiKey;
        }

        // Event Listeners
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        this.apiKeyInput.addEventListener('change', () => {
            this.apiKey = this.apiKeyInput.value.trim();
            if (this.apiKey) {
                localStorage.setItem('unsplashApiKey', this.apiKey);
            }
        });

        this.loadMoreBtn.addEventListener('click', () => this.loadMore());

        this.closeModal.addEventListener('click', () => this.closeImageModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeImageModal();
        });

        // Load default images
        this.searchImages('nature');
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.showError('Please enter a search term');
            return;
        }

        this.currentPage = 1;
        this.imageGrid.innerHTML = '';
        await this.searchImages(query);
    }

    async searchImages(query) {
        this.currentQuery = query;
        this.showLoading(true);
        this.hideError();
        this.results.classList.add('hidden');

        try {
            const endpoint = this.apiKey
                ? `${this.baseURL}/search/photos`
                : `${this.baseURL}/search/photos`;

            const url = new URL(endpoint);
            url.searchParams.append('query', query);
            url.searchParams.append('page', this.currentPage);
            url.searchParams.append('per_page', this.perPage);
            url.searchParams.append('orientation', 'landscape');

            // Use demo API key if user hasn't provided one
            const headers = {
                'Authorization': `Client-ID ${this.apiKey || 'YOUR_DEMO_KEY_HERE'}`
            };

            const response = await fetch(url, { headers });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your Unsplash API key or remove it to use demo mode.');
                }
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.results.length === 0) {
                this.showError('No images found. Try a different search term.');
                this.showLoading(false);
                return;
            }

            this.totalResults = data.total;
            this.displayImages(data.results);
            this.showResults(data.total);

            // Show load more button if there are more results
            if (this.currentPage * this.perPage < this.totalResults) {
                this.loadMoreContainer.classList.remove('hidden');
            } else {
                this.loadMoreContainer.classList.add('hidden');
            }

        } catch (err) {
            this.showError(err.message);
            console.error('Search error:', err);
        } finally {
            this.showLoading(false);
        }
    }

    displayImages(images) {
        images.forEach(image => {
            const card = this.createImageCard(image);
            this.imageGrid.appendChild(card);
        });
    }

    createImageCard(image) {
        const card = document.createElement('div');
        card.className = 'image-card';

        const img = document.createElement('img');
        img.src = image.urls.small;
        img.alt = image.alt_description || image.description || 'Unsplash Image';
        img.loading = 'lazy';

        const info = document.createElement('div');
        info.className = 'image-info';

        const description = document.createElement('p');
        description.textContent = image.alt_description || image.description || 'No description available';

        const photographer = document.createElement('div');
        photographer.className = 'photographer';
        photographer.textContent = `📸 ${image.user.name}`;

        info.appendChild(description);
        info.appendChild(photographer);
        card.appendChild(img);
        card.appendChild(info);

        // Open modal on click
        card.addEventListener('click', () => this.openImageModal(image));

        return card;
    }

    openImageModal(image) {
        this.modalImage.src = image.urls.regular;
        this.modalImage.alt = image.alt_description || 'Image';
        this.modalDescription.textContent = image.description || image.alt_description || 'No description available';
        this.downloadLink.href = image.links.download;
        this.photographerLink.href = image.user.links.html;
        this.photographerName.textContent = image.user.name;

        this.modal.classList.remove('hidden');
        this.modal.classList.add('active');
    }

    closeImageModal() {
        this.modal.classList.remove('active');
        this.modal.classList.add('hidden');
    }

    async loadMore() {
        this.currentPage++;
        await this.searchImages(this.currentQuery);
    }

    showLoading(show) {
        if (show) {
            this.loading.classList.remove('hidden');
        } else {
            this.loading.classList.add('hidden');
        }
    }

    showError(message) {
        this.error.textContent = message;
        this.error.classList.remove('hidden');
    }

    hideError() {
        this.error.classList.add('hidden');
    }

    showResults(count) {
        this.resultsCount.textContent = count.toLocaleString();
        this.results.classList.remove('hidden');
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ImageFinder();
});
