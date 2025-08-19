import { useEffect, useState } from "react";
import NoteItem from "./note_item";
import { useAuthenticatedFetch } from "../../../hooks/useAuthenticatedFetch";
import { useChainOfDelegation } from "../../../hooks/useChainOfDelegation";

export default function FirstDelegateNote({ bill, AuthUser }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { makeRequest } = useAuthenticatedFetch();
  const { isFDel, chainOfDelegation } = useChainOfDelegation();

  // Get the display title based on user role
  const getTitle = () => {
    if (isFDel) {
      return "My First Delegate Notes";
    }
    return "First Delegate Notes";
  };

  // Get the empty state message based on user role
  const getEmptyMessage = () => {
    if (isFDel) {
      return "You haven't created any first delegate notes for this bill yet.";
    }

    const firstDelegateName = chainOfDelegation?.f_del?.users?.legalName || "your first delegate";
    return `No first delegate notes available from ${firstDelegateName} for this bill yet.`;
  };

  useEffect(() => {
    if (bill?.id) {
      fetchNotes();
    }

    return () => {
      console.log("FirstDelegateNote component unmounted...");
    };
  }, [bill?.id]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await makeRequest(`/bill/bill-first-del-notes/?bill_id=${bill.id}`);

      if (response.ok) {
        const data = await response.json();
        console.log("list of first delegate notes", data);
        setNotes(data.results || []);
      } else {
        console.error("Failed to fetch first delegate notes", response.status);
        if (response.status === 401) {
          console.error("Authentication required");
        }
      }
    } catch (error) {
      console.error("Error fetching first delegate notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!isFDel) {
      alert("Only first delegates can add notes");
      return;
    }

    if (newNote.trim() === "") {
      alert("Please enter a note");
      return;
    }

    setIsAdding(true);
    try {
      const response = await makeRequest(`/bill/bill-first-del-notes/`, {
        method: "POST",
        body: JSON.stringify({
          bill_id: bill.id,
          note: newNote,
        }),
      });

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
      console.error("Error adding first delegate note:", error);
      alert("Error adding note. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateNote = async (noteId, updatedNoteText) => {
    if (!isFDel) {
      alert("Only first delegates can update notes");
      return;
    }

    try {
      const response = await makeRequest(`/bill/bill-first-del-notes/${noteId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          note: updatedNoteText,
        }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        console.log("updated first delegate note", updatedNote);
        setNotes((prevNotes) => prevNotes.map((note) => (note.id === noteId ? updatedNote : note)));
      } else {
        if (response.status === 403) {
          alert("You can only update notes that you created");
        } else {
          alert("Failed to update note. Please try again.");
        }
        throw new Error("Failed to update note");
      }
    } catch (error) {
      console.error("Error updating first delegate note:", error);
      throw error;
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!isFDel) {
      alert("Only first delegates can delete notes");
      return;
    }

    try {
      const response = await makeRequest(`/bill/bill-first-del-notes/${noteId}/`, {
        method: "DELETE",
      });
      if (response.ok) {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      } else {
        if (response.status === 403) {
          alert("You can only delete notes that you created");
        } else {
          alert("Failed to delete note. Please try again.");
        }
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting first delegate note:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid p-4">
        <h4>First Delegate Notes</h4>
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
        <h4>
          {getTitle()} for Bill {bill?.number}
        </h4>
        {isFDel && (
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Note"}
          </button>
        )}
      </div>

      {!isFDel && (
        <div className="alert alert-info" role="alert">
          You are viewing notes from your first delegate. Only first delegates can add or modify
          these notes.
        </div>
      )}

      {showAddForm && isFDel && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Add New First Delegate Note</h5>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="4"
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                disabled={isAdding}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-success"
                onClick={handleAddNote}
                disabled={isAdding || newNote.trim() === ""}>
                {isAdding ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"></span>
                    Adding...
                  </>
                ) : (
                  "Add Note"
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewNote("");
                }}
                disabled={isAdding}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="alert alert-secondary" role="alert">
          {getEmptyMessage()}
          {isFDel && " Be the first to add a note!"}
        </div>
      ) : (
        <div className="notes-list">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              isEditing={editingId === note.id}
              setEditingId={(isEditing) => setEditingId(isEditing ? note.id : null)}
              canEdit={isFDel && note.user?.id === AuthUser?.id}
              noteType="First Delegate"
            />
          ))}
        </div>
      )}
    </div>
  );
}
