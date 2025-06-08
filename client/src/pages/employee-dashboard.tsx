import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import TaskItem from "@/components/task-item";
import ImportantMessagePopup from "@/components/important-message-popup";
import AdminLogin from "@/components/admin-login";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Task, ImportantMessage } from "@shared/schema";

export default function EmployeeDashboard() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLogin, setShowLogin] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ImportantMessage | null>(null);
  const [employeeNote, setEmployeeNote] = useState("");

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery<ImportantMessage[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  const employeeNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/employee-notes", { content });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Note submitted successfully!" });
      setEmployeeNote("");
    },
    onError: () => {
      toast({ title: "Failed to submit note", variant: "destructive" });
    },
  });

  const showAlert = () => {
    if (messages.length > 0) {
      setSelectedMessage(messages[0]);
      setShowPopup(true);
    }
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeNote.trim()) {
      employeeNoteMutation.mutate(employeeNote.trim());
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white brutal-border mb-8">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-brutal font-black tracking-tight">
                TASK MANAGER
              </h1>
              <div className="flex gap-4">
                <Button className="brutal-button bg-brutal-green px-6 py-3 font-bold text-lg">
                  EMPLOYEE
                </Button>
                <Button
                  onClick={() => setShowLogin(true)}
                  className="brutal-button bg-white px-6 py-3 font-bold text-lg"
                >
                  ADMIN
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4">
          <div className="brutal-card bg-white p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-brutal font-black mb-4">ACCESS REQUIRED</h2>
            <p className="mb-4">Please login to access the task management system.</p>
            <Button
              onClick={() => setShowLogin(true)}
              className="brutal-button bg-brutal-blue px-6 py-3 font-bold w-full"
            >
              LOGIN
            </Button>
          </div>
        </div>

        {showLogin && (
          <AdminLogin
            onClose={() => setShowLogin(false)}
            onSuccess={() => setShowLogin(false)}
          />
        )}
      </div>
    );
  }

  if (isAdmin) {
    window.location.href = "/admin";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white brutal-border mb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-brutal font-black tracking-tight">
              TASK MANAGER
            </h1>
            <div className="flex gap-4">
              <Button className="brutal-button bg-brutal-green px-6 py-3 font-bold text-lg">
                EMPLOYEE
              </Button>
              <Button
                onClick={() => setShowLogin(true)}
                className="brutal-button bg-white px-6 py-3 font-bold text-lg"
              >
                ADMIN
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-brutal font-black">YOUR TASKS</h2>
            <Button
              onClick={showAlert}
              className="brutal-button bg-brutal-pink px-4 py-2 font-bold"
            >
              <Bell className="mr-2 h-4 w-4" />
              ALERTS
            </Button>
          </div>

          {tasksLoading ? (
            <div className="text-center text-2xl font-bold">LOADING TASKS...</div>
          ) : (
            <div className="grid gap-6 mb-6">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        <section className="brutal-card bg-brutal-yellow p-6">
          <h3 className="text-2xl font-brutal font-black mb-4">EMPLOYEE NOTES & ENQUIRIES</h3>
          <form onSubmit={handleSubmitNote}>
            <Textarea
              value={employeeNote}
              onChange={(e) => setEmployeeNote(e.target.value)}
              placeholder="Leave notes for management or customer enquiry details..."
              className="w-full brutal-input p-4 h-32 mb-4 font-mono resize-none"
            />
            <Button
              type="submit"
              disabled={employeeNoteMutation.isPending || !employeeNote.trim()}
              className="brutal-button bg-brutal-pink px-8 py-3 font-bold text-lg"
            >
              {employeeNoteMutation.isPending ? "SUBMITTING..." : "SUBMIT NOTE"}
            </Button>
          </form>
        </section>
      </div>

      {showPopup && selectedMessage && (
        <ImportantMessagePopup
          message={selectedMessage}
          onClose={() => setShowPopup(false)}
        />
      )}

      {showLogin && (
        <AdminLogin
          onClose={() => setShowLogin(false)}
          onSuccess={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}
