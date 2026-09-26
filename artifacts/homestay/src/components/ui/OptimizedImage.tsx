import React, { useState } from 'react';
import { resolveMediaUrl, getRawMediaUrl } from '@workspace/api-client-react';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  width?: number;
  quality?: number;
  fallbackSrc?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  quality = 80,
  fallbackSrc = '/hero-cover.jpg',
  priority = false,
  className = '',
  style,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retryDirect, setRetryDirect] = useState(false);

  if (!src) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={style}
        {...props}
      />
    );
  }

  let computedSrc: string;
  if (hasError) {
    computedSrc = fallbackSrc;
  } else if (retryDirect) {
    computedSrc = getRawMediaUrl(src);
  } else {
    computedSrc = resolveMediaUrl(src, { width, quality });
  }

  return (
    <img
      src={computedSrc}
      alt={alt}
      className={`${className} transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-85'}`}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        if (!retryDirect && computedSrc.includes('wsrv.nl')) {
          // If edge proxy encounters network glitch, seamlessly retry direct backend source
          setRetryDirect(true);
        } else if (!hasError) {
          // If direct source also fails, use reliable fallback
          setHasError(true);
        }
      }}
      style={style}
      {...props}
    />
  );
};

export default OptimizedImage;
