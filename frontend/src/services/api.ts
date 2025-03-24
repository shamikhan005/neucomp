import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

export interface CompressionResult {
  message: string;
  original_image: string;
  compressed_image: string;
  metrics: {
    bpp: number;
    psnr: number;
    ssim: number;
    ms_ssim: number;
    note?: string;
  };
  size_comparison: {
    original_size: number;
    compressed_size: number;
    reduction_percent: number;
  };
  warning?: string;
  error?: string;
}

function getApiUrl(): string {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  
  return 'http://localhost:8000';
}

export async function compressImage(file: File, quality: number): Promise<CompressionResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality.toString());

  const apiUrl = getApiUrl();
  
  try {
    const response = await fetch(`${apiUrl}/api/compress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    validateCompressionResult(data);
    
    return {
      ...data,
      original_image: `${apiUrl}/${data.original_image}`,
      compressed_image: `${apiUrl}/${data.compressed_image}`,
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

function validateCompressionResult(data: any) {
  if (data.error && !data.compressed_image) {
    throw new Error(data.error);
  }
  
  if (!data.compressed_image) {
    throw new Error('No compressed image path in server response');
  }
}

export const getImageUrl = (path: string): string => {
  if (!path) {
    console.error('Empty image path provided to getImageUrl');
    return '';
  }
  
  const url = `${BASE_URL}/${path.startsWith('uploads/') ? '' : 'uploads/'}${path}`;
  console.log(`Generated image URL: ${url}`);
  return url;
};
