import React, { useState } from "react";
import { Box, TextField, Input, Stack, Typography, Paper, FormControl, Select, InputLabel, MenuItem, Grid, Checkbox, FormControlLabel, Button, RadioGroup, Radio, IconButton, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Delete, DragIndicator, FileCopy, Preview, Edit, Add } from "@mui/icons-material";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Navbar, Footer } from "../HomePage/navbar";
import FormSuccessPopup from "./popup";

export default function NewForm() {
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("Description");
  const [questions, setQuestions] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [decryptionTime, setDecryptionTime] = useState(1);
  const [decryptionUnit, setDecryptionUnit] = useState("hours");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [newFormId, setNewFormId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); 
  const [dialogMessage, setDialogMessage] = useState(""); 

  const [category, setCategory] = useState("");

  
  const handleSubmit = async () => {
     const userId = JSON.parse(localStorage.getItem("user"));
      if (!userId) {
      setDialogMessage('Please log in to submit the form.');
      setOpenDialog(true); // Open dialog if the user is not logged in
      return;
    }
    try {
      if (!validateForm()) {
        return;
      }

      const decryptionTimeInSeconds = calculateTotalSeconds(decryptionTime, decryptionUnit);
      const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: formTitle,
          description: formDescription,
          questions,
          user: userId,
          decryptionTime: decryptionTimeInSeconds,
          decryptionUnit: "seconds", // Always store in seconds in backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error saving form");
      }

      const data = await response.json();
      console.log("Form saved:", data);

      setNewFormId(data.form._id);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Error saving form:", error);
      alert(error.message || "Error occurred while saving the form.");
    }
  };

  const validateForm = () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      alert("Form title and description are required!");
      return false;
    }

    if (decryptionTime < 1) {
      alert("Decryption time must be at least 1 unit!");
      return false;
    }

    if (!category.trim()) {
      alert("Category is required!");
      return false;
    }

    if (questions.length === 0) {
      alert("At least one question must be added!");
      return false;
    }

    return true;
  };


  const calculateTotalSeconds = (time, unit) => {
    switch (unit) {
      case "seconds":
        return time;
      case "minutes":
        return time * 60;
      case "hours":
        return time * 3600;
      case "days":
        return time * 86400;
      default:
        return time * 3600; // Default to hours
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setQuestions(items);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      title: "Untitled Question",
      type: "",
      options: [],
      newOption: "",
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDuplicate = (question) => {
   const duplicatedQuestion = { ...question, id: Date.now(), title: `${question.title} (Copy)` };
    setQuestions([...questions, duplicatedQuestion]);
  };

  const handleAddOption = (questionId) => {
    setQuestions((prevQuestions) =>
    prevQuestions.map(q => q.id === questionId && q.newOption.trim() !== "" ? { ...q, options: [...q.options, q.newOption], newOption: "" } : q)
    );
  };

  const handleRemoveOption = (questionId, optionIndex) => {
    setQuestions(
    questions.map(q => q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) } : q)
    );
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const handleQuestionUpdate = (questionId, field, value) => {
    setQuestions(
     questions.map(q => q.id === questionId ? { ...q, [field]: value } : q)
    );
  };

  const renderDynamicInput = (question) => {
    switch (question.type) {
      case "Checkbox":
        return (
          <FormControl component="fieldset">
            <List>
              {question.options.length > 0 ? (
                question.options.map((option, index) => (
                 <ListItem key={index} secondaryAction={!isPreviewMode && <IconButton edge="end" onClick={() => handleRemoveOption(question.id, index)}><Delete /></IconButton>}>
                  <FormControlLabel required={question.required && isPreviewMode} control={<Checkbox />} label={option} />

                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No options added yet.
                </Typography>
              )}
            </List>
            {!isPreviewMode && (
              <Box mt={2}>
                <TextField label="Add Option" value={question.newOption || ""} onChange={(e) => handleQuestionUpdate(question.id, "newOption", e.target.value)} variant="outlined" size="small" />
                <Button onClick={() => handleAddOption(question.id)} variant="contained" size="small" sx={{ ml: 1, backgroundColor: "#3A6351", "&:hover": { backgroundColor: "#2C4F3B" } }}>Add</Button>

              </Box>
            )}
          </FormControl>
        );
        case "Multiple choice":
          return (
            <FormControl component="fieldset">
              <RadioGroup>
                <List>
                  {question.options.length > 0 ? question.options.map((option, index) => (
                    <ListItem key={index} secondaryAction={!isPreviewMode && (<IconButton edge="end" onClick={() => handleRemoveOption(question.id, index)}><Delete /></IconButton>)}>
                      <FormControlLabel required={question.required && isPreviewMode} control={<Radio />} label={option} value={option} />
                    </ListItem>
                  )) : <Typography variant="body2" color="textSecondary">No options added yet.</Typography>}
                </List>
              </RadioGroup>
              {!isPreviewMode && (
                <Box mt={2}>
                  <TextField label="Add Option" value={question.newOption || ""} onChange={(e) => handleQuestionUpdate(question.id, "newOption", e.target.value)} variant="outlined" size="small" />
                  <Button onClick={() => handleAddOption(question.id)} variant="contained" size="small" sx={{ ml: 1, backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" } }}>Add</Button>
                </Box>
              )}
            </FormControl>
          );
        case "Drop down":
          return (
            <FormControl fullWidth>
              <InputLabel>
  {`Select an Option${question.required && isPreviewMode ? ' *' : ''}`}
</InputLabel>

              <Select required={question.required && isPreviewMode}>
                {question.options.length > 0 ? question.options.map((option, index) => (
                  <MenuItem key={index} value={option}>{option}{!isPreviewMode && (<IconButton edge="end" size="small" onClick={() => handleRemoveOption(question.id, index)}><Delete /></IconButton>)}</MenuItem>
                )) : <MenuItem disabled>No options available</MenuItem>}
              </Select>
              {!isPreviewMode && (
                <Box mt={2}>
                  <TextField label="Add Option" value={question.newOption || ""} onChange={(e) => handleQuestionUpdate(question.id, "newOption", e.target.value)} variant="outlined" size="small" />
                  <Button onClick={() => handleAddOption(question.id)} variant="contained" size="small" sx={{ ml: 1, backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" } }}>Add</Button>
                </Box>
              )}
            </FormControl>
          );
        case "Short answer":
          return <TextField label="Short Answer" variant="outlined" fullWidth required={question.required && isPreviewMode} />;
        case "Paragraph":
          return <TextField label="Paragraph" variant="outlined" multiline rows={4} fullWidth required={question.required && isPreviewMode} />;
        default:
          return null;
      }
    };

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: "hidden" }}>
          <Box p={4} sx={{ backgroundColor: "#C1CFA1", width: '100%', mb: 4 }}>
            <Stack px={4} direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <PendingActionsIcon fontSize="large" />
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} disableUnderline readOnly={isPreviewMode} />
                <TextField label="Decrypt After" type="number" value={decryptionTime} onChange={(e) => setDecryptionTime(Number(e.target.value))} InputProps={{ inputProps: { min: 1 } }} sx={{ width: 100 }} disabled={isPreviewMode} />
                <FormControl sx={{ width: 120 }}>
                  <Select value={decryptionUnit} onChange={(e) => setDecryptionUnit(e.target.value)} disabled={isPreviewMode}>
                    <MenuItem value="seconds">Seconds</MenuItem>
                    <MenuItem value="minutes">Minutes</MenuItem>
                    <MenuItem value="hours">Hours</MenuItem>
                    <MenuItem value="days">Days</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button startIcon={<Add />} onClick={handleAddQuestion} variant="contained" disabled={isPreviewMode} sx={{ backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" } }}>Add Question</Button>
                <Button startIcon={isPreviewMode ? <Edit /> : <Preview />} onClick={() => setIsPreviewMode(!isPreviewMode)} variant="contained" sx={{ backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" } }}>{isPreviewMode ? "Edit Mode" : "Preview Mode"}</Button>
              </Stack>
            </Stack>
          </Box>
  
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Paper elevation={20} sx={{ width: "50%", padding: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ marginTop: 0, marginBottom: 0 }}>Form is created for:</p>
              <FormControl style={{ marginTop: 0, marginBottom: 0 }} fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <MenuItem value="Finance Department">Finance Department</MenuItem>
                  <MenuItem value="Operational Department">Operational Department</MenuItem>
                  <MenuItem value="Marketing Department">Marketing Department</MenuItem>
                  <MenuItem value="HR Department">HR Department</MenuItem>
                  <MenuItem value="IT Department">IT Department</MenuItem>
                </Select>
              </FormControl>
              <TextField value={formTitle} onChange={(e) => setFormTitle(e.target.value)} label="Required" variant="standard" InputProps={{ readOnly: isPreviewMode }} />
              <TextField value={formDescription} onChange={(e) => setFormDescription(e.target.value)} label="Required" variant="standard" InputProps={{ readOnly: isPreviewMode }} />
            </Paper>
  
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {questions.map((question, index) => (
                      <Draggable key={question.id.toString()} draggableId={question.id.toString()} index={index} isDragDisabled={isPreviewMode}>
                        {(provided) => (
                          <Paper ref={provided.innerRef} {...provided.draggableProps} elevation={20} sx={{ width: "50%", padding: 5, mb: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Grid container direction="row" gap={4}>
                              {!isPreviewMode && (<Grid item {...provided.dragHandleProps}><DragIndicator /></Grid>)}
                              <Grid item xs>
                                <Grid container direction="column" gap={2}>
                                  <Stack direction="row" spacing={2} alignItems="center">
                                    <TextField value={question.title} onChange={(e) => handleQuestionUpdate(question.id, "title", e.target.value)} variant="standard" InputProps={{ readOnly: isPreviewMode }} fullWidth />
                                    {!isPreviewMode && (<FormControlLabel control={<Checkbox checked={question.required || false} onChange={(e) => handleQuestionUpdate(question.id, "required", e.target.checked)} color="primary" />} label="Required" />)}
                                    {isPreviewMode && question.required && (<Typography color="error">*</Typography>)}
                                  </Stack>
                                  {!isPreviewMode && (
                                    <FormControl fullWidth>
                                      <InputLabel>Question Type</InputLabel>
                                      <Select value={question.type} label="Question Type" onChange={(e) => handleQuestionUpdate(question.id, "type", e.target.value)}>
                                        <MenuItem value="Checkbox">Checkbox</MenuItem>
                                        <MenuItem value="Multiple choice">Multiple choice</MenuItem>
                                        <MenuItem value="Drop down">Drop down</MenuItem>
                                        <MenuItem value="Short answer">Short answer</MenuItem>
                                        <MenuItem value="Paragraph">Paragraph</MenuItem>
                                      </Select>
                                    </FormControl>
                                  )}
                                  {renderDynamicInput(question)}
                                </Grid>
                              </Grid>
                              {!isPreviewMode && (
                                <Grid item>
                                  <Stack direction="row" spacing={1}>
                                    <Tooltip title="Duplicate"><IconButton onClick={() => handleDuplicate(question)}><FileCopy /></IconButton></Tooltip>
                                    <Tooltip title="Delete"><IconButton onClick={() => handleRemoveQuestion(question.id)}><Delete /></IconButton></Tooltip>
                                  </Stack>
                                </Grid>
                              )}
                            </Grid>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button variant="contained" size="large" sx={{ backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" } }} onClick={handleSubmit}>Submit</Button>
          </Box>
        </Box>
  
        {showSuccessPopup && (
          <FormSuccessPopup
            formId={newFormId}
            onClose={() => setShowSuccessPopup(false)}
          />

        )}<Dialog open={openDialog} onClose={() => setOpenDialog(false)}> 
                <DialogTitle>Login Required</DialogTitle> 
                <DialogContent> 
                  <Typography variant="body1">{dialogMessage}</Typography> 
                </DialogContent> 
                <DialogActions> 
                  <Button onClick={() => setOpenDialog(false)} color="primary">Close</Button> 
                  <Button onClick={() => { window.location.href = '/'; }} color="primary">Login</Button> 
                </DialogActions> 
              </Dialog> 
      <Footer />
    </>
  );
}
