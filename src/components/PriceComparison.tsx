// Updated PriceComparison.tsx

import React, { useState } from 'react';
import { useShop, Platform, CartItem } from '@/context/ShopContext';
import { Check, X, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PriceComparisonProps {
  selectedPlatform: Platform | null;
  onSelectPlatform: (platform: Platform) => void;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ 
  selectedPlatform, 
  onSelectPlatform 
}) => {
  const { platforms, cart, getCartTotal } = useShop();
  const [expandedPlatform, setExpandedPlatform] = useState<Platform | null>(null);
  
  // Get unavailable items for a platform
  const getUnavailableItems = (platform: Platform): CartItem[] => {
    return cart.filter(item => {
      const priceInfo = item.product.prices.find(p => p.platform === platform);
      return !priceInfo || !priceInfo.available;
    });
  };
  
  // Check if all items are available on a platform
  const areAllItemsAvailable = (platform: Platform) => {
    return cart.every(item => {
      const priceInfo = item.product.prices.find(p => p.platform === platform);
      return priceInfo && priceInfo.available;
    });
  };
  
  // Get platforms sorted by total price
  const sortedPlatforms = React.useMemo(() => {
    return platforms
      .map(platform => ({
        ...platform,
        unavailableItems: getUnavailableItems(platform.id),
        available: areAllItemsAvailable(platform.id),
        total: areAllItemsAvailable(platform.id) ? getCartTotal(platform.id) : -1
      }))
      .sort((a, b) => {
        // Sort by availability first, then by price
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        return a.total - b.total;
      });
  }, [platforms, cart]);
  
  // Find best platform (lowest total)
  const bestPlatform = sortedPlatforms.find(p => p.available);

  // Toggle expanded view of unavailable items
  const toggleExpandPlatform = (platform: Platform) => {
    if (expandedPlatform === platform) {
      setExpandedPlatform(null);
    } else {
      setExpandedPlatform(platform);
    }
  };

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden animate-scale-in">
      <div className="bg-secondary/50 px-4 py-3 border-b border-border/60">
        <h3 className="font-medium">Platform Price Comparison</h3>
      </div>
      
      <div className="divide-y divide-border/60">
        {sortedPlatforms.map((platform) => {
          const hasUnavailableItems = platform.unavailableItems.length > 0;
          const isExpanded = expandedPlatform === platform.id;
          
          return (
            <div key={platform.id} className="bg-transparent transition-colors">
              {/* Platform pricing row */}
              <div 
                className={`flex items-center justify-between p-4 ${
                  platform.id === selectedPlatform ? 'bg-primary/5' : ''
                } ${platform.id === bestPlatform?.id ? 'bg-platform-' + platform.id + '/5' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-medium platform-${platform.id}`}>{platform.name}</span>
                  
                  {/* Best price badge */}
                  {platform.id === bestPlatform?.id && (
                    <span className="text-xs bg-platform-blinkit/10 platform-blinkit px-2 py-0.5 rounded-full">
                      Best Deal
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {platform.available ? (
                    <>
                      <span className="font-semibold">₹{platform.total}</span>
                      <Button 
                        variant={platform.id === selectedPlatform ? "default" : "outline"}
                        size="sm"
                        className={platform.id === selectedPlatform ? 
                          `bg-platform-${platform.id} hover:bg-platform-${platform.id}/90` : 
                          `border-platform-${platform.id} platform-${platform.id} hover:bg-platform-${platform.id}/10`}
                        onClick={() => onSelectPlatform(platform.id)}
                      >
                        {platform.id === selectedPlatform ? (
                          <Check size={14} className="mr-1" />
                        ) : null}
                        {platform.id === selectedPlatform ? 'Selected' : 'Select'}
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-muted-foreground">
                        <X size={14} className="mr-1" />
                        <button 
                          onClick={() => toggleExpandPlatform(platform.id)}
                          className="flex items-center hover:text-destructive transition-colors"
                        >
                          <span className="mr-1">{platform.unavailableItems.length} unavailable items</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground border-muted-foreground/30 hover:bg-destructive/10 hover:text-destructive/80"
                        onClick={() => onSelectPlatform(platform.id)}
                      >
                        View Issues
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expandable section for unavailable items */}
              {hasUnavailableItems && isExpanded && (
                <div className="px-4 py-3 bg-destructive/5 border-t border-border/30">
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <AlertTriangle size={14} className="mr-1.5 text-destructive" />
                    <span>The following items are not available on {platform.name}:</span>
                  </h4>
                  <ul className="ml-5 text-sm space-y-1 text-muted-foreground">
                    {platform.unavailableItems.map(item => (
                      <li key={item.product.id + "-unavailable"} className="list-disc">
                        {item.product.name} ({item.quantity}x)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceComparison;