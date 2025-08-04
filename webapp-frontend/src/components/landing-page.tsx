import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Copy, Github } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

export default function LandingPage() {
  const podCodeRef = useRef<HTMLElement>(null);
  const functionCodeRef = useRef<HTMLElement>(null);

  const copyToClipboard = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      const code = ref.current.innerText;
      navigator.clipboard
        .writeText(code)
        .then(() => {
          toast.success("Copied to Clipboard");
        })
        .catch(() => {
          toast.error("Failed to copy");
        });
    }
  };

  return (
    <div className="flex-1 font-sans px-6 py-16">
      <div className="max-w-6xl mx-auto text-center">
        {/* Hero */}
        <h1 className="text-5xl font-bold mb-6">
          Run Any Code, Instantly in the Cloud
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A Beam Cloud Clone – simple, fast, and clean. Containerized execution,
          no setup, no limits.
        </p>
        <div className="flex justify-center gap-4">
          <Link to={"/login"}>
            <Button size={"lg"}>Get Started</Button>
          </Link>
          <Link
            to={"https://github.com/abhignakumar/beam-cloud-clone"}
            target="_blank"
          >
            <Button size={"lg"} variant={"outline"}>
              <Github />
              View on GitHub
            </Button>
          </Link>
        </div>
      </div>

      {/* Preview or Code Demo */}
      <div className="mt-20 max-w-5xl mx-auto bg-card text-card-foreground rounded-lg p-6 shadow-lg border">
        <p className="text-lg mb-4 text-left font-medium">Container Example</p>
        <div className="bg-muted font-mono text-sm rounded p-4 overflow-auto">
          <pre className="flex flex-col sm:flex-row">
            <code className="w-full" ref={podCodeRef}>
              {`from sdk import Client
from sdk.pod import Pod
client = Client(api_key="YOUR_API_KEY")

pod = Pod(client, image="nginx:latest", ports=[80])

response = pod.create()

print(response)
`}
            </code>
            <Button
              size={"icon"}
              variant={"outline"}
              onClick={() => copyToClipboard(podCodeRef)}
              className="mt-2 sm:mt-0"
            >
              <Copy />
            </Button>
          </pre>
        </div>
      </div>

      <div className="mt-10 max-w-5xl mx-auto bg-card text-card-foreground rounded-lg p-8 shadow-lg border">
        <p className="text-lg mb-4 text-left font-medium">Function Example</p>
        <div className="bg-muted font-mono text-sm rounded p-4 overflow-auto">
          <pre className="flex flex-col sm:flex-row">
            <code className="w-full" ref={functionCodeRef}>
              {`from sdk import Client
from sdk.function import function

client = Client(api_key="YOUR_API_KEY")

@function(client=client)
def test():
    print("Hello from the function")
    return "Hello World"

print(test())

res = test.remote()

if(res['success']):
    print(res['result'])
else:
    print(res['message'])`}
            </code>
            <Button
              size={"icon"}
              variant={"outline"}
              onClick={() => copyToClipboard(functionCodeRef)}
              className="mt-2 sm:mt-0"
            >
              <Copy />
            </Button>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-600 text-sm border-t pt-10">
        Built by Abhigna — ready to deploy, scale, and extend.
      </footer>
    </div>
  );
}
