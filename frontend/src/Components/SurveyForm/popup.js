import React, { useState } from 'react';
import {   Dialog,   DialogTitle,  DialogContent,  DialogContentText,  Button, TextField, IconButton,  Box} from '@mui/material';
import { 
  CheckCircleOutline as CheckIcon, 
  ContentCopy as CopyIcon, 
  Link as LinkIcon 
} from '@mui/icons-material';

const FormSuccessPopup = ({ formId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const formLink = `/form/${formId}`;
  const fullFormLink = `${window.location.origin}${formLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullFormLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <CheckIcon color="success" sx={{ fontSize: 48 }} />
        </Box>
        Form Created Successfully
      </DialogTitle>
      <DialogContent>
        <DialogContentText align="center" mb={2}>
          Your form is now ready to be shared
        </DialogContentText>
        
        <Box display="flex" alignItems="center" mb={2}>
          <TextField fullWidth    variant="outlined" value={formLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={handleCopyLink}>
                  {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              )
            }}
          />
        </Box>
        
        <Box display="flex" justifyContent="center" gap={2}>
          <Button   variant="contained"  sx={{backgroundColor:"#6A9C89"}} startIcon={<LinkIcon />} href={formLink}  target="_blank"   >
            Open Form
          </Button>
          <Button  variant="outlined"   onClick={onClose} >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FormSuccessPopup;