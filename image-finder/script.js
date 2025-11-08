// Image Finder Application - For Would You Rather Videos
class ImageFinder {
    constructor() {
        // Unsplash API configuration
        this.apiKey = '';
        this.baseURL = 'https://api.unsplash.com';
        this.currentPage = 1;
        this.perPage = typeof CONFIG !== 'undefined' ? CONFIG.imagesPerPage : 12;
        this.currentQuery = '';
        this.totalResults = 0;
        this.defaultSearch = typeof CONFIG !== 'undefined' ? CONFIG.defaultSearchTerm : 'nature';

        // Selected images for video (max 2: option1 and option2)
        this.selectedImages = {
            option1: null,
            option2: null
        };

        // Track displayed images for selection management
        this.displayedImages = [];

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

        // Selection panel
        this.selectedPanel = document.getElementById('selectedPanel');
        this.selectedCount = document.getElementById('selectedCount');
        this.selectedImagesGrid = document.getElementById('selectedImages');
        this.clearSelectionBtn = document.getElementById('clearSelectionBtn');
        this.useInVideoBtn = document.getElementById('useInVideoBtn');

        this.init();
    }

    init() {
        // Check for API key in config file first
        if (typeof CONFIG !== 'undefined' && CONFIG.unsplashAccessKey && CONFIG.unsplashAccessKey !== 'YOUR_ACCESS_KEY_HERE') {
            this.apiKey = CONFIG.unsplashAccessKey;
            this.apiKeyInput.value = CONFIG.unsplashAccessKey;
            this.apiKeyInput.placeholder = 'API Key loaded from config.js';
        } else {
            // Load saved API key from localStorage
            const savedApiKey = localStorage.getItem('unsplashApiKey');
            if (savedApiKey) {
                this.apiKey = savedApiKey;
                this.apiKeyInput.value = savedApiKey;
            }
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

        this.clearSelectionBtn.addEventListener('click', () => this.clearAllSelections());

        // Load saved selections
        this.loadSavedSelections();

        // Load default images
        this.searchImages(this.defaultSearch);
    }

    loadSavedSelections() {
        const saved = localStorage.getItem('videoGeneratorImages');
        if (saved) {
            try {
                this.selectedImages = JSON.parse(saved);
                this.updateSelectedPanel();
            } catch (e) {
                console.error('Error loading saved selections:', e);
            }
        }
    }

    saveSelections() {
        localStorage.setItem('videoGeneratorImages', JSON.stringify(this.selectedImages));
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.showError('Please enter a search term');
            return;
        }

        this.currentPage = 1;
        this.imageGrid.innerHTML = '';
        this.displayedImages = [];
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

            // Use API key from config or input field
            const headers = {
                'Authorization': `Client-ID ${this.apiKey}`
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
            this.displayedImages.push(image);
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

        // Add select button
        const selectBtn = document.createElement('button');
        selectBtn.className = 'select-btn';
        this.updateSelectButtonState(selectBtn, image);

        selectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleImageSelect(image);
        });

        info.appendChild(description);
        info.appendChild(photographer);
        info.appendChild(selectBtn);
        card.appendChild(img);
        card.appendChild(info);

        // Open modal on card click (but not button)
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('select-btn')) {
                this.openImageModal(image);
            }
        });

        return card;
    }

    updateSelectButtonState(button, image) {
        const isOption1 = this.selectedImages.option1?.id === image.id;
        const isOption2 = this.selectedImages.option2?.id === image.id;
        const bothSelected = this.selectedImages.option1 && this.selectedImages.option2;

        if (isOption1) {
            button.textContent = '✓ Selected (Option 1)';
            button.classList.add('selected');
            button.classList.remove('disabled');
        } else if (isOption2) {
            button.textContent = '✓ Selected (Option 2)';
            button.classList.add('selected');
            button.classList.remove('disabled');
        } else if (bothSelected) {
            button.textContent = 'Max 2 Images';
            button.classList.add('disabled');
            button.classList.remove('selected');
            button.disabled = true;
        } else {
            const slot = !this.selectedImages.option1 ? 'Option 1' : 'Option 2';
            button.textContent = `Select for ${slot}`;
            button.classList.remove('selected', 'disabled');
            button.disabled = false;
        }
    }

    handleImageSelect(image) {
        const isOption1 = this.selectedImages.option1?.id === image.id;
        const isOption2 = this.selectedImages.option2?.id === image.id;

        if (isOption1) {
            // Deselect option 1
            this.selectedImages.option1 = null;
        } else if (isOption2) {
            // Deselect option 2
            this.selectedImages.option2 = null;
        } else {
            // Select image
            if (!this.selectedImages.option1) {
                this.selectedImages.option1 = this.formatImageData(image);
            } else if (!this.selectedImages.option2) {
                this.selectedImages.option2 = this.formatImageData(image);
            }
        }

        this.saveSelections();
        this.updateAllSelectButtons();
        this.updateSelectedPanel();
    }

    formatImageData(image) {
        return {
            id: image.id,
            url: image.urls.regular,
            thumbnail: image.urls.small,
            description: image.alt_description || image.description || 'Image',
            photographer: image.user.name,
            photographerUrl: image.user.links.html
        };
    }

    updateAllSelectButtons() {
        const allButtons = this.imageGrid.querySelectorAll('.select-btn');
        const cards = this.imageGrid.querySelectorAll('.image-card');

        this.displayedImages.forEach((image, index) => {
            const button = allButtons[index];
            if (button) {
                this.updateSelectButtonState(button, image);
            }
        });
    }

    updateSelectedPanel() {
        const count = (this.selectedImages.option1 ? 1 : 0) + (this.selectedImages.option2 ? 1 : 0);
        this.selectedCount.textContent = count;

        if (count === 0) {
            this.selectedPanel.classList.add('hidden');
        } else {
            this.selectedPanel.classList.remove('hidden');
            this.renderSelectedImages();
        }
    }

    renderSelectedImages() {
        this.selectedImagesGrid.innerHTML = '';

        if (this.selectedImages.option1) {
            this.selectedImagesGrid.appendChild(this.createSelectedCard(this.selectedImages.option1, 'option1', 'Option 1'));
        }

        if (this.selectedImages.option2) {
            this.selectedImagesGrid.appendChild(this.createSelectedCard(this.selectedImages.option2, 'option2', 'Option 2'));
        }
    }

    createSelectedCard(imageData, slot, label) {
        const card = document.createElement('div');
        card.className = 'selected-image-card';

        const img = document.createElement('img');
        img.src = imageData.thumbnail;
        img.alt = imageData.description;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'selected-label';
        labelDiv.textContent = label;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-selection';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
            this.selectedImages[slot] = null;
            this.saveSelections();
            this.updateAllSelectButtons();
            this.updateSelectedPanel();
        });

        card.appendChild(img);
        card.appendChild(labelDiv);
        card.appendChild(removeBtn);

        return card;
    }

    clearAllSelections() {
        if (confirm('Clear all selected images?')) {
            this.selectedImages.option1 = null;
            this.selectedImages.option2 = null;
            this.saveSelections();
            this.updateAllSelectButtons();
            this.updateSelectedPanel();
        }
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
