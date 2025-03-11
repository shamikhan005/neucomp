import torch
import torch.nn.functional as F
from compressai.zoo import cheng2020_anchor
from PIL import Image
import numpy as np
from torchvision import transforms
from typing import Dict, Any
import math

def load_image(image_path: str) -> torch.Tensor:
  img = Image.open(image_path).convert('RGB')
  transform = transforms.Compose([transforms.ToTensor()])
  return transform(img).unsqueeze(0)

def save_image(tensor: torch.Tensor, output_path: str) -> None:
  img = transforms.ToPILImage()(tensor.squeeze().clamp(0, 1))
  img.save(output_path)

def compress_image(image_path: str, output_path: str, quality: int = 4) -> Dict[str, Any]:
  device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

  quality = max(1, min(8, quality))

  model = cheng2020_anchor(quality=quality, pretrained=True).to(device).eval()

  x = load_image(image_path).to(device)

  with torch.no_grad():
    compressed = model.compress(x)
    decompressed = model.decompress(compressed["strings"], compressed["shape"])
    x_hat = decompressed["x_hat"].clamp(0, 1)
  
  save_image(x_hat.cpu(), output_path)

  bpp = sum(len(s[0]) for s in compressed["strings"]) * 8 / (x.shape[2] * x.shape[3])
  psnr = calculate_psnr(x, x_hat)
  ssim = calculate_ssim(x, x_hat)
  ms_ssim = calculate_ms_ssim(x, x_hat)

  return {
    "bpp": float(bpp),
    "psnr": float(psnr),
    "ssim": float(ssim),
    "ms_ssim": float(ms_ssim)
  }

def calculate_psnr(x: torch.Tensor, x_hat: torch.Tensor) -> float:
  mse = F.mse_loss(x, x_hat).item()
  return 10 * np.log10(1 / mse) if mse > 0 else 100

def gaussian_kernel(size: int, sigma: float, device: torch.device) -> torch.Tensor:
  coords = torch.arange(size, device=device).float() - (size - 1) / 2
  g = torch.exp(-(coords ** 2) / (2 * sigma ** 2))
  return g / g.sum()

def create_window(size: int, channel: int, device: torch.device) -> torch.Tensor:
  sigma = 1.5
  gaussian_1d = gaussian_kernel(size, sigma, device)
  gaussian_2d = gaussian_1d.unsqueeze(1) @ gaussian_1d.unsqueeze(0)
  window = gaussian_2d.unsqueeze(0).unsqueeze(0)
  return window.expand(channel, 1, size, size).to(device)

def calculate_ssim(x: torch.Tensor, x_hat: torch.Tensor, window_size: int = 11) -> float:
  device = x.device
  c1 = (0.01 * 1) ** 2
  c2 = (0.03 * 1) ** 2

  window = create_window(window_size, x.shape[1], device)

  mu1 = F.conv2d(x, window, padding=window_size//2, groups=x.shape[1])
  mu2 = F.conv2d(x_hat, window, padding=window_size//2, groups=x.shape[1])

  mu1_sq = mu1 ** 2
  mu2_sq = mu2 ** 2
  mu1_mu2 = mu1 * mu2

  sigma1_sq = F.conv2d(x * x, window, padding=window_size//2, groups=x.shape[1]) - mu1_sq
  sigma2_sq = F.conv2d(x_hat * x_hat, window, padding=window_size//2, groups=x.shape[1]) - mu2_sq
  sigma12 = F.conv2d(x * x_hat, window, padding=window_size//2, groups=x.shape[1]) - mu1_mu2

  ssim_map = ((2 * mu1_mu2 + c1) * (2 * sigma12 + c2)) / ((mu1_sq + mu2_sq + c1) * (sigma1_sq + sigma2_sq + c2))
  return ssim_map.mean().item()

def calculate_ms_ssim(x: torch.Tensor, x_hat: torch.Tensor, weights=None) -> float:
  if weights is None:
    weights = torch.tensor([0.0448, 0.2856, 0.3001, 0.2363, 0.1333], device=x.device)

  levels = weights.shape[0]
  ms_ssim_vals = []
  window_size = 11
  window = create_window(window_size, x.shape[1], x.device)

  for i in range(levels):
    ssim_val = calculate_ssim(x, x_hat)
    ms_ssim_vals.append(ssim_val)

    if i < levels - 1:
      x = F.avg_pool2d(x, kernel_size=2, stride=2)
      x_hat = F.avg_pool2d(x_hat, kernel_size=2, stride=2)


  ms_ssim_vals = torch.tensor(ms_ssim_vals, device=weights.device)
  ms_ssim = torch.prod(ms_ssim_vals ** weights)

  return ms_ssim.item()