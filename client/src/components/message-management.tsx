import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { ImportantMessage, MessageAcknowledgement } from "@shared/schema";

export default function MessageManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMessage, setEditingMessage] = useState<ImportantMessage | null>(null);
  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    active: true,
  });

  const { data: messages = [], isLoading } = useQuery<ImportantMessage[]>({
    queryKey: ["/api/messages/all"],
  });

  const createMessageMutation = useMutation({
    mutationFn: async (messageData: typeof newMessage) => {
      const res = await apiRequest("POST", "/api/messages", messageData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessage({ title: "", content: "", active: true });
      toast({ title: "Message created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create message", variant: "destructive" });
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ImportantMessage> }) => {
      const res = await apiRequest("PUT", `/api/messages/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setEditingMessage(null);
      toast({ title: "Message updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update message", variant: "destructive" });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/messages/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({ title: "Message deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete message", variant: "destructive" });
    },
  });

  const handleCreateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    createMessageMutation.mutate(newMessage);
  };

  const handleUpdateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      active: formData.get("active") === "on",
    };

    updateMessageMutation.mutate({ id: editingMessage.id, data });
  };

  if (isLoading) {
    return <div className="text-center text-2xl font-bold">LOADING MESSAGES...</div>;
  }

  return (
    <div>
      {/* Create New Message Form */}
      <div className="brutal-card bg-brutal-yellow p-6 mb-6">
        <h4 className="text-xl font-brutal font-black mb-4">CREATE IMPORTANT MESSAGE</h4>
        <form onSubmit={handleCreateMessage}>
          <div className="mb-4">
            <Label className="block font-bold mb-2">MESSAGE TITLE</Label>
            <Input
              type="text"
              value={newMessage.title}
              onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
              className="w-full brutal-input p-3 font-mono"
              placeholder="Enter message title..."
              required
            />
          </div>
          <div className="mb-4">
            <Label className="block font-bold mb-2">MESSAGE CONTENT</Label>
            <Textarea
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              className="w-full brutal-input p-3 font-mono h-32 resize-none"
              placeholder="Enter important message content..."
              required
            />
          </div>
          <Button
            type="submit"
            disabled={createMessageMutation.isPending || !newMessage.title || !newMessage.content}
            className="brutal-button bg-white px-6 py-3 font-bold"
          >
            <Plus className="mr-2 h-4 w-4" />
            {createMessageMutation.isPending ? "CREATING..." : "CREATE MESSAGE"}
          </Button>
        </form>
      </div>

      {/* Edit Message Form */}
      {editingMessage && (
        <div className="brutal-card bg-brutal-blue p-6 mb-6">
          <h4 className="text-xl font-brutal font-black mb-4 text-white">EDIT MESSAGE</h4>
          <form onSubmit={handleUpdateMessage}>
            <div className="mb-4">
              <Label className="block font-bold mb-2 text-white">MESSAGE TITLE</Label>
              <Input
                type="text"
                name="title"
                defaultValue={editingMessage.title}
                className="w-full brutal-input p-3 font-mono"
                required
              />
            </div>
            <div className="mb-4">
              <Label className="block font-bold mb-2 text-white">MESSAGE CONTENT</Label>
              <Textarea
                name="content"
                defaultValue={editingMessage.content}
                className="w-full brutal-input p-3 font-mono h-32 resize-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center font-bold text-white">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editingMessage.active}
                  className="mr-2"
                />
                ACTIVE MESSAGE
              </label>
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateMessageMutation.isPending}
                className="brutal-button bg-white px-6 py-3 font-bold"
              >
                {updateMessageMutation.isPending ? "UPDATING..." : "UPDATE MESSAGE"}
              </Button>
              <Button
                type="button"
                onClick={() => setEditingMessage(null)}
                className="brutal-button bg-brutal-red px-6 py-3 font-bold text-white"
              >
                CANCEL
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Active Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onEdit={setEditingMessage}
            onDelete={(id) => deleteMessageMutation.mutate(id)}
            isDeleting={deleteMessageMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

interface MessageItemProps {
  message: ImportantMessage;
  onEdit: (message: ImportantMessage) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

function MessageItem({ message, onEdit, onDelete, isDeleting }: MessageItemProps) {
  const { data: acknowledgements = [] } = useQuery<MessageAcknowledgement[]>({
    queryKey: ["/api/messages", message.id, "acknowledgements"],
  });

  return (
    <div className="brutal-card bg-white p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h5 className="text-lg font-bold">{message.title}</h5>
            <span className={`px-2 py-1 text-xs font-bold ${message.active ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
              {message.active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{message.content}</p>
          <p className="text-sm text-green-600">
            Acknowledged by: {acknowledgements.length} employees
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onEdit(message)}
            className="brutal-button bg-brutal-blue px-3 py-2 text-sm font-bold"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(message.id)}
            disabled={isDeleting}
            className="brutal-button bg-brutal-red px-3 py-2 text-sm font-bold"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
