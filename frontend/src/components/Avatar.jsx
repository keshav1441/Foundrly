import { useState, useEffect, useMemo } from 'react';

// Generate a consistent color based on a string (name)
function generateColorFromString(str) {
  if (!str) return { bg: '1a1a1a', color: 'e50914' };
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate background color (darker shades)
  const bgHue = Math.abs(hash) % 360;
  const bgSaturation = 20 + (Math.abs(hash) % 30); // 20-50%
  const bgLightness = 15 + (Math.abs(hash) % 10); // 15-25% (dark)
  
  // Generate text color (lighter, more vibrant)
  const textHue = (bgHue + 180) % 360; // Complementary or contrasting
  const textSaturation = 60 + (Math.abs(hash) % 30); // 60-90%
  const textLightness = 70 + (Math.abs(hash) % 20); // 70-90% (light)
  
  // Convert HSL to hex (simplified - using fixed colors for consistency)
  // Using a palette of colors that work well with dark theme
  const colors = [
    { bg: '1a1a1a', color: 'e50914' }, // Red (default)
    { bg: '1a1a2e', color: '4a90e2' }, // Blue
    { bg: '1e1a1a', color: 'e24a4a' }, // Light red
    { bg: '1a2e1a', color: '4ae24a' }, // Green
    { bg: '2e1a1a', color: 'e2a04a' }, // Orange
    { bg: '1a1a2e', color: 'a04ae2' }, // Purple
    { bg: '2e2e1a', color: 'e2e24a' }, // Yellow
    { bg: '1a2e2e', color: '4ae2e2' }, // Cyan
  ];
  
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}

export default function Avatar({ src, name, className = '', size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  
  // Reset error state when src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);
  
  // Generate consistent colors based on name
  const colors = useMemo(() => generateColorFromString(name), [name]);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const avatarUrl = imgError || !src 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${colors.bg}&color=${colors.color}&size=128&bold=true`
    : src;

  return (
    <img
      src={avatarUrl}
      alt={name || 'User'}
      className={className || `${sizeClasses[size]} rounded-full object-cover`}
      onError={() => setImgError(true)}
    />
  );
}

