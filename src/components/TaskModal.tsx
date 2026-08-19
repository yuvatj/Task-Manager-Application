import React, { useState } from 'react';
import { useAppContext } from '../store';
import { X } from 'lucide-react';
import type { Attachment, UrgencyLevel } from '../types';

export const TaskModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { projects, users, members, addTask } = useAppContext();
  const assignableUsers = [...users, ...members.map(m => ({ id: m.id, name: m.name, role: 'Member' }))];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tags, setTags] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [referenceFiles, setReferenceFiles] = useState<Attachment[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');


  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) { alert('Task Title is required'); return; }
    if (!projectId) { alert('Please select a Project'); return; }

    const assignee = assignableUsers.find(u => u.id === assigneeId) || null;
    const taskTags = tags.split(',').map(t => t.trim()).filter(Boolean);

    addTask({
      title: title.trim(),
      description,
      projectId,
      tags: taskTags,
      urgency,
      startDate,
      deliveryDate,
      engineerName,
      assignee,
      creator: users[0],
      status: 'todo',
      workingFileNames: [],
      referenceFileNames: referenceFiles.map(f => f.name),
      referenceFiles: referenceFiles,
      images: imagePreviews
    });

    // Reset all fields
    setTitle(''); setDescription(''); setProjectId('');
    setTags(''); setEngineerName(''); setAssigneeId('');
    setUrgency('medium');
    setReferenceFiles([]); setImagePreviews([]); setStartDate(''); setDeliveryDate('');
    onClose();
  };

  const stopScroll = (e: React.WheelEvent) => e.stopPropagation();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div
        className="glass-panel animate-fade-in"
        onWheel={stopScroll}
        style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        {/* Fixed header */}
        <div style={{ padding: '24px 32px 16px 32px', flexShrink: 0, borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Create New Task</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Task Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} placeholder="E.g., Implement login form" />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Project *</label>
              <select value={projectId} onChange={e => setProjectId(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="">Select a project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Assignee</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="">Unassigned</option>
                {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Urgency</label>
              <select value={urgency} onChange={e => setUrgency(e.target.value as UrgencyLevel)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} placeholder="Task details..." />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tags</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} style={{ width: '100%' }} placeholder="e.g. frontend, bug" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Engineer Details</label>
              <input type="text" value={engineerName} onChange={e => setEngineerName(e.target.value)} style={{ width: '100%' }} placeholder="Contact for clarifications" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Delivery Date</label>
              <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Related Documents (PPT, Files)</label>
            <input
              type="file"
              multiple
              onChange={async e => {
                if (!e.target.files?.length) return;
                const formData = new FormData();
                Array.from(e.target.files).forEach(file => formData.append('files', file));
                
                try {
                  const response = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    body: formData
                  });
                  const uploadedFiles = await response.json();
                  // Map database style {name, url} to our local state
                  const attachments: Attachment[] = uploadedFiles.map((f: any) => ({
                    name: f.name,
                    data: f.url // Re-using 'data' field for the server URL
                  }));
                  setReferenceFiles(prev => [...prev, ...attachments]);
                } catch (error) {
                  console.error('Error uploading files:', error);
                  alert('File upload failed. Check backend connection.');
                }
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
            />
            {referenceFiles.length > 0 && <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{referenceFiles.length} file(s) uploaded</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Images (for explanation / reference)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async e => {
                if (!e.target.files?.length) return;
                const formData = new FormData();
                Array.from(e.target.files).forEach(file => formData.append('files', file));
                
                try {
                  const response = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    body: formData
                  });
                  const uploadedImages = await response.json();
                  const urls = uploadedImages.map((f: any) => f.url);
                  setImagePreviews(prev => [...prev, ...urls]);
                } catch (error) {
                  console.error('Error uploading images:', error);
                  alert('Image upload failed.');
                }
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
            />
            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt={`preview-${i}`} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Fixed footer — always visible */}
        <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0, backgroundColor: 'var(--bg-color-secondary)' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>Create Task</button>
        </div>
      </div>
    </div>
  );
};
