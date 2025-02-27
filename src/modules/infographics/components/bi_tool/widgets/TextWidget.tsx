import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';

const TextWidget: React.FC = () => {
  const [text, setText] = useState<string>('Click to edit text');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            multiline
            fullWidth
          />
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </div>
      ) : (
        <div onClick={handleEdit} style={{ cursor: 'pointer' }}>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

export default TextWidget;
