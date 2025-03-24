// Updated CartItem.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useShop, CartItem as CartItemType, Platform } from '@/context/ShopContext';
import { Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItemProps {
  item: CartItemType;
  platformFilter?: Platform;
}

const CartItem: React.FC<CartItemProps> = ({ item, platformFilter }) => {
  const { updateCartItemQuantity, removeFromCart } = useShop();
  const { product, quantity, platform } = item;
  
  // Find price for specific platform or the platform of this cart item
  const getPriceInfo = () => {
    const targetPlatform = platformFilter || platform;
    if (!targetPlatform) return null;
    
    return product.prices.find(p => p.platform === targetPlatform);
  };
  
  const priceInfo = getPriceInfo();
  const isAvailable = priceInfo && priceInfo.available;
  
  // If filtering by platform and showing an item that's not available,
  // show a warning banner above the item
  const showUnavailableWarning = platformFilter && !isAvailable;
  
  const handleQuantityChange = (newQuantity: number) => {
    updateCartItemQuantity(product.id, newQuantity, platform || undefined);
  };
  
  const handleRemove = () => {
    removeFromCart(product.id, platform || undefined);
  };

  return (
    <div className="relative">
      {/* Unavailability warning banner */}
      {showUnavailableWarning && (
        <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-sm flex items-center">
          <AlertTriangle size={14} className="mr-2 text-destructive" />
          <span className="text-destructive font-medium">Not available on {platformFilter}</span>
        </div>
      )}
      
      <div className={`flex items-center py-4 ${showUnavailableWarning ? 'opacity-50' : ''}`}>
        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
          <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
        </Link>
        
        {/* Product Details */}
        <div className="ml-4 flex-grow">
          <div className="flex justify-between">
            <Link to={`/product/${product.id}`}>
              <h3 className="font-medium hover:text-primary transition-colors">{product.name}</h3>
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">{product.unit}</div>
          
          {/* Price and actions row */}
          <div className="flex justify-between items-center mt-2">
            {/* Price */}
            <div className="font-semibold">
              {isAvailable ? (
                <>₹{priceInfo.price * quantity}</>
              ) : (
                <span className="text-destructive">Not Available</span>
              )}
            </div>
            
            {/* Quantity controls - disabled if unavailable in current platform view */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-none"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={showUnavailableWarning}
                >
                  <Minus size={14} />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-none"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={showUnavailableWarning}
                >
                  <Plus size={14} />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={handleRemove}
                disabled={showUnavailableWarning}
              >
                <Trash2 size={16} />
                <span className="sr-only">Remove item</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;