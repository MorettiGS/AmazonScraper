document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('searchButton');
  const keywordInput = document.getElementById('searchKeyword');
  const resultsContainer = document.getElementById('results');
  const errorContainer = document.getElementById('error');

  const API_BASE_URL = 'http://localhost:3000/';

  const displayResults = (products) => {
    if (!products || products.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">No products found</p>';
      return;
    }

    resultsContainer.innerHTML = products.map(product => `
      <div class="product-card">
        <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <div class="product-rating">
            <span class="rating-stars">${'★'.repeat(Math.round(parseFloat(product.rating))}</span>
            <span>${product.rating} (${product.reviews} reviews)</span>
          </div>
        </div>
      </div>
    `).join('');
  };

  const showError = (message) => {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    setTimeout(() => {
      errorContainer.style.display = 'none';
    }, 5000);
  };

  searchButton.addEventListener('click', async () => {
    const keyword = keywordInput.value.trim();
    
    if (!keyword) {
      showError('Please enter a valid search keyword');
      return;
    }

    resultsContainer.innerHTML = '<div class="loading">Loading...</div>';

    try {
      const response = await fetch(`${API_BASE_URL}api/scrape?keyword=${encodeURIComponent(keyword)}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const products = await response.json();
      displayResults(products);
    } catch (error) {
      console.error('Fetch error:', error);
      showError('Failed to fetch data. Please try again later.');
      resultsContainer.innerHTML = '';
    }
  });

  keywordInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      searchButton.click();
    }
  });
});
