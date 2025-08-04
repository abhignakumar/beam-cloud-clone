import { LogOut, SatelliteDish } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { BACKEND_BASE_URL } from "@/lib/config";

export function NavBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        await axios.get(`${BACKEND_BASE_URL}/auth/check`, {
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  async function handleLogout() {
    try {
      await axios.get(`${BACKEND_BASE_URL}/logout`, {
        withCredentials: true,
      });
      toast.success("Logged out");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to logout");
    }
  }

  return (
    <div className="flex justify-between items-center py-4 px-6 bg-sidebar border-b text-sidebar-foreground">
      <div className="flex gap-x-6 items-center">
        <Link to={"/"}>
          <div className="flex gap-x-2">
            <SatelliteDish />
            <span className="font-semibold">Beam Clone</span>
          </div>
        </Link>
        {isAuthenticated && (
          <Link to={"/dashboard"}>
            <Button variant={"outline"}>Dashboard</Button>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-x-3">
        {isAuthenticated ? (
          <Button onClick={handleLogout}>
            <LogOut />
            Logout
          </Button>
        ) : (
          <>
            <Link to={"/signup"}>
              <Button variant="outline">Signup</Button>
            </Link>
            <Link to={"/login"}>
              <Button>Login</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
