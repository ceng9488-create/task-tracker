import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Task } from "../types/task";

export function useTaskEdit(setTasks: Dispatch<SetStateAction<Task[]>>) {
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
        if (editText.trim())
          setTasks((previousTasks) =>
            previousTasks.map((task) =>
              task.id === editId ? { ...task, text: editText.trim() } : task,
            ),
          );
        setEditId(null);
        setEditText("");
      }, [editText, editId, setTasks]);

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