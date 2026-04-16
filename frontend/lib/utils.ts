export const getAssetUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  // Ensure we don't end up with // or missing /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If we are in production and relative paths work (e.g. same domain), 
  // we might not need this, but for dev it's critical.
  return `${baseUrl}${cleanPath}`;
};
