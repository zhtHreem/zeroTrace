import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import Shell from "../Landing/Chrome";
import FormSuccessPopup from "./popup";
import useAuth from "../Landing/useAuth";

const TYPES = ["Checkbox", "Multiple choice", "Drop down", "Short answer", "Paragraph"];
const CHOICE_TYPES = ["Checkbox", "Multiple choice", "Drop down"];
const DEPARTMENTS = ["Finance Department", "Operational Department", "Marketing Department", "HR Department", "IT Department"];
const UNIT_SECONDS = { seconds: 1, minutes: 60, hours: 3600, days: 86400 };

export default function NewForm() {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [decryptionTime, setDecryptionTime] = useState(1);
  const [decryptionUnit, setDecryptionUnit] = useState("hours");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [newFormId, setNewFormId] = useState(null);
  const [category, setCategory] = useState("");
  const { user, login } = useAuth();

  const calculateTotalSeconds = (time, unit) => time * (UNIT_SECONDS[unit] || 3600);

  const validateForm = () => {
    if (!formTitle.trim() || !formDescription.trim()) { toast.error("Title and description are required."); return false; }
    if (decryptionTime < 1) { toast.error("Unlock time must be at least 1 unit."); return false; }
    if (!category.trim()) { toast.error("Choose a department."); return false; }
    if (questions.length === 0) { toast.error("Add at least one question."); return false; }
    return true;
  };

  const handleSubmit = async () => {
    const userId = JSON.parse(localStorage.getItem("user"));
    if (!userId) { toast.info("Please sign in (top right) to publish your survey."); return; }
    if (!validateForm()) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: formTitle,
          description: formDescription,
          questions,
          user: userId,
          decryptionTime: calculateTotalSeconds(decryptionTime, decryptionUnit),
          decryptionUnit: "seconds", // Always store in seconds in backend
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error saving form");
      }
      const data = await response.json();
      setNewFormId(data.form._id);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error(error.message || "Something went wrong while saving the survey.");
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setQuestions(items);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now(), title: "", type: "Short answer", options: [], newOption: "", required: false }]);
  };
  const handleDuplicate = (q) => setQuestions([...questions, { ...q, id: Date.now(), title: `${q.title} (copy)` }]);
  const handleRemoveQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id));
  const handleQuestionUpdate = (id, field, value) => setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  const handleAddOption = (id) =>
    setQuestions((prev) => prev.map((q) => (q.id === id && q.newOption.trim() !== "" ? { ...q, options: [...q.options, q.newOption], newOption: "" } : q)));
  const handleRemoveOption = (id, idx) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q)));

  const renderOptionAdder = (q) =>
    !isPreviewMode && (
      <div className="zt-addopt">
        <input
          className="zt-input"
          placeholder="Add an option and press Enter"
          value={q.newOption || ""}
          onChange={(e) => handleQuestionUpdate(q.id, "newOption", e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOption(q.id); } }}
        />
        <button type="button" className="zt-btn sm" onClick={() => handleAddOption(q.id)}>Add</button>
      </div>
    );

  const renderDynamicInput = (q) => {
    const req = q.required && isPreviewMode;
    const removable = (i) =>
      !isPreviewMode && <button type="button" className="zt-x" aria-label="Remove option" onClick={() => handleRemoveOption(q.id, i)}>×</button>;
    switch (q.type) {
      case "Checkbox":
      case "Multiple choice": {
        const kind = q.type === "Checkbox" ? "checkbox" : "radio";
        return (
          <div>
            {q.options.length ? q.options.map((o, i) => (
              <label key={i} className="zt-opt">
                <input type={kind} name={`q${q.id}`} required={req && kind === "radio"} />
                <span style={{ flex: 1 }}>{o}</span>
                {removable(i)}
              </label>
            )) : <p className="zt-hint">No options yet.</p>}
            {renderOptionAdder(q)}
          </div>
        );
      }
      case "Drop down":
        return (
          <div>
            <select className="zt-select" required={req} defaultValue="">
              <option value="" disabled>Select an option</option>
              {q.options.map((o, i) => <option key={i}>{o}</option>)}
            </select>
            {!isPreviewMode && q.options.map((o, i) => (
              <div key={i} className="zt-opt"><span style={{ flex: 1 }}>{o}</span>{removable(i)}</div>
            ))}
            {renderOptionAdder(q)}
          </div>
        );
      case "Short answer":
        return <input className="zt-input" placeholder="Short answer" required={req} />;
      case "Paragraph":
        return <textarea className="zt-textarea" placeholder="Paragraph" required={req} />;
      default:
        return null;
    }
  };

  return (
    <Shell>
      <div className="zt-page">
        <div className="zt-narrow">
          <div className="zt-row">
            <div>
              <div className="zt-mono">{isPreviewMode ? "Preview" : "New survey"}</div>
              <h1 className="zt-page-title">{formTitle || "Untitled survey"}</h1>
            </div>
            <div className="zt-actions">
              <button className="zt-btn sm" onClick={() => setIsPreviewMode(!isPreviewMode)}>{isPreviewMode ? "← Back to editing" : "Preview"}</button>
            </div>
          </div>

          {!user && (
            <div className="zt-note" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span><b>Sign in to publish.</b> You can build your survey now, but you’ll need an account to publish it.</span>
              <button className="zt-btn sm primary" onClick={() => login()}>Sign in with Google</button>
            </div>
          )}

          <div className="zt-panel" style={{ marginTop: 36 }}>
            <div className="zt-field-row">
              <label className="zt-label">Department</label>
              <select className="zt-select" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isPreviewMode}>
                <option value="" disabled>Choose who this survey is for</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="zt-field-row">
              <label className="zt-label">Title</label>
              <input className="zt-input" value={formTitle} placeholder="e.g. Quarterly team health check" onChange={(e) => setFormTitle(e.target.value)} readOnly={isPreviewMode} />
            </div>
            <div className="zt-field-row">
              <label className="zt-label">Description</label>
              <textarea className="zt-textarea" value={formDescription} placeholder="Tell respondents what this is for and how their answers are used." onChange={(e) => setFormDescription(e.target.value)} readOnly={isPreviewMode} />
            </div>
            <div>
              <label className="zt-label">Results unlock after</label>
              <div className="zt-grid-2" style={{ gap: 14 }}>
                <input className="zt-input" type="number" min="1" value={decryptionTime} onChange={(e) => setDecryptionTime(Number(e.target.value))} disabled={isPreviewMode} />
                <select className="zt-select" value={decryptionUnit} onChange={(e) => setDecryptionUnit(e.target.value)} disabled={isPreviewMode}>
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              <p className="zt-hint">Responses stay encrypted until this time has passed. Nobody, including you, can read them sooner.</p>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {questions.map((q, index) => (
                    <Draggable key={q.id.toString()} draggableId={q.id.toString()} index={index} isDragDisabled={isPreviewMode}>
                      {(drag) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} className="zt-panel" style={{ ...drag.draggableProps.style, marginTop: 18 }}>
                          <div className="zt-qhead">
                            {!isPreviewMode && <span className="zt-grip" {...drag.dragHandleProps} title="Drag to reorder">⠿</span>}
                            <span className="zt-mono">Q{String(index + 1).padStart(2, "0")}</span>
                            {isPreviewMode && q.required && <span className="zt-tag red">Required</span>}
                            {!isPreviewMode && (
                              <span className="zt-qtools">
                                <button type="button" className="zt-link" onClick={() => handleDuplicate(q)}>Duplicate</button>
                                <button type="button" className="zt-link danger" onClick={() => handleRemoveQuestion(q.id)}>Delete</button>
                              </span>
                            )}
                          </div>
                          <input
                            className="zt-input zt-qtitle"
                            value={q.title}
                            placeholder="Your question"
                            onChange={(e) => handleQuestionUpdate(q.id, "title", e.target.value)}
                            readOnly={isPreviewMode}
                          />
                          {!isPreviewMode && (
                            <div className="zt-grid-2" style={{ gap: 14, margin: "18px 0" }}>
                              <select className="zt-select" value={q.type} onChange={(e) => handleQuestionUpdate(q.id, "type", e.target.value)}>
                                {TYPES.map((t) => <option key={t}>{t}</option>)}
                              </select>
                              <label className="zt-check">
                                <input type="checkbox" checked={q.required || false} onChange={(e) => handleQuestionUpdate(q.id, "required", e.target.checked)} /> Required
                              </label>
                            </div>
                          )}
                          <div style={{ marginTop: isPreviewMode ? 18 : 0 }}>{renderDynamicInput(q)}</div>
                          {!isPreviewMode && CHOICE_TYPES.includes(q.type) && q.options.length === 0 && null}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {!isPreviewMode && (
            <button className="zt-add" onClick={handleAddQuestion}>+ Add a question</button>
          )}

          <hr className="zt-sep" />
          <div className="zt-actions" style={{ justifyContent: "space-between" }}>
            <span className="zt-mono">{questions.length} question{questions.length === 1 ? "" : "s"}</span>
            <button className="zt-btn primary" onClick={handleSubmit}>Publish survey →</button>
          </div>
        </div>
      </div>

      {showSuccessPopup && <FormSuccessPopup formId={newFormId} onClose={() => setShowSuccessPopup(false)} />}
    </Shell>
  );
}
