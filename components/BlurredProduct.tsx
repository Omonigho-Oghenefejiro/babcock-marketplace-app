import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from './ui/button';

const BlurredProduct = ({ index = 0, compact = false }: { index?: number; compact?: boolean }) => {
  // Different blur intensities for visual variety
  const blurIntensities = ['blur-sm', 'blur', 'blur-md', 'blur-lg'];
  const blurClass = blurIntensities[index % blurIntensities.length];

  const loginState = { 
    from: '/shop', 
    message: 'Sign in to view products and start shopping' 
  };

  // Compact view
  if (compact) {
    return (
      <Link to="/login" state={loginState} className="group relative bg-white rounded-lg overflow-hidden border border-gray-100 block">
        <div className={`relative aspect-square bg-gray-200 ${blurClass}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <Lock className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="p-2">
          <div className={`h-3 bg-gray-200 rounded w-3/4 mb-1 ${blurClass}`}></div>
          <div className={`h-3 bg-gray-200 rounded w-1/2 mb-2 ${blurClass}`}></div>
          <div className={`h-4 bg-gray-200 rounded w-16 ${blurClass}`}></div>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/login" state={loginState} className="group relative bg-white rounded-lg shadow-sm overflow-hidden block cursor-pointer">
      {/* Image container with blur */}
      <div className={`relative aspect-square bg-gray-100 ${blurClass}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
        
        {/* Lock overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
          <div className="text-center p-4">
            <div className="bg-white/90 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Lock className="h-5 w-5 text-gray-700" />
            </div>
            <p className="text-white text-xs font-medium">Sign in to view</p>
          </div>
        </div>
      </div>

      {/* Content with blur */}
      <div className="p-4">
        <div className={`h-5 bg-gray-200 rounded mb-2 w-3/4 ${blurClass}`}></div>
        <div className={`h-4 bg-gray-200 rounded mb-3 w-1/2 ${blurClass}`}></div>
        <div className={`h-4 bg-gray-200 rounded mb-4 w-full ${blurClass}`}></div>
        
        {/* Price and button */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`h-3 bg-gray-200 rounded w-12 mb-1 ${blurClass}`}></div>
            <div className={`h-5 bg-gray-200 rounded w-16 ${blurClass}`}></div>
          </div>
          <div className={`w-8 h-8 bg-gray-200 rounded-full ${blurClass}`}></div>
        </div>
      </div>

      {/* Sign in prompt on hover */}
      <div className="absolute inset-0 bg-primary-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <Button className="bg-white text-primary-900 hover:bg-gray-100">
          Sign in to view products
        </Button>
      </div>
    </Link>
  );
};

export default BlurredProduct;
