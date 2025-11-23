/**
 * Returns the correct asset path for both development and production
 * @param {string} path - The asset path starting with /
 * @returns {string} - The full path with base URL
 */
export const getAssetPath = (path) => {
  const base = import.meta.env.BASE_URL;
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Combine base and path, ensuring no double slashes
  return `${base}${cleanPath}`.replace(/\/\//g, '/');
};
