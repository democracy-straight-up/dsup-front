import { useEffect, useState } from "react";
import NoteItem from "./note_item";
import { baseURL } from "../../../store/conf";

export default function MyNote({ bill, AuthUser }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (bill?.id && AuthUser?.id) {
      fetchNotes();
    }

    return () => {
      console.log("MyNote component unmounted...");
    };
  }, [bill?.id, AuthUser?.id]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${window.location.protocol}//${baseURL}/bill/bill-user-notes/`);
      if (response.ok) {
        const data = await response.json();
        // Filter notes for current user and bill
        const userBillNotes =
          data.results?.filter(
            (note) => note.user?.id === AuthUser?.id && note.bill?.id === bill?.id
          ) || [];
        setNotes(userBillNotes);
      } else {
        console.error("Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim() === "") {
      alert("Please enter a note");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(
        `${window.location.protocol}//${baseURL}/bill/bill-user-notes/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: AuthUser.id,
            bill_id: bill.id,
            note: newNote,
          }),
        }
      );

      if (response.ok) {
        const newNoteData = await response.json();
        setNotes((prevNotes) => [newNoteData, ...prevNotes]);
        setNewNote("");
        setShowAddForm(false);
      } else {
        const errorData = await response.json();
        alert("Failed to add note. Please try again.");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Error adding note. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateNote = async (noteId, updatedNoteText) => {
    try {
      const response = await fetch(
        `${window.location.protocol}//${baseURL}/bill/bill-user-notes/${noteId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note: updatedNoteText,
          }),
        }
      );

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes((prevNotes) => prevNotes.map((note) => (note.id === noteId ? updatedNote : note)));
      } else {
        throw new Error("Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(
        `${window.location.protocol}//${baseURL}/bill/bill-user-notes/${noteId}/`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid p-4">
        <h4>My Notes</h4>
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>My Notes for Bill {bill?.number}</h4>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <i className="fas fa-plus"></i> Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Add New Note</h5>
            <textarea
              className="form-control mb-3"
              rows="4"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note about this bill..."
            />
            <div className="d-flex gap-2">
              <button
                className="btn btn-success"
                onClick={handleAddNote}
                disabled={isAdding || newNote.trim() === ""}>
                {isAdding ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Note
                  </>
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewNote("");
                }}
                disabled={isAdding}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-sticky-note fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No notes yet</h5>
          <p className="text-muted">Add your first note about this bill to get started.</p>
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <small className="text-muted">
              {notes.length} note{notes.length !== 1 ? "s" : ""} found
            </small>
          </div>
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              isEditing={editingId === note.id}
              setEditingId={setEditingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
