import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import AdminLogin from "@/components/admin-login";
import TaskManagement from "@/components/task-management";
import MessageManagement from "@/components/message-management";
import UserManagement from "@/components/user-management";
import EmployeeNotesAdmin from "@/components/employee-notes-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut } from "lucide-react";
import type { EmployeeNote } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");

  const { data: unresolvedNotes = [] } = useQuery<EmployeeNote[]>({
    queryKey: ["/api/employee-notes/unresolved"],
    enabled: isAdmin,
  });

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
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
                <Button
                  onClick={() => (window.location.href = "/")}
                  className="brutal-button bg-white px-6 py-3 font-bold text-lg"
                >
                  EMPLOYEE
                </Button>
                <Button className="brutal-button bg-brutal-pink px-6 py-3 font-bold text-lg">
                  ADMIN
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4">
          <div className="brutal-card bg-white p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-brutal font-black mb-4">ADMIN LOGIN REQUIRED</h2>
            <p className="mb-4">Please login with admin credentials to access the dashboard.</p>
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

  if (!isAdmin) {
    window.location.href = "/";
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
              <Button
                onClick={() => (window.location.href = "/")}
                className="brutal-button bg-white px-6 py-3 font-bold text-lg"
              >
                EMPLOYEE
              </Button>
              <Button className="brutal-button bg-brutal-pink px-6 py-3 font-bold text-lg">
                ADMIN
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-brutal font-black">ADMIN DASHBOARD</h2>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Button
                onClick={() => setActiveTab("notes")}
                className="brutal-button bg-brutal-yellow px-4 py-2 font-bold"
              >
                <Bell className="mr-2 h-4 w-4" />
                EMPLOYEE NOTES
              </Button>
              {unresolvedNotes.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-brutal-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {unresolvedNotes.length}
                </Badge>
              )}
            </div>
            <Button
              onClick={handleLogout}
              className="brutal-button bg-brutal-red px-4 py-2 font-bold"
            >
              <LogOut className="mr-2 h-4 w-4" />
              LOGOUT
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          <Button
            onClick={() => setActiveTab("tasks")}
            className={`brutal-button px-6 py-3 font-bold ${
              activeTab === "tasks" ? "bg-brutal-pink" : "bg-white"
            }`}
          >
            MANAGE TASKS
          </Button>
          <Button
            onClick={() => setActiveTab("messages")}
            className={`brutal-button px-6 py-3 font-bold ${
              activeTab === "messages" ? "bg-brutal-pink" : "bg-white"
            }`}
          >
            MESSAGES
          </Button>
          <Button
            onClick={() => setActiveTab("users")}
            className={`brutal-button px-6 py-3 font-bold ${
              activeTab === "users" ? "bg-brutal-pink" : "bg-white"
            }`}
          >
            USERS
          </Button>
          <Button
            onClick={() => setActiveTab("notes")}
            className={`brutal-button px-6 py-3 font-bold ${
              activeTab === "notes" ? "bg-brutal-pink" : "bg-white"
            }`}
          >
            EMPLOYEE NOTES
          </Button>
        </div>

        <div className="w-full">
          {activeTab === "tasks" && <TaskManagement />}
          {activeTab === "messages" && <MessageManagement />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "notes" && <EmployeeNotesAdmin />}
        </div>
      </div>
    </div>
  );
}
