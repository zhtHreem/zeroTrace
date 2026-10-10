import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import Shell from '../Landing/Chrome';
import Recaptcha from '../Recapcha/recapcha';

const FormResponsePreview = () => {
  const [formData, setFormData] = useState(null);
  const [allResponses, setAllResponses] = useState({});
  const [responseId, setResponseId] = useState(null);
  const [decryptedResponse, setDecryptedResponse] = useState(null);
  const [unlockAt, setUnlockAt] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle, submitted, decrypted
  const [formStatus, setFormStatus] = useState('loading'); // loading, active, closed, draft, error
  const [timeRemaining, setTimeRemaining] = useState(null); // Countdown for decryption
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const userId = JSON.parse(localStorage.getItem('uid'));

  const { id } = useParams();
  const formId = id;

  const clearForm = () => {
    setAllResponses({});
    setErrors({});
    setIsCaptchaVerified(false);
    const form = document.getElementById('responseForm');
    if (form) form.reset();
  };

  // Fetch form data and status
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/forms/${formId}`);
        const data = await response.json();

        if (data.status === 'draft') setFormStatus('draft');
        else if (data.status === 'active') setFormStatus('active');
        else if (data.status === 'closed') setFormStatus('closed');
        else setFormStatus('error');

        setFormData(data);
        if (data.encryptionEndTime) {
          const remainingTime = new Date(data.encryptionEndTime) - new Date();
          setTimeRemaining(remainingTime > 0 ? remainingTime : 0);
        }
      } catch (error) {
        console.error('Error fetching form:', error);
        toast.error('Error loading form data');
        setFormStatus('error');
      }
    };
    fetchForm();
  }, [formId]);

  useEffect(() => {
    if (responseId) {
      setStatus('submitted');
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/responses/${responseId}`);
          if (res.ok) {
            const data = await res.json();
            setDecryptedResponse(data.decryptedAnswers);
            setStatus('decrypted');
            clearInterval(interval);
          } else if (res.status === 403) {
            const { unlockAt: unlockTime } = await res.json();
            setUnlockAt(new Date(unlockTime));
          }
        } catch (error) {
          console.error('Error fetching decrypted response:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [responseId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining((prev) => prev - 1000), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const handleResponseChange = (questionId, value) => {
    setAllResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCaptchaChange = (value) => setIsCaptchaVerified(!!value);

  const handleSubmit = async () => {
    try {
      if (!userId) {
        toast.info('Please sign in (top right) to submit your response.');
        return;
      }
      if (formData?.user === userId) {
        toast.info('You can’t answer your own survey.');
        return;
      }
      if (formStatus !== 'active') {
        toast.error('This survey is not active. Submissions are not allowed.');
        return;
      }
      if (!isCaptchaVerified) {
        toast.error('Please complete the verification first.');
        return;
      }

      const newErrors = {};
      const requiredQuestions = formData.questions.filter((q) => q.required);
      const unansweredRequired = requiredQuestions.filter((q) => !allResponses[q._id]);
      if (unansweredRequired.length > 0) {
        unansweredRequired.forEach((q) => (newErrors[q._id] = true));
        setErrors(newErrors);
        toast.error('Please answer all required questions before submitting.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, responses: allResponses, user: userId }),
      });
      const data = await response.json();

      if (!response.ok) {
        switch (data.code) {
          case 'DUPLICATE_SUBMISSION': toast.warning('You’ve already submitted this survey.'); break;
          case 'FORM_NOT_FOUND': toast.error('This survey no longer exists.'); break;
          case 'MISSING_FIELDS': toast.error('Please fill in all required fields.'); break;
          default: toast.error('An error occurred while submitting.');
        }
        throw new Error(data.message);
      }

      toast.success('Response submitted.');
      setResponseId(data.data.responseId);
      setUnlockAt(new Date(data.data.unlockAt));
      clearForm();
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'Short answer':
        return (
          <input className="zt-input" placeholder="Type your answer" required={question.required}
            onChange={(e) => handleResponseChange(question._id, e.target.value)} />
        );
      case 'Paragraph':
        return (
          <textarea className="zt-textarea" rows={4} placeholder="Type your answer" required={question.required}
            onChange={(e) => handleResponseChange(question._id, e.target.value)} />
        );
      case 'Multiple choice':
        return question.options.map((option, idx) => (
          <label key={idx} className={`zt-opt${allResponses[question._id] === option ? ' on' : ''}`}>
            <input type="radio" name={question._id} value={option} checked={allResponses[question._id] === option}
              onChange={(e) => handleResponseChange(question._id, e.target.value)} />
            {option}
          </label>
        ));
      case 'Checkbox':
        return question.options.map((option, idx) => {
          const selected = allResponses[question._id] || [];
          const checked = selected.includes(option);
          return (
            <label key={idx} className={`zt-opt${checked ? ' on' : ''}`}>
              <input type="checkbox" checked={checked}
                onChange={(e) => handleResponseChange(question._id, e.target.checked ? [...selected, option] : selected.filter((i) => i !== option))} />
              {option}
            </label>
          );
        });
      case 'Drop down':
        return (
          <select className="zt-select" value={allResponses[question._id] || ''} required={question.required}
            onChange={(e) => handleResponseChange(question._id, e.target.value)}>
            <option value="" disabled>Select an option</option>
            {question.options.map((option, idx) => <option key={idx} value={option}>{option}</option>)}
          </select>
        );
      default:
        return <p className="zt-hint">Unsupported question type.</p>;
    }
  };

  if (formStatus === 'loading') return <Shell><div className="zt-center">Loading survey…</div></Shell>;
  if (formStatus === 'error' || !formData) return <Shell><div className="zt-center">We couldn’t load this survey.</div></Shell>;

  const statusTag = { active: 'Open', draft: 'Draft', closed: 'Closed' }[formStatus];
  const hh = timeRemaining > 0 ? new Date(timeRemaining).toISOString().substr(11, 8) : null;

  return (
    <Shell>
      <div className="zt-page">
        <div className="zt-narrow">
          <div className="zt-actions" style={{ marginBottom: 6 }}>
            <span className="zt-tag solid">{statusTag}</span>
            {formData.category && <span className="zt-tag">{formData.category}</span>}
          </div>
          <h1 className="zt-page-title">{formData.title}</h1>
          <p className="zt-page-sub">{formData.description}</p>
          <div className="zt-note">
            <b>Your answers are anonymous.</b> We verify you’re a real, unique person, but your identity is never attached to what you write.
          </div>

          {formStatus === 'draft' && <p className="zt-hint red">This survey is a draft and can’t accept responses yet.</p>}
          {formStatus === 'closed' && (
            <div className="zt-panel" style={{ marginTop: 28 }}>
              <span className="zt-tag solid">Closed</span>
              <h2 className="zt-page-title" style={{ fontSize: 36, marginTop: 14 }}>This survey has ended.</h2>
              <p className="zt-page-sub">See what everyone said. The results are open to all.</p>
              <div className="zt-actions" style={{ marginTop: 22 }}><a className="zt-btn primary" href={`/results/${formId}`}>View results →</a></div>
            </div>
          )}

          {formStatus === 'active' && status === 'idle' && (
            <>
              <form id="responseForm" onSubmit={(e) => e.preventDefault()}>
                {formData.questions.map((question, index) => (
                  <div key={`${question._id}-${index}`} className={`zt-panel zt-ask${errors[question._id] ? ' err' : ''}`} style={{ marginTop: 18 }}>
                    <div className="zt-qhead">
                      <span className="zt-mono">Q{String(index + 1).padStart(2, '0')}</span>
                      {question.required && <span className="zt-tag red">Required</span>}
                    </div>
                    <h3 className="zt-ask-t">{question.title}</h3>
                    {renderQuestion(question)}
                    {errors[question._id] && <p className="zt-hint red">This question is required.</p>}
                  </div>
                ))}
              </form>

              <div className="zt-panel flat" style={{ marginTop: 26 }}>
                <label className="zt-label">Verify you’re human</label>
                <Recaptcha onChange={handleCaptchaChange} />
              </div>

              <div className="zt-actions" style={{ marginTop: 26, justifyContent: 'space-between' }}>
                <span className="zt-mono">{hh ? `Results unlock in ${hh}` : 'Results are time-locked'}</span>
                <button className="zt-btn primary" onClick={handleSubmit}>Submit anonymously →</button>
              </div>
            </>
          )}

          {status !== 'idle' && (
            <div className="zt-panel" style={{ marginTop: 28 }}>
              <span className="zt-tag red">Sealed</span>
              <h2 className="zt-page-title" style={{ fontSize: 38, marginTop: 14 }}>Thank you. Your answer is in.</h2>
              {status === 'submitted' && unlockAt && (
                <p className="zt-page-sub">It’s encrypted and will open on <b>{new Date(unlockAt).toLocaleString()}</b>. You can leave this page; nothing links it back to you.</p>
              )}
              {status === 'decrypted' && decryptedResponse && (
                <>
                  <p className="zt-page-sub">The time-lock has passed. Here’s what you submitted. <a href={`/results/${formId}`} style={{ textDecoration: 'underline' }}>See what everyone said →</a></p>
                  <div style={{ marginTop: 18 }}>
                    {decryptedResponse.map((item, index) => (
                      <div key={index} className="zt-answer">
                        <div className="zt-mono">{item.questionTitle}</div>
                        <p>{Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
};

export default FormResponsePreview;
