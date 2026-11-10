export async function prepareProfilePhoto(file: File): Promise<string> {
  const sourceImage = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 160;
    const context = canvas.getContext('2d')!;
    const size = Math.min(sourceImage.width, sourceImage.height);
    context.drawImage(sourceImage, (sourceImage.width - size) / 2, (sourceImage.height - size) / 2, size, size, 0, 0, 160, 160);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    sourceImage.close();
  }
}
