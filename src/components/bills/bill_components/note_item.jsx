import { useState } from "react";

export default function NoteItem({ note, onUpdate, onDelete, isEditing, setEditingId }) {
  const [editedNote, setEditedNote] = useState(note.note);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (editedNote.trim() === "") {
      alert("Note cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(note.id, editedNote);
      setEditingId(null);
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditedNote(note.note);
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(note.id);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card mb-3 ">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start ">
          <small className="text-muted">
            Created: {formatDate(note.created_at)}
            {/* {note.updated_at !== note.created_at && (
              <span className="ms-2">(Updated: {formatDate(note.updated_at)})</span>
            )} */}
          </small>

          <div className="btn-group btn-group-sm">
            {!isEditing && (
              <>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setEditingId(note.id)}
                  disabled={isDeleting}>
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleDelete}
                  disabled={isDeleting}>
                  {isDeleting ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                  ) : (
                    <i className="fas fa-trash"></i>
                  )}{" "}
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div>
            <textarea
              className="form-control mb-3"
              rows="4"
              value={editedNote}
              onChange={(e) => setEditedNote(e.target.value)}
              placeholder="Enter your note..."
            />
            <div className="d-flex gap-2">
              <button
                className="btn btn-success btn-sm"
                onClick={handleSave}
                disabled={isUpdating || editedNote.trim() === ""}>
                {isUpdating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save
                  </>
                )}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCancel}
                disabled={isUpdating}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="note-content">
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {note.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
