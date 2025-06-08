import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { Task, TaskNote } from "@shared/schema";

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  const { data: taskNotes = [] } = useQuery<TaskNote[]>({
    queryKey: ["/api/tasks", task.id, "notes"],
    enabled: !!user,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tasks/${task.id}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task completed!" });
    },
    onError: () => {
      toast({ title: "Failed to complete task", variant: "destructive" });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (noteText: string) => {
      const res = await apiRequest("POST", `/api/tasks/${task.id}/notes`, {
        notes: noteText,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task.id, "notes"] });
      setNotes("");
      toast({ title: "Note added!" });
    },
    onError: () => {
      toast({ title: "Failed to add note", variant: "destructive" });
    },
  });

  const userNote = taskNotes.find(note => note.userId === user?.id);

  const handleAddNote = () => {
    if (notes.trim()) {
      addNoteMutation.mutate(notes.trim());
    }
  };

  return (
    <div className={`brutal-card bg-white p-6 ${task.completed ? "task-completed" : ""}`}>
      <div className="flex items-start gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => {
            if (!task.completed) {
              completeTaskMutation.mutate();
            }
          }}
          className="w-8 h-8 brutal-border bg-white mt-1"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <label
              htmlFor={`task-${task.id}`}
              className={`text-xl font-bold cursor-pointer ${
                task.completed ? "line-through" : ""
              }`}
            >
              {task.title}
            </label>
            {task.imageUrl && (
              <img
                src={task.imageUrl}
                alt={task.title}
                className="w-16 h-16 brutal-border object-cover"
              />
            )}
          </div>
          {task.description && (
            <p className="text-gray-600 mb-2">{task.description}</p>
          )}
          
          <div className="space-y-2">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={userNote ? userNote.notes : "Add your notes here..."}
              className="w-full brutal-input p-3 resize-none h-20 font-mono"
            />
            {notes.trim() && (
              <Button
                onClick={handleAddNote}
                disabled={addNoteMutation.isPending}
                className="brutal-button bg-brutal-blue px-4 py-2 text-sm font-bold"
              >
                {addNoteMutation.isPending ? "SAVING..." : "SAVE NOTE"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
