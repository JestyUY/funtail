import React from 'react';
import { ImageData, UserCustomization } from '../types/album';

interface Props {
  image: ImageData;
  index: number;
  updateCustomization: (index: number, field: keyof UserCustomization, value: any) => void;
}

export const ImageCustomization: React.FC<Props> = ({ image, index, updateCustomization }) => {
  if (!image.userCustomization) return null;

  return (
    <div className="mt-2 p-2 border border-gray-300 rounded">
      <h4 className="font-bold">Customization</h4>
      <input 
        type="text" 
        value={image.userCustomization.altText} 
        onChange={(e) => updateCustomization(index, 'altText', e.target.value)}
        placeholder="Alt Text"
        className="w-full p-1 mb-1 border rounded"
      />
      <input 
        type="text" 
        value={image.userCustomization.tags.join(', ')} 
        onChange={(e) => updateCustomization(index, 'tags', e.target.value.split(', '))}
        placeholder="Tags (comma separated)"
        className="w-full p-1 mb-1 border rounded"
      />
      {/* Add more inputs for other properties as needed */}
    </div>
  );
};