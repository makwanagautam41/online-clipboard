const API_BASE_URL = 'https://server-online-clipboard.vercel.app/api';

export interface SaveTextResponse {
  code: string;
}

export interface RetrieveTextResponse {
  text: string;
}

export interface UploadImageResponse {
  code: string;
  imageUrl: string;
}

export interface RetrieveImageResponse {
  imageUrl: string;
}

// Save text to backend
export const saveText = async (text: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/save-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to save text');
  }

  const data: SaveTextResponse = await response.json();
  return data.code;
};

// Retrieve text from backend
export const retrieveText = async (code: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/retrieve-text/${code}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Code not found');
    }
    throw new Error('Failed to retrieve text');
  }

  const data: RetrieveTextResponse = await response.json();
  return data.text;
};

// Upload image to backend
export const uploadImage = async (file: File): Promise<{ code: string; imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/upload-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data: UploadImageResponse = await response.json();
  return { code: data.code, imageUrl: data.imageUrl };
};

// Retrieve image from backend
export const retrieveImage = async (code: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/retrieve-image/${code}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Code not found');
    }
    throw new Error('Failed to retrieve image');
  }

  const data: RetrieveImageResponse = await response.json();
  return data.imageUrl;
};
