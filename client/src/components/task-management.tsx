import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Task } from "@shared/schema";

export default function TaskManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    image: null as File | null,
  });

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: FormData) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        body: taskData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTask({ title: "", description: "", image: null });
      toast({ title: "Task created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        body: data,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditingTask(null);
      toast({ title: "Task updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/tasks/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newTask.title);
    formData.append("description", newTask.description);
    if (newTask.image) {
      formData.append("image", newTask.image);
    }
    createTaskMutation.mutate(formData);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const formData = new FormData();
    const titleInput = (e.target as HTMLFormElement).querySelector<HTMLInputElement>('[name="title"]');
    const descriptionInput = (e.target as HTMLFormElement).querySelector<HTMLTextAreaElement>('[name="description"]');
    const imageInput = (e.target as HTMLFormElement).querySelector<HTMLInputElement>('[name="image"]');

    if (titleInput) formData.append("title", titleInput.value);
    if (descriptionInput) formData.append("description", descriptionInput.value);
    if (imageInput?.files?.[0]) {
      formData.append("image", imageInput.files[0]);
    }

    updateTaskMutation.mutate({ id: editingTask.id, data: formData });
  };

  if (isLoading) {
    return <div className="text-center text-2xl font-bold">LOADING TASKS...</div>;
  }

  return (
    <div>
      {/* Add New Task Form */}
      <div className="brutal-card bg-brutal-green p-6 mb-6">
        <h4 className="text-xl font-brutal font-black mb-4">ADD NEW TASK</h4>
        <form onSubmit={handleCreateTask}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="block font-bold mb-2">TASK TITLE</Label>
              <Input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full brutal-input p-3 font-mono"
                placeholder="Enter task title..."
                required
              />
            </div>
            <div>
              <Label className="block font-bold mb-2">TASK IMAGE</Label>
              <Input
                type="file"
                onChange={(e) => setNewTask({ ...newTask, image: e.target.files?.[0] || null })}
                className="w-full brutal-input p-3 font-mono"
                accept="image/*"
              />
            </div>
          </div>
          <div className="mb-4">
            <Label className="block font-bold mb-2">TASK DESCRIPTION</Label>
            <Textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full brutal-input p-3 font-mono h-24 resize-none"
              placeholder="Enter task details..."
            />
          </div>
          <Button
            type="submit"
            disabled={createTaskMutation.isPending || !newTask.title}
            className="brutal-button bg-white px-6 py-3 font-bold"
          >
            <Plus className="mr-2 h-4 w-4" />
            {createTaskMutation.isPending ? "ADDING..." : "ADD TASK"}
          </Button>
        </form>
      </div>

      {/* Edit Task Form */}
      {editingTask && (
        <div className="brutal-card bg-brutal-blue p-6 mb-6">
          <h4 className="text-xl font-brutal font-black mb-4 text-white">EDIT TASK</h4>
          <form onSubmit={handleUpdateTask}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="block font-bold mb-2 text-white">TASK TITLE</Label>
                <Input
                  type="text"
                  name="title"
                  defaultValue={editingTask.title}
                  className="w-full brutal-input p-3 font-mono"
                  required
                />
              </div>
              <div>
                <Label className="block font-bold mb-2 text-white">TASK IMAGE</Label>
                <Input
                  type="file"
                  name="image"
                  className="w-full brutal-input p-3 font-mono"
                  accept="image/*"
                />
              </div>
            </div>
            <div className="mb-4">
              <Label className="block font-bold mb-2 text-white">TASK DESCRIPTION</Label>
              <Textarea
                name="description"
                defaultValue={editingTask.description || ""}
                className="w-full brutal-input p-3 font-mono h-24 resize-none"
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateTaskMutation.isPending}
                className="brutal-button bg-white px-6 py-3 font-bold"
              >
                {updateTaskMutation.isPending ? "UPDATING..." : "UPDATE TASK"}
              </Button>
              <Button
                type="button"
                onClick={() => setEditingTask(null)}
                className="brutal-button bg-brutal-red px-6 py-3 font-bold text-white"
              >
                CANCEL
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="brutal-card bg-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h5 className="text-lg font-bold">{task.title}</h5>
                {task.description && (
                  <p className="text-gray-600 mt-1">{task.description}</p>
                )}
                <p className={`mt-1 font-bold ${task.completed ? "text-green-600" : "text-yellow-600"}`}>
                  Status: {task.completed ? "Completed" : "Pending"}
                </p>
                {task.imageUrl && (
                  <img
                    src={task.imageUrl}
                    alt={task.title}
                    className="mt-2 w-20 h-20 brutal-border object-cover"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditingTask(task)}
                  className="brutal-button bg-brutal-blue px-3 py-2 text-sm font-bold"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => deleteTaskMutation.mutate(task.id)}
                  disabled={deleteTaskMutation.isPending}
                  className="brutal-button bg-brutal-red px-3 py-2 text-sm font-bold"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
