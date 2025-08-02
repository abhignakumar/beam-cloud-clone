import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BACKEND_BASE_URL } from "@/lib/config";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(
        `${BACKEND_BASE_URL}/login`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );
      toast.success("Logged In");
      navigate("/dashboard");
      window.location.reload();
    } catch (error) {
      let msg: string | null = null;
      if (isAxiosError(error)) msg = error.response?.data.message;
      toast.error("Failed to login", {
        description: msg ? msg : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      try {
        await axios.get(`${BACKEND_BASE_URL}/auth/check`, {
          withCredentials: true,
        });
        navigate("/dashboard");
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <div className="flex-1 flex justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  required
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 mt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
