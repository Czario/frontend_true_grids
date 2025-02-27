import React, { useState } from 'react';
import { Button } from '@mui/material';

const ImageWidget: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {imageSrc ? (
        <div>
          <img src={imageSrc} alt="Uploaded" style={{ width: '100%' }} />
          <Button variant="contained" color="primary" onClick={() => setImageSrc(null)}>
            Change Image
          </Button>
        </div>
      ) : (
        <div>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="image-upload">
            <Button variant="contained" color="primary" component="span">
              Upload Image
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageWidget;
