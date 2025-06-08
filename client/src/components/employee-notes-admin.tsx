import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, MessageSquare } from "lucide-react";
import type { EmployeeNote, User } from "@shared/schema";

export default function EmployeeNotesAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allNotes = [], isLoading } = useQuery<EmployeeNote[]>({
    queryKey: ["/api/employee-notes"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const resolveNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const res = await apiRequest("POST", `/api/employee-notes/${noteId}/resolve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employee-notes/unresolved"] });
      toast({ title: "Note marked as resolved!" });
    },
    onError: () => {
      toast({ title: "Failed to resolve note", variant: "destructive" });
    },
  });

  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return <div className="text-center text-2xl font-bold">LOADING NOTES...</div>;
  }

  const sortedNotes = [...allNotes].sort((a, b) => {
    // Unresolved notes first, then by creation date (newest first)
    if (a.resolved !== b.resolved) {
      return a.resolved ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div>
      <h4 className="text-xl font-brutal font-black mb-6">EMPLOYEE NOTES & ENQUIRIES</h4>
      
      {sortedNotes.length === 0 ? (
        <div className="brutal-card bg-white p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h5 className="text-lg font-bold text-gray-600">NO NOTES SUBMITTED</h5>
          <p className="text-gray-500">Employee notes and enquiries will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedNotes.map((note) => {
            const user = getUserById(note.userId);
            return (
              <div
                key={note.id}
                className={`brutal-card p-6 ${
                  note.resolved ? "bg-white" : "bg-brutal-yellow"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h5 className="text-lg font-bold">
                      Note from {user?.username || "Unknown User"}
                    </h5>
                    <Badge
                      className={`text-xs font-bold ${
                        note.resolved
                          ? "bg-gray-500 text-white"
                          : "bg-brutal-red text-white"
                      }`}
                    >
                      {note.resolved ? "RESOLVED" : "NEW"}
                    </Badge>
                  </div>
                  {!note.resolved && (
                    <Button
                      onClick={() => resolveNoteMutation.mutate(note.id)}
                      disabled={resolveNoteMutation.isPending}
                      className="brutal-button bg-brutal-green px-4 py-2 text-sm font-bold"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      MARK RESOLVED
                    </Button>
                  )}
                </div>
                
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>
                
                <div className="text-sm text-gray-500">
                  <p>Submitted: {formatDate(note.createdAt)}</p>
                  {note.resolved && note.resolvedAt && (
                    <p>Resolved: {formatDate(note.resolvedAt)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
