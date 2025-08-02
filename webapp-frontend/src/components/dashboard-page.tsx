import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiKeyCard } from "@/components/api-key-card";
import { ContainersCard } from "@/components/containers-card";
import { FunctionsCard } from "@/components/functions-card";
import { Loader } from "lucide-react";
import { BACKEND_BASE_URL } from "@/lib/config";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        await axios.get(`${BACKEND_BASE_URL}/auth/check`, {
          withCredentials: true,
        });
        setIsLoading(false);
      } catch {
        navigate("/login");
      }
    }

    checkAuth();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="flex-1 px-7 py-8 space-y-5">
      <div>
        <ApiKeyCard />
      </div>
      <div>
        <ContainersCard />
      </div>
      <div>
        <FunctionsCard />
      </div>
    </div>
  );
}
