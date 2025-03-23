"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageUploader from "../components/ImageUploader";
import QualitySelector from "../components/QualitySelector";
import CompressionResults from "../components/CompressionResults";
import { compressImage, getImageUrl, CompressionResult } from "../services/api";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(4);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setResult(null);
    setCompressedPreview(null);

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setIsCompressing(true);
    setError(null);

    try {
      const compressionResult = await compressImage(selectedFile, quality);
      console.log("Compression result:", compressionResult);
      setResult(compressionResult);

      try {
        if (!compressionResult.compressed_image) {
          throw new Error("No compressed image path returned from server");
        }

        const compressedImageUrl = getImageUrl(compressionResult.compressed_image);
        console.log("Fetching compressed image from:", compressedImageUrl);

        const response = await fetch(compressedImageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch compressed image: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = () => {
          setCompressedPreview(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (fetchError) {
        console.error("Error fetching compressed image:", fetchError);
        setError(`Error loading compressed image: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
      }
    } catch (err) {
      console.error("Compression error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">NeuComp</h1>
          <p className="text-lg text-gray-600">Neural Image Compression</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Image</h2>
              <ImageUploader 
                onImageSelect={handleImageSelect} 
                isLoading={isCompressing} 
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings</h2>
              <QualitySelector 
                quality={quality} 
                onChange={setQuality} 
                disabled={isCompressing} 
              />
              
              <div className="mt-6">
                <button
                  onClick={handleCompress}
                  disabled={!selectedFile || isCompressing}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium
                    ${!selectedFile || isCompressing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                    }
                  `}
                >
                  {isCompressing ? 'Compressing...' : 'Compress Image'}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {(isCompressing || result) && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
            <CompressionResults
              originalImage={originalPreview}
              compressedImage={compressedPreview}
              metrics={result?.metrics || null}
              sizeComparison={result?.size_comparison || null}
              isLoading={isCompressing}
              warning={result?.warning}
            />
          </div>
        )}

        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About Neural Compression</h2>
          <div className="prose prose-blue max-w-none">
            <p>
              NeuComp uses state-of-the-art neural network models to compress images with better 
              quality-to-size ratios than traditional methods like JPEG.
            </p>
            <p className="mt-2">
              The compression is powered by CompressAI, which implements learned image compression 
              techniques based on deep learning research.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
