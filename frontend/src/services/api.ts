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

export const compressImage = async (imageFile: File, quality: number): Promise<CompressionResult> => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('quality', quality.toString());

  try {
    console.log(`Sending compression request to ${API_URL}/compress with quality ${quality}`);
    const response = await axios.post<CompressionResult>(
      `${API_URL}/compress`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    console.log('Compression response:', response.data);
    
    if (response.data.error && !response.data.compressed_image) {
      throw new Error(response.data.error);
    }
    
    if (!response.data.compressed_image) {
      throw new Error('No compressed image path in server response');
    }
    
    return response.data;
  } catch (error) {
    console.error('Compression API error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to compress image');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to compress image');
  }
};

export const getImageUrl = (path: string): string => {
  if (!path) {
    console.error('Empty image path provided to getImageUrl');
    return '';
  }
  
  const url = `${BASE_URL}/${path.startsWith('uploads/') ? '' : 'uploads/'}${path}`;
  console.log(`Generated image URL: ${url}`);
  return url;
};
