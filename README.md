# neucomp - neural image compression

neucomp is an application that uses neural networks to compress images with better quality-to-size ratios than traditional compression methods like JPEG.


![Screenshot 2025-03-23 180503](https://github.com/user-attachments/assets/713b52c6-4a9b-40f1-98f9-0ab24c961c54)
![Screenshot 2025-03-23 180516](https://github.com/user-attachments/assets/b1be75b6-2a2d-4675-991a-d98f9401864f)



## features

- neural network-based image compression using CompressAI
- adjustable compression quality levels (1-8)
- real-time compression metrics (BPP, PSNR, SSIM, MS-SSIM)
- automatic handling of large images to prevent memory issues
- GPU acceleration with fallback to CPU when needed
- side-by-side comparison of original and compressed images
- download option for compressed images

## tech stack

### backend
- FastAPI framework
- CompressAI for neural image compression
- PyTorch for deep learning operations
- Python 3.8+

### frontend
- Next.js 14
- React 18
- TailwindCSS for styling
- TypeScript

## getting started

### prerequisites
- Python 3.8+
- Node.js 18+
- CUDA-compatible GPU (optional, for faster compression)

### installation

1. clone the repository
```bash
git clone https://github.com/shamikhan005/neucomp.git
cd neucomp
```

2. set up the backend
```bash
cd backend
pip install -r requirements.txt
```

3. set up the frontend
```bash
cd ../frontend
npm install
```

### running the application

1. start the backend server
```bash
cd backend
uvicorn main:app --reload
```

2. start the frontend development server
```bash
cd ../frontend
npm run dev
```

3. open your browser and navigate to `http://localhost:3000`

## usage

1. upload an image using the drag-and-drop interface
2. select your desired compression quality level
3. click "Compress Image"
4. view the results, including compression metrics and size reduction
5. download the compressed image using the download button
