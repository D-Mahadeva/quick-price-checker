// Since you're now dealing with 500 products instead of just 8,
// here are some performance optimizations to consider:

// 1. Implement pagination on the product listing page
import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductPagination = () => {
  const { filteredProducts } = useShop();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20; // Show 20 products per page

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            <span className="sr-only">Previous page</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                // Show all page numbers if 5 or fewer pages
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                // Near the start
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // Near the end
                pageNumber = totalPages - 4 + i;
              } else {
                // In the middle
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="mx-1">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      )}
    </div>
  );
};

// 2. Virtual list for long scrollable lists
// Install 'react-window' or 'react-virtualized' packages for efficient rendering of large lists
// npm install react-window

import { FixedSizeList as List } from 'react-window';

const VirtualizedProductList = () => {
  const { filteredProducts } = useShop();
  
  // Row renderer function for the virtualized list
  const ProductRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const product = filteredProducts[index];
    return (
      <div style={style}>
        <ProductCard product={product} />
      </div>
    );
  };
  
  return (
    <List
      height={800} // Set a fixed height for the list container
      width="100%"
      itemCount={filteredProducts.length}
      itemSize={300} // Approximate height of each product card
    >
      {ProductRow}
    </List>
  );
};

// 3. Optimize search with debounce to reduce re-renders
import { useEffect, useState } from 'react';
import { useShop } from '@/context/ShopContext';

const SearchOptimized = () => {
  const { setSearchQuery } = useShop();
  const [inputValue, setInputValue] = useState('');
  
  // Debounce search input to avoid excessive filtering
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300); // 300ms delay
    
    return () => clearTimeout(debounceTimeout);
  }, [inputValue, setSearchQuery]);
  
  return (
    <input
      type="text"
      placeholder="Search products..."
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className="w-full rounded-full border border-input bg-white px-4 py-2 text-sm shadow-sm"
    />
  );
};

// 4. Implement lazy loading for images
import React, { useState, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  
  useEffect(() => {
    // Use Intersection Observer API to detect when image is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    const currentElement = document.getElementById(`lazy-image-${alt.replace(/\s+/g, '-')}`);
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement) {
        observer.disconnect();
      }
    };
  }, [alt]);
  
  return (
    <div
      id={`lazy-image-${alt.replace(/\s+/g, '-')}`}
      className={`${className} ${!isLoaded ? 'bg-gray-200 animate-pulse' : ''}`}
    >
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

// Use in your ProductCard component:
// <LazyImage src={product.image || "/placeholder.svg"} alt={product.name} className="aspect-square" />

// 5. Use memo for complex components
import React, { memo } from 'react';
import { Product } from '@/context/ShopContext';

interface MemoizedProductCardProps {
  product: Product;
}

const MemoizedProductCard = memo(
  ({ product }: MemoizedProductCardProps) => {
    // Your ProductCard implementation
    return (
      <div className="product-card">
        {/* ... */}
      </div>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return prevProps.product.id === nextProps.product.id;
  }
);

// 6. Implement caching for getCartTotal and other frequently called methods
import { useCallback, useMemo } from 'react';

// In your ShopProvider component:
const getCartTotal = useCallback((platform?: Platform) => {
  return cart.reduce((total, item) => {
    // If platform is specified, only count items from that platform
    if (platform && item.platform !== platform) {
      return total;
    }
    
    // Find the price for this item's platform
    const priceInfo = item.product.prices.find(p => 
      p.platform === (item.platform || selectedPlatform)
    );
    
    // Add to total if price is available
    if (priceInfo && priceInfo.available) {
      return total + (priceInfo.price * item.quantity);
    }
    
    return total;
  }, 0);
}, [cart, selectedPlatform]); // Only recalculate when cart or selectedPlatform changes

// 7. Add filtering options to reduce the number of products displayed
const FilterByPriceRange = () => {
  const { products, filteredProducts, setFilteredProducts } = useShop();
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  
  // Calculate the absolute min and max prices from all products
  const priceRange = useMemo(() => {
    let min = Infinity;
    let max = 0;
    
    products.forEach(product => {
      product.prices.forEach(price => {
        if (price.available && price.price < min) min = price.price;
        if (price.available && price.price > max) max = price.price;
      });
    });
    
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [products]);
  
  useEffect(() => {
    // Apply the price filter
    setFilteredProducts(prevFiltered => 
      prevFiltered.filter(product => {
        // Check if any available price falls within the range
        return product.prices.some(price => 
          price.available && price.price >= minPrice && price.price <= maxPrice
        );
      })
    );
  }, [minPrice, maxPrice, setFilteredProducts]);
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Price Range</h3>
      <div className="flex items-center gap-2">
        <input 
          type="number"
          min={priceRange.min}
          max={priceRange.max}
          value={minPrice}
          onChange={e => setMinPrice(Number(e.target.value))}
          className="w-24 rounded border p-1 text-sm"
        />
        <span>to</span>
        <input 
          type="number"
          min={priceRange.min}
          max={priceRange.max}
          value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          className="w-24 rounded border p-1 text-sm"
        />
      </div>
    </div>
  );
};

// 8. Add category sidebar for quick navigation
const CategorySidebar = () => {
  const { categories, selectedCategory, setSelectedCategory } = useShop();
  
  return (
    <div className="w-64 border-r pr-4 py-4">
      <h2 className="font-semibold mb-4">Categories</h2>
      <ul className="space-y-1">
        {categories.map((category) => (
          <li key={category}>
            <button
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedCategory === category 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-secondary'
              }`}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// 9. Implement IndexedDB or localStorage cache for product data
// This can help reduce load time on repeat visits
const cacheProducts = (products) => {
  try {
    localStorage.setItem('cachedProducts', JSON.stringify(products));
    localStorage.setItem('productsTimestamp', Date.now().toString());
  } catch (error) {
    console.error('Error caching products:', error);
  }
};

const getCachedProducts = () => {
  try {
    const cachedProducts = localStorage.getItem('cachedProducts');
    const timestamp = localStorage.getItem('productsTimestamp');
    
    // Only use cache if it's less than 1 hour old
    if (cachedProducts && timestamp) {
      const cacheAge = Date.now() - parseInt(timestamp);
      if (cacheAge < 3600000) { // 1 hour in milliseconds
        return JSON.parse(cachedProducts);
      }
    }
  } catch (error) {
    console.error('Error retrieving cached products:', error);
  }
  
  return null;
};

// 10. Implement sorting functionality for the product list
const ProductSorting = () => {
  const { filteredProducts, setFilteredProducts } = useShop();
  const [sortBy, setSortBy] = useState('default');
  
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    
    const sortedProducts = [...filteredProducts];
    
    switch(value) {
      case 'price-low':
        sortedProducts.sort((a, b) => {
          const aPrice = Math.min(...a.prices.filter(p => p.available).map(p => p.price));
          const bPrice = Math.min(...b.prices.filter(p => p.available).map(p => p.price));
          return aPrice - bPrice;
        });
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => {
          const aPrice = Math.min(...a.prices.filter(p => p.available).map(p => p.price));
          const bPrice = Math.min(...b.prices.filter(p => p.available).map(p => p.price));
          return bPrice - aPrice;
        });
        break;
      case 'name-asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sorting (by category then name)
        sortedProducts.sort((a, b) => {
          if (a.category === b.category) {
            return a.name.localeCompare(b.name);
          }
          return a.category.localeCompare(b.category);
        });
    }
    
    setFilteredProducts(sortedProducts);
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Sort by:</span>
      <select 
        value={sortBy} 
        onChange={handleSortChange}
        className="rounded border p-1 text-sm"
      >
        <option value="default">Default</option>
        <option value="price-low">Price (Low to High)</option>
        <option value="price-high">Price (High to Low)</option>
        <option value="name-asc">Name (A to Z)</option>
        <option value="name-desc">Name (Z to A)</option>
      </select>
    </div>
  );
};