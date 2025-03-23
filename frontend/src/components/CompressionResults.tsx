import { useState, useEffect } from 'react';

interface CompressionMetrics {
  bpp: number;
  psnr: number;
  ssim: number;
  ms_ssim: number;
  note?: string;
}

interface SizeComparison {
  original_size: number;
  compressed_size: number;
  reduction_percent: number;
}

interface CompressionResultsProps {
  originalImage: string | null;
  compressedImage: string | null;
  metrics: CompressionMetrics | null;
  sizeComparison: SizeComparison | null;
  isLoading: boolean;
  warning?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatNumber = (num: number) => {
  return num.toFixed(2);
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};

export default function CompressionResults({ 
  originalImage, 
  compressedImage, 
  metrics, 
  sizeComparison,
  isLoading,
  warning 
}: CompressionResultsProps) {
  const [activeTab, setActiveTab] = useState<'comparison' | 'metrics'>('comparison');
  
  const handleDownload = () => {
    if (!compressedImage) return;
    const link = document.createElement('a');
    link.href = compressedImage;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `neucomp-compressed-${timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!compressedImage || !originalImage) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {warning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Compression Notice</h3>
              <div className="mt-1 text-sm text-yellow-700">
                {warning}
                {metrics?.note && <p className="mt-1">{metrics.note}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'comparison'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Image Comparison
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'metrics'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compression Metrics
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'comparison' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Original Image</h3>
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="object-contain w-full h-full"
                />
              </div>
              {sizeComparison && (
                <p className="mt-2 text-sm text-gray-600">
                  Size: {formatFileSize(sizeComparison.original_size)}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Compressed Image
                <button
                  onClick={handleDownload}
                  className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  title="Download compressed image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </h3>
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={compressedImage} 
                  alt="Compressed" 
                  className="object-contain w-full h-full"
                />
              </div>
              {sizeComparison && (
                <p className="mt-2 text-sm text-gray-600">
                  Size: {formatFileSize(sizeComparison.compressed_size)} 
                  <span className="ml-2 text-green-600 font-medium">
                    ({sizeComparison.reduction_percent}% smaller)
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {metrics && sizeComparison ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">BPP</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.bpp)}</p>
                    <p className="text-sm text-gray-500 mt-1">Bits Per Pixel</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">PSNR</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.psnr)} dB</p>
                    <p className="text-sm text-gray-500 mt-1">Peak Signal-to-Noise Ratio</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">SSIM</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.ssim)}</p>
                    <p className="text-sm text-gray-500 mt-1">Structural Similarity</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">MS-SSIM</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.ms_ssim)}</p>
                    <p className="text-sm text-gray-500 mt-1">Multi-Scale SSIM</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Size Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard 
                      title="Original Size" 
                      value={formatBytes(sizeComparison.original_size)}
                      description="Size of the original image"
                    />
                    <MetricCard 
                      title="Compressed Size" 
                      value={formatBytes(sizeComparison.compressed_size)}
                      description="Size after compression"
                    />
                    <MetricCard 
                      title="Reduction" 
                      value={`${sizeComparison.reduction_percent}%`}
                      description="Percentage size reduction"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No metrics available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}
