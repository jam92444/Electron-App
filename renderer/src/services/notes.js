// Service for Notes module
export const insertNote = (text) => window.electronAPI.insertNote(text);
export const getNotes = () => window.electronAPI.getNotes();
