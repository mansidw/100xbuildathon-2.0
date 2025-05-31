const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
    throw new Error('VITE_BACKEND_URL is not defined in environment variables. Please check your .env file.');
}

export { BACKEND_URL };

export const generateTableName = (roleName) => {
    // Remove spaces and special characters, convert to lowercase
    const cleanName = roleName.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Add timestamp to make it unique
    return `${cleanName}_${Date.now()}`;
}; 