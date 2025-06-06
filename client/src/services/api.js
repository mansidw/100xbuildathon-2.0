import { BACKEND_URL } from '../config/constants';

// Common headers and request options
const commonHeaders = {
    'ngrok-skip-browser-warning': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const commonOptions = {
    mode: 'cors',
    credentials: 'omit', // Changed from 'include' to 'omit' to avoid CORS issues
};

export const createNewChat = async (candidatesFile, jdFile, tableName) => {
    try {
        const formData = new FormData();
        formData.append('csv', candidatesFile);
        formData.append('pdf', jdFile);
        formData.append('tableName', tableName);

        const response = await fetch(`${BACKEND_URL}/newChat`, {
            method: 'POST',
            headers: {
                ...commonHeaders,
            },
            body: formData,
            ...commonOptions,
        });

        if (!response.ok) {
            throw new Error('Failed to create new chat');
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error creating new chat:', error);
        throw error;
    }
};

export const sendChatMessage = async (tableName, query) => {
    try {
        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: 'POST',
            headers: {
                ...commonHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tableName,
                query,
            }),
            ...commonOptions,
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const getTables = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/gettables`, {
            method: 'GET',
            headers: {
                ...commonHeaders,
                'Content-Type': 'application/json',
            },
            ...commonOptions,
        });
        
        if (!response.ok) {
            throw new Error('Failed to get tables');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting tables:', error);
        throw error;
    }
}; 