import React, { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import Header from '@/components/Header';
import PlatformSelector from '@/components/PlatformSelector';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

// ProductSorting component for sorting products
const ProductSorting = () => {
  const { filteredProducts, setFilteredProducts } = useShop();
  const [sortBy, setSortBy] = useState('default');
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    
    const sortedProducts = [...filteredProducts];
    
    switch(value) {
      case 'price-low':
        sortedProducts.sort((a, b) => {
          const aPrice = Math.min(...a.prices.filter(p => p.available).map(p => p.price) || [Infinity]);
          const bPrice = Math.min(...b.prices.filter(p => p.available).map(p => p.price) || [Infinity]);
          return aPrice - bPrice;
        });
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => {
          const aPrice = Math.min(...a.prices.filter(p => p.available).map(p => p.price) || [0]);
          const bPrice = Math.min(...b.prices.filter(p => p.available).map(p => p.price) || [0]);
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
      <SlidersHorizontal size={16} className="text-muted-foreground" />
      <span className="text-sm">Sort by:</span>
      <select 
        value={sortBy} 
        onChange={handleSortChange}
        className="rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30"
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

const Index = () => {
  const { filteredProducts, selectedCategory } = useShop();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20; // Show 20 products per page

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Get current products for this page
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    let startPage, endPage;
    
    if (totalPages <= 5) {
      // Less than 5 pages, show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // More than 5 pages, calculate which to show
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PlatformSelector />
      <CategoryNav />
      
      <main className="container mx-auto px-4 py-6">
        {/* Category Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{selectedCategory}</h1>
          <p className="text-muted-foreground mt-1">
            Compare prices across multiple platforms
          </p>
        </div>
        
        {/* Sort and Results Info */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} products found
          </p>
          <ProductSorting />
        </div>
        
        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground">
                Try changing your filters or search term
              </p>
            </div>
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-8 mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={16} />
              <span className="sr-only">Previous page</span>
            </Button>
            
            {getPageNumbers().map(number => (
              <Button
                key={number}
                variant={currentPage === number ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(number)}
                className="h-8 w-8 p-0"
              >
                {number}
              </Button>
            ))}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="mx-1 text-muted-foreground">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  className="h-8 w-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={16} />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;