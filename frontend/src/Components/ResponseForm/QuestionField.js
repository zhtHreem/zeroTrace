import React from 'react';

// One survey question as a respondent sees it. Shared by the real respond page and the
// builder's preview, so the two can never drift apart.
export default function QuestionField({ question, value, onChange }) {
  const id = question._id;
  const options = question.options || [];

  switch (question.type) {
    case 'Short answer':
      return <input className="zt-input" placeholder="Type your answer" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'Paragraph':
      return <textarea className="zt-textarea" rows={4} placeholder="Type your answer" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'Multiple choice':
      if (!options.length) return <p className="zt-hint">No options added yet.</p>;
      return options.map((option, idx) => (
        <label key={idx} className={`zt-opt${value === option ? ' on' : ''}`}>
          <input type="radio" name={id} value={option} checked={value === option} onChange={(e) => onChange(e.target.value)} />
          {option}
        </label>
      ));
    case 'Checkbox': {
      if (!options.length) return <p className="zt-hint">No options added yet.</p>;
      const selected = value || [];
      return options.map((option, idx) => {
        const checked = selected.includes(option);
        return (
          <label key={idx} className={`zt-opt${checked ? ' on' : ''}`}>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked ? [...selected, option] : selected.filter((i) => i !== option))} />
            {option}
          </label>
        );
      });
    }
    case 'Drop down':
      return (
        <select className="zt-select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="" disabled>Select an option</option>
          {options.map((option, idx) => <option key={idx} value={option}>{option}</option>)}
        </select>
      );
    default:
      return <p className="zt-hint">Unsupported question type.</p>;
  }
}
