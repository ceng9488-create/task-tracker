import { useCallback, useEffect, useRef, useState } from "react";

import type { Task } from "../types/task";

export function useTaskEdit(onConfirm: (id:number, text: string) => void) {
    const [editId, setEditId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");
    const editRef = useRef<HTMLInputElement>(null);

      useEffect(() => {
        if (editId && editRef.current) editRef.current.focus();
      }, [editId]);
    
    
      const startEdit = useCallback((task: Task) => {
        setEditId(task.id);
        setEditText(task.text);
      },[]);
    
      const confirmEdit = useCallback(() => {
        if (editText.trim() && editId !== null)
          onConfirm(editId, editText.trim());
        setEditId(null);
        setEditText("");
      }, [editText, editId, onConfirm]);

      const cancelEdit = useCallback(() => {
        setEditId(null);
        setEditText("");
      },[])

      return {
        editId,
        editText,
        editRef,

        setEditId,
        setEditText,

        startEdit,
        confirmEdit,
        cancelEdit
      }
}