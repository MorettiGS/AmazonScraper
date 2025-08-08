import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';

const app = express();
const PORT = 3000;

// Mimic a real browser request
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Scrape Amazon search results
const scrapeAmazon = async (keyword: string) => {
  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
    const response = await axios.get(url, { headers: HEADERS });
    
    if (response.status !== 200) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const products = Array.from(
      document.querySelectorAll('div.s-result-item[data-component-type="s-search-result"]')
    );

    return products.map(product => {
      const titleElement = product.querySelector('h2 a span') as HTMLElement;
      const ratingElement = product.querySelector('.a-icon-star-small .a-icon-alt') as HTMLElement;
      const reviewElement = product.querySelector('.a-size-small .a-link-normal .a-size-base') as HTMLElement;
      const imageElement = product.querySelector('.s-image') as HTMLImageElement;
      
      return {
        title: titleElement?.textContent?.trim() || 'N/A',
        rating: ratingElement?.textContent?.split(' ')[0] || 'N/A',
        reviews: reviewElement?.textContent?.replace(',', '') || '0',
        imageUrl: imageElement?.src || '',
      };
    });
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to scrape Amazon data');
  }
};

app.get('/api/scrape', async (req, res) => {
  try {
    const keyword = req.query.keyword as string;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Missing keyword parameter' });
    }

    const results = await scrapeAmazon(keyword);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
