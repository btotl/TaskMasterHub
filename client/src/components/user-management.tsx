import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Edit, Trash2 } from "lucide-react";
import type { User } from "@shared/schema";

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "employee",
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const res = await apiRequest("POST", "/api/users", userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setNewUser({ username: "", email: "", password: "", role: "employee" });
      toast({ title: "User created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      toast({ title: "User updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUser);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data: Partial<User> = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
    };

    const password = formData.get("password") as string;
    if (password) {
      data.password = password;
    }

    updateUserMutation.mutate({ id: editingUser.id, data });
  };

  if (isLoading) {
    return <div className="text-center text-2xl font-bold">LOADING USERS...</div>;
  }

  return (
    <div>
      {/* Add New Employee Form */}
      <div className="brutal-card bg-brutal-blue p-6 mb-6">
        <h4 className="text-xl font-brutal font-black mb-4 text-white">ADD NEW EMPLOYEE</h4>
        <form onSubmit={handleCreateUser}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="block font-bold mb-2 text-white">USERNAME</Label>
              <Input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full brutal-input p-3 font-mono"
                placeholder="Enter username..."
                required
              />
            </div>
            <div>
              <Label className="block font-bold mb-2 text-white">EMAIL</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full brutal-input p-3 font-mono"
                placeholder="Enter email..."
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="block font-bold mb-2 text-white">PASSWORD</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full brutal-input p-3 font-mono"
                placeholder="Enter password..."
                required
              />
            </div>
            <div>
              <Label className="block font-bold mb-2 text-white">ROLE</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger className="w-full brutal-input p-3 font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            disabled={createUserMutation.isPending || !newUser.username || !newUser.password}
            className="brutal-button bg-white px-6 py-3 font-bold"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {createUserMutation.isPending ? "ADDING..." : "ADD EMPLOYEE"}
          </Button>
        </form>
      </div>

      {/* Edit User Form */}
      {editingUser && (
        <div className="brutal-card bg-brutal-yellow p-6 mb-6">
          <h4 className="text-xl font-brutal font-black mb-4">EDIT USER</h4>
          <form onSubmit={handleUpdateUser}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="block font-bold mb-2">USERNAME</Label>
                <Input
                  type="text"
                  name="username"
                  defaultValue={editingUser.username}
                  className="w-full brutal-input p-3 font-mono"
                  required
                />
              </div>
              <div>
                <Label className="block font-bold mb-2">EMAIL</Label>
                <Input
                  type="email"
                  name="email"
                  defaultValue={editingUser.email || ""}
                  className="w-full brutal-input p-3 font-mono"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="block font-bold mb-2">PASSWORD (leave blank to keep current)</Label>
                <Input
                  type="password"
                  name="password"
                  className="w-full brutal-input p-3 font-mono"
                  placeholder="Enter new password..."
                />
              </div>
              <div>
                <Label className="block font-bold mb-2">ROLE</Label>
                <Select name="role" defaultValue={editingUser.role}>
                  <SelectTrigger className="w-full brutal-input p-3 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="brutal-button bg-white px-6 py-3 font-bold"
              >
                {updateUserMutation.isPending ? "UPDATING..." : "UPDATE USER"}
              </Button>
              <Button
                type="button"
                onClick={() => setEditingUser(null)}
                className="brutal-button bg-brutal-red px-6 py-3 font-bold"
              >
                CANCEL
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Employee List */}
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="brutal-card bg-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-lg font-bold">{user.username}</h5>
                  <span className={`px-2 py-1 text-xs font-bold ${user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600">{user.email || "No email provided"}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditingUser(user)}
                  className="brutal-button bg-brutal-blue px-3 py-2 text-sm font-bold"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => deleteUserMutation.mutate(user.id)}
                  disabled={deleteUserMutation.isPending || user.role === 'admin'}
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
