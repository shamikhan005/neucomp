# NeuComp - Neural Image Compression

NeuComp is an application that uses neural networks to compress images with better quality-to-size ratios than traditional compression methods like JPEG.

## About

This application uses CompressAI, a PyTorch library for neural compression, to provide state-of-the-art image compression. The model automatically adjusts to use GPU acceleration when available.

## Features

- Neural network-based image compression
- Adjustable compression quality levels (1-8)
- Real-time compression metrics (BPP, PSNR, SSIM, MS-SSIM)
- GPU acceleration for faster processing
- Side-by-side comparison of original and compressed images

## How to Use

1. Upload an image using the drag-and-drop interface
2. Select your desired compression quality level (1-8)
3. Click "Compress Image"
4. View the results, including compression metrics and size reduction
5. Download the compressed image

## Technical Details

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: FastAPI, CompressAI, PyTorch
- **Model**: Pretrained neural compression model from CompressAI
