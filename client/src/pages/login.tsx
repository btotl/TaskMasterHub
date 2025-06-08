import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [employeeCredentials, setEmployeeCredentials] = useState({
    username: "employee",
    password: ""
  });
  const [adminCredentials, setAdminCredentials] = useState({
    username: "admin",
    password: ""
  });

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(employeeCredentials);
      toast({ title: "Welcome back!" });
      setLocation("/");
    } catch (error) {
      toast({ 
        title: "Login failed", 
        description: "Please check your credentials", 
        variant: "destructive" 
      });
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(adminCredentials);
      toast({ title: "Admin access granted!" });
      setLocation("/admin");
    } catch (error) {
      toast({ 
        title: "Login failed", 
        description: "Please check your admin credentials", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-brutal font-black tracking-tight mb-2">
            TASK MANAGER
          </h1>
          <p className="text-gray-600 font-bold">Please sign in to continue</p>
        </div>

        <Card className="brutal-card bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-brutal font-black">LOGIN</CardTitle>
            <CardDescription className="font-bold">
              Choose your role to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="employee" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="employee" className="font-bold">EMPLOYEE</TabsTrigger>
                <TabsTrigger value="admin" className="font-bold">ADMIN</TabsTrigger>
              </TabsList>
              
              <TabsContent value="employee">
                <form onSubmit={handleEmployeeLogin} className="space-y-4">
                  <div>
                    <Label className="block text-lg font-bold mb-2">USERNAME</Label>
                    <Input
                      type="text"
                      value={employeeCredentials.username}
                      onChange={(e) => setEmployeeCredentials({
                        ...employeeCredentials,
                        username: e.target.value
                      })}
                      className="w-full brutal-input p-3 font-mono"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div>
                    <Label className="block text-lg font-bold mb-2">PASSWORD</Label>
                    <Input
                      type="password"
                      value={employeeCredentials.password}
                      onChange={(e) => setEmployeeCredentials({
                        ...employeeCredentials,
                        password: e.target.value
                      })}
                      className="w-full brutal-input p-3 font-mono"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoggingIn || !employeeCredentials.password}
                    className="brutal-button bg-brutal-green px-6 py-3 font-bold w-full text-lg"
                  >
                    {isLoggingIn ? "SIGNING IN..." : "EMPLOYEE LOGIN"}
                  </Button>
                </form>
                <div className="mt-4 p-3 bg-brutal-yellow rounded border-2 border-black">
                  <p className="text-sm font-bold">Demo Credentials:</p>
                  <p className="text-sm">Username: employee</p>
                  <p className="text-sm">Password: password123</p>
                </div>
              </TabsContent>
              
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label className="block text-lg font-bold mb-2">ADMIN USERNAME</Label>
                    <Input
                      type="text"
                      value={adminCredentials.username}
                      onChange={(e) => setAdminCredentials({
                        ...adminCredentials,
                        username: e.target.value
                      })}
                      className="w-full brutal-input p-3 font-mono"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="block text-lg font-bold mb-2">ADMIN PASSWORD</Label>
                    <Input
                      type="password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials({
                        ...adminCredentials,
                        password: e.target.value
                      })}
                      className="w-full brutal-input p-3 font-mono"
                      placeholder="Enter admin password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoggingIn || !adminCredentials.password}
                    className="brutal-button bg-brutal-pink px-6 py-3 font-bold w-full text-lg"
                  >
                    {isLoggingIn ? "SIGNING IN..." : "ADMIN LOGIN"}
                  </Button>
                </form>
                <div className="mt-4 p-3 bg-brutal-blue text-white rounded border-2 border-black">
                  <p className="text-sm font-bold">Admin Credentials:</p>
                  <p className="text-sm">Username: admin</p>
                  <p className="text-sm">Password: Thecure93</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}