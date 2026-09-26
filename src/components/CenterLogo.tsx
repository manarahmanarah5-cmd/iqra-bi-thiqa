import React, { useState } from 'react';

interface CenterLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  className?: string;
  alt?: string;
}

export const CenterLogo: React.FC<CenterLogoProps> = ({
  size = 'md',
  className = '',
  alt = 'شعار مركز مصادر التعلم',
}) => {
  const [imgSrc, setImgSrc] = useState('/صورة1.jpg');

  const imageSizes = {
    xs: 'h-10 max-h-10 w-auto',
    sm: 'h-16 max-h-16 w-auto',
    md: 'h-24 max-h-24 w-auto',
    lg: 'h-36 max-h-36 w-auto',
    xl: 'h-48 max-h-48 w-auto',
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        className={`${imageSizes[size]} object-contain`}
        onError={() => {
          if (imgSrc !== '/logo.jpg') {
            setImgSrc('/logo.jpg');
          }
        }}
        loading="eager"
      />
    </div>
  );
};
