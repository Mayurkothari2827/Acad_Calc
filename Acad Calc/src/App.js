import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const gradePoints = {
  'A++': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D+': 4.5, 'D': 4, 'E+': 3, 'F': 0
};

const gradeOptions = [
  { label: '-- Select Grade --', value: '' },
  { label: 'A++ (10)', value: 'A++' },
  { label: 'A+ (10)', value: 'A+' },
  { label: 'A (9)', value: 'A' },
  { label: 'B+ (8)', value: 'B+' },
  { label: 'B (7)', value: 'B' },
  { label: 'C+ (6)', value: 'C+' },
  { label: 'C (5)', value: 'C' },
  { label: 'D+ (4.5)', value: 'D+' },
  { label: 'D (4)', value: 'D' },
  { label: 'E+ (3)', value: 'E+' },
  { label: 'F (0)', value: 'F' },
];

function calculateSGPA(subjects) {
  let totalCredits = 0, totalGradePoints = 0, subjectCount = 0, validSubjects = 0;
  for (const subject of subjects) {
    if (subject.grade) {
      const gradePoint = gradePoints[subject.grade];
      if (gradePoint !== undefined) {
        validSubjects++;
        if (subject.credits && subject.credits.trim() !== '') {
          const credits = parseFloat(subject.credits);
          if (credits > 0) {
            totalCredits += credits;
            totalGradePoints += gradePoint * credits;
          }
        } else {
          totalGradePoints += gradePoint;
          subjectCount++;
        }
      }
    }
  }
  if (validSubjects === 0) return '';
  let sgpa;
  if (totalCredits > 0) {
    sgpa = totalGradePoints / totalCredits;
    return sgpa.toFixed(2);
  } else {
    sgpa = totalGradePoints / subjectCount;
    return sgpa.toFixed(2);
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('sgpa');
  const [subjects, setSubjects] = useState([{ id: 1, name: '', grade: '', credits: '' }]);
  const [semesters, setSemesters] = useState([{ id: 1, semester: '', sgpa: '', credits: '' }]);
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [touched, setTouched] = useState({});
  const firstInputRef = useRef(null);
  const [showCreditsInfo, setShowCreditsInfo] = useState(false);
  const [cgpaTouched, setCgpaTouched] = useState({});
  const firstSemesterInputRef = useRef(null);

  // Auto-focus first Subject Name
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [subjects.length, activeTab]);

  // Auto-focus first Semester Name
  useEffect(() => {
    if (firstSemesterInputRef.current && activeTab === 'cgpa') {
      firstSemesterInputRef.current.focus();
    }
  }, [semesters.length, activeTab]);

  // Validation helpers
  const isInvalid = (subject, idx) => {
    return touched[idx] && (!subject.name || !subject.grade);
  };

  // CGPA validation helpers
  const isCgpaInvalid = (semester, idx) => {
    return cgpaTouched[idx] && (!semester.semester || !semester.sgpa);
  };
  const handleCgpaBlur = idx => setCgpaTouched({ ...cgpaTouched, [idx]: true });

  // Subject handlers
  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: '', grade: '', credits: '' }]);
  };
  const removeSubject = id => subjects.length > 1 && setSubjects(subjects.filter(s => s.id !== id));
  const updateSubject = (id, field, value) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const handleBlur = idx => setTouched({ ...touched, [idx]: true });

  // Semester handlers (unchanged)
  const addSemester = () => setSemesters([...semesters, { id: Date.now(), semester: '', sgpa: '', credits: '' }]);
  const removeSemester = id => semesters.length > 1 && setSemesters(semesters.filter(s => s.id !== id));
  const updateSemester = (id, field, value) => setSemesters(semesters.map(s => s.id === id ? { ...s, [field]: value } : s));

  // Calculation logic (unchanged)
  const calculateCGPA = () => {
    setIsCalculating(true);
    setTimeout(() => {
      let totalCredits = 0, totalGradePoints = 0, validSemesters = 0, sgpaSum = 0, sgpaCount = 0;
      let hasCredits = false;
      for (const semester of semesters) {
        if (semester.sgpa !== "" && !isNaN(parseFloat(semester.sgpa))) {
          const sgpa = parseFloat(semester.sgpa);
          if (sgpa >= 0 && sgpa <= 10) {
            if (semester.credits && !isNaN(parseFloat(semester.credits)) && parseFloat(semester.credits) > 0) {
              hasCredits = true;
              const credits = parseFloat(semester.credits);
              totalCredits += credits;
              totalGradePoints += sgpa * credits;
              validSemesters++;
            } else {
              sgpaSum += sgpa;
              sgpaCount++;
            }
          }
        }
      }
      let cgpa = null;
      let calculationType = null;
      if (hasCredits && totalCredits > 0) {
        cgpa = totalGradePoints / totalCredits;
        calculationType = 'credit-weighted';
      } else if (sgpaCount > 0) {
        cgpa = sgpaSum / sgpaCount;
        calculationType = 'simple-average';
      }
      if (cgpa === null) {
        setResult({ type: 'error', message: 'Please enter valid SGPA for at least one semester' });
        setIsCalculating(false);
        return;
      }
      setResult({ type: 'cgpa', value: cgpa.toFixed(2), calculationType });
      setIsCalculating(false);
    }, 600);
  };

  const resetCalculator = () => {
    if (activeTab === 'sgpa') {
      setSubjects([{ id: 1, name: '', grade: '', credits: '' }]);
      setTouched({});
    } else {
      setSemesters([{ id: 1, semester: '', sgpa: '', credits: '' }]);
      setCgpaTouched({}); // Reset CGPA touched state
    }
    setResult(null);
  };

  const getGradeLevel = value => {
    const val = parseFloat(value);
    if (val >= 9.5) return 'Outstanding';
    if (val >= 9) return 'Excellent';
    if (val >= 8) return 'Very Good';
    if (val >= 7) return 'Good';
    if (val >= 6) return 'Satisfactory';
    return 'Improvement Needed';
  };

  // Real-time SGPA preview
  const sgpaPreview = calculateSGPA(subjects);

  // SVG for bin/trash icon
  const BinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect x="5.5" y="8" width="1.5" height="6" rx="0.75" fill="currentColor"/>
      <rect x="9.25" y="8" width="1.5" height="6" rx="0.75" fill="currentColor"/>
      <rect x="13" y="8" width="1.5" height="6" rx="0.75" fill="currentColor"/>
      <path d="M3 6.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="6" y="3" width="8" height="2.5" rx="1.25" fill="currentColor"/>
      <path d="M7 5.5V4.5C7 3.94772 7.44772 3.5 8 3.5H12C12.5523 3.5 13 3.94772 13 4.5V5.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="4" y="6.5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );

  return (
    <div className="app-root">
      <div className="header">
        <h1>ACADCALC</h1>
        <p className="subtitle">Academic Performance Calculator</p>
      </div>
      <div className="tab-nav">
        <button className={activeTab === 'sgpa' ? 'active' : ''} onClick={() => { setActiveTab('sgpa'); setResult(null); }}>
          SGPA Calculator
        </button>
        <button className={activeTab === 'cgpa' ? 'active' : ''} onClick={() => { setActiveTab('cgpa'); setResult(null); }}>
          CGPA Calculator
        </button>
      </div>
      {activeTab === 'sgpa' && (
        <div className="panel sgpa-panel">
          <h2>SGPA Calculator</h2>
          <div className="subject-list">
            {subjects.map((subject, idx) => (
              <div className={`subject-row${isInvalid(subject, idx) ? ' invalid' : ''}`} key={subject.id}>
                <span className="subject-num">{idx + 1}</span>
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={subject.name}
                  ref={idx === 0 ? firstInputRef : null}
                  onChange={e => updateSubject(subject.id, 'name', e.target.value)}
                  onBlur={() => handleBlur(idx)}
                />
                <select
                  value={subject.grade}
                  onChange={e => updateSubject(subject.id, 'grade', e.target.value)}
                  onBlur={() => handleBlur(idx)}
                >
                  {gradeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="credits-input-wrapper">
                  <input
                    type="number"
                    placeholder="Credits (optional)"
                    value={subject.credits}
                    min="0"
                    step="0.5"
                    onChange={e => updateSubject(subject.id, 'credits', e.target.value)}
                  />
                </div>
                <button className="remove-btn" onClick={() => removeSubject(subject.id)} disabled={subjects.length === 1}>
                  <BinIcon />
                </button>
              </div>
            ))}
          </div>
          <div className="panel-actions">
            <button className="add-btn" onClick={addSubject}>
              Add Subject
            </button>
            <button className="calc-btn" onClick={() => setResult({ type: 'sgpa', value: sgpaPreview })} disabled={isCalculating}>
              Calculate SGPA
            </button>
            <button className="reset-btn" onClick={resetCalculator}>
              Reset
            </button>
          </div>
        </div>
      )}
      <div style={{ marginTop: activeTab === 'sgpa' ? '48px' : '0' }} />
      {activeTab === 'cgpa' && (
        <div className="panel cgpa-panel">
          <h2>CGPA Calculator</h2>
          <div className="subject-list">
            {semesters.map((semester, idx) => (
              <div className={`subject-row${isCgpaInvalid(semester, idx) ? ' invalid' : ''}`} key={semester.id}>
                <span className="subject-num">{idx + 1}</span>
                <input
                  type="text"
                  placeholder="Semester Name"
                  value={semester.semester}
                  ref={idx === 0 ? firstSemesterInputRef : null}
                  onChange={e => updateSemester(semester.id, 'semester', e.target.value)}
                  onBlur={() => handleCgpaBlur(idx)}
                />
                <input
                  type="number"
                  placeholder="SGPA"
                  value={semester.sgpa}
                  min="0"
                  max="10"
                  step="0.01"
                  onChange={e => {
                    let val = e.target.value;
                    if (val === "") {
                      updateSemester(semester.id, 'sgpa', "");
                    } else {
                      let num = parseFloat(val);
                      if (isNaN(num)) num = "";
                      else if (num < 0) num = 0;
                      else if (num > 10) num = 10;
                      updateSemester(semester.id, 'sgpa', num);
                    }
                  }}
                  onBlur={() => handleCgpaBlur(idx)}
                />
                <input
                  type="number"
                  placeholder="Credits (optional)"
                  value={semester.credits}
                  min="0"
                  step="0.5"
                  onChange={e => updateSemester(semester.id, 'credits', e.target.value)}
                />
                <button className="remove-btn" onClick={() => removeSemester(semester.id)} disabled={semesters.length === 1}>
                  <BinIcon />
                </button>
              </div>
            ))}
          </div>
          <div className="panel-actions">
            <button className="add-btn" onClick={addSemester}>
              Add Semester
            </button>
            <button className="calc-btn" onClick={calculateCGPA} disabled={isCalculating}>
              {isCalculating ? 'Calculating...' : 'Calculate CGPA'}
            </button>
            <button className="reset-btn" onClick={resetCalculator}>
              Reset
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className={`result-panel ${result.type === 'error' ? 'error' : ''}`}>
          {result.type === 'error' ? (
            <div className="result-error">
              <span className="error-icon">!</span>
              <span>{result.message}</span>
            </div>
          ) : (
            <div className="result-success">
              <h3>{result.value}</h3>
              <p className="result-type">{result.type === 'sgpa' ? 'SGPA' : 'CGPA'}</p>
              <p className="result-grade">{getGradeLevel(result.value)}</p>
            </div>
          )}
        </div>
      )}
      <div className="footer">
        <p>Data persists within your current session</p>
      </div>
    </div>
  );
}

export default App; 