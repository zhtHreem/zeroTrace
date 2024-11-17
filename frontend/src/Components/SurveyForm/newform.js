import { Box, TextField, Input, Stack, Typography, Paper, FormControl, Select, InputLabel, MenuItem, Grid, Checkbox, FormControlLabel, Button, RadioGroup, Radio, IconButton, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import { Delete, DragIndicator, FileCopy, Preview, Edit, Add } from "@mui/icons-material";
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function NewForm() {
    const [formTitle, setFormTitle] = useState("Untitled Form");
    const [formDescription, setFormDescription] = useState("Description");
    const [questions, setQuestions] = useState([]);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Handle drag and drop reordering
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        const items = Array.from(questions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        setQuestions(items);
    };

    // Handle adding a new question
    const handleAddQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            title: "Untitled Question",
            type: "",
            options: [],
            newOption: ""
        };
        setQuestions([...questions, newQuestion]);
    };

    // Handle duplicating a question
    const handleDuplicate = (question) => {
        const duplicatedQuestion = {
            ...question,
            id: Date.now(),
            title: `${question.title} (Copy)`
        };
        setQuestions([...questions, duplicatedQuestion]);
    };

    // Handle adding a new custom option to a specific question
    const handleAddOption = (questionId) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.newOption.trim() !== "") {
                return {
                    ...q,
                    options: [...q.options, q.newOption],
                    newOption: ""
                };
            }
            return q;
        }));
    };

    // Handle removing an option from a specific question
    const handleRemoveOption = (questionId, optionIndex) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    options: q.options.filter((_, i) => i !== optionIndex)
                };
            }
            return q;
        }));
    };

    // Handle removing a question
    const handleRemoveQuestion = (id) => {
        setQuestions(questions.filter(question => question.id !== id));
    };

    // Handle updating a question's properties
    const handleQuestionUpdate = (questionId, field, value) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return { ...q, [field]: value };
            }
            return q;
        }));
    };

    const renderDynamicInput = (question) => {
        switch (question.type) {
            case "Checkbox":
                return (
                    <FormControl component="fieldset">
                        <List>
                            {question.options.length > 0 ? (
                                question.options.map((option, index) => (
                                    <ListItem  key={index}  secondaryAction={
                                            !isPreviewMode && (
                                                <IconButton edge="end" onClick={() => handleRemoveOption(question.id, index)}>
                                                    <Delete />
                                                </IconButton>
                                            )
                                        }
                                    >
                                        <FormControlLabel control={<Checkbox />} label={option} />
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
                                <TextField   label="Add Option"   value={question.newOption || ""}     onChange={(e) => handleQuestionUpdate(question.id, "newOption", e.target.value)}        variant="outlined"     size="small"  />
                                <Button onClick={() => handleAddOption(question.id)} variant="contained" size="small" sx={{ ml: 1 ,backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" }}}>
                                    Add
                                </Button>
                            </Box>
                        )}
                    </FormControl>
                );
            case "Multiple choice":
                return (
                    <FormControl component="fieldset">
                        <RadioGroup>
                            <List>
                                {question.options.length > 0 ? (
                                    question.options.map((option, index) => (
                                        <ListItem key={index}   secondaryAction={
                                          !isPreviewMode && (  
                                             <IconButton edge="end" onClick={() => handleRemoveOption(question.id, index)}>
                                                        <Delete />  
                                             </IconButton> )} >
                                            <FormControlLabel control={<Radio />} label={option} value={option} />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No options added yet.
                                    </Typography>
                                )}
                            </List>
                        </RadioGroup>
                        {!isPreviewMode && (
                            <Box mt={2}>
                                <TextField label="Add Option" value={question.newOption || ""}  onChange={(e) => handleQuestionUpdate(question.id, "newOption", e.target.value)}
                                    variant="outlined"     size="small" />
                                <Button onClick={() => handleAddOption(question.id)} variant="contained" size="small" sx={{ ml: 1,backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" } }}>
                                    Add
                                </Button>
                            </Box>
                        )}
                    </FormControl>
                );
            case "Drop down":
                return (
                    <FormControl fullWidth>
                        <InputLabel>Select an Option</InputLabel>
                        <Select>
                            {question.options.length > 0 ? (
                                question.options.map((option, index) => (
                                    <MenuItem key={index} value={option}>
                                        {option}
                                        {!isPreviewMode && (
                                            <IconButton edge="end" size="small" onClick={() => handleRemoveOption(question.id, index)}>
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No options available</MenuItem>
                            )}
                        </Select>
                        {!isPreviewMode && (
                            <Box mt={2}>
                                <TextField   label="Add Option"  value={question.newOption || ""}   onChange={(e) => handleQuestionUpdate(question.id, "newOption", e.target.value)}   variant="outlined"   size="small" />
                                <Button onClick={() => handleAddOption(question.id)} variant="contained" size="small" sx={{ ml: 1,backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" } }}>
                                    Add
                                </Button>
                            </Box>
                        )}
                    </FormControl>
                );
            case "Short answer":
                return <TextField label="Short Answer" variant="outlined" fullWidth />;
            case "Paragraph":
                return <TextField label="Paragraph" variant="outlined" multiline rows={4} fullWidth />;
            default:
                return null;
        }
    };

   return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Header */}
            <Box p={4} sx={{ backgroundColor: "#C1CFA1", width: '100%', mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row">
                        <Box component="img" sx={{ height: "10%", width: "10%" }} src={require("./images/surveyform.svg")} />
                        <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} disableUnderline readOnly={isPreviewMode} />
                    </Stack>
                    
                    <Stack direction="row" spacing={2}>
                        <Button startIcon={<Add />} onClick={handleAddQuestion} variant="contained" disabled={isPreviewMode} sx={{backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" }}}>
                            Add Question
                        </Button>
                        <Button startIcon={isPreviewMode ? <Edit /> : <Preview />} onClick={() => setIsPreviewMode(!isPreviewMode)} variant="contained" sx={{backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" }}}>
                            {isPreviewMode ? "Edit Mode" : "Preview Mode"}
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {/* Form Title and Description */}
                <Paper elevation={20} sx={{ width: "50%", padding: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <TextField value={formTitle} onChange={(e) => setFormTitle(e.target.value)} label="Required" variant="standard" InputProps={{ readOnly: isPreviewMode }} />
                    <TextField value={formDescription} onChange={(e) => setFormDescription(e.target.value)} label="Required" variant="standard" InputProps={{ readOnly: isPreviewMode }} />
                </Paper>

                {/* Questions List with Drag and Drop */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="questions">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {questions.map((question, index) => (
                                    <Draggable key={question.id} draggableId={question.id.toString()} index={index} isDragDisabled={isPreviewMode}>
                                        {(provided) => (
                                            <Paper ref={provided.innerRef} {...provided.draggableProps} elevation={20} 
                                                sx={{ width: "50%", padding: 5, mb: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <Grid container direction="row" gap={4}>
                                                    {!isPreviewMode && (
                                                        <Grid item {...provided.dragHandleProps}>
                                                            <DragIndicator />
                                                        </Grid>
                                                    )}
                                                    <Grid item xs>
                                                        <Grid container direction="column" gap={2}>
                                                            <TextField value={question.title} onChange={(e) => handleQuestionUpdate(question.id, "title", e.target.value)} 
                                                                variant="standard" InputProps={{ readOnly: isPreviewMode }} />
                                                            
                                                            {!isPreviewMode && (
                                                                <FormControl fullWidth>
                                                                    <InputLabel>Question Type</InputLabel>
                                                                    <Select value={question.type} label="Question Type" 
                                                                        onChange={(e) => handleQuestionUpdate(question.id, "type", e.target.value)}>
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
                                                                <Tooltip title="Duplicate">
                                                                    <IconButton onClick={() => handleDuplicate(question)}>
                                                                        <FileCopy />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete">
                                                                    <IconButton onClick={() => handleRemoveQuestion(question.id)}>
                                                                        <Delete />
                                                                    </IconButton>
                                                                </Tooltip>
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

                {/* Submit Button */}
               <Button variant="contained" size="large" sx={{ backgroundColor: "#3A6351", mt: 4, mb: 4, '&:hover': { backgroundColor: "#2C4F3B" } }}
                    onClick={() => console.log("Form submitted:", { formTitle, formDescription, questions })}>
                    Submit
                </Button>
            </Box>
        </Box>
    );
}