import json
import requests
from typing import List, Dict, Any
from . import Client


class Pod:
    """
    Pod resource for managing containerized environments.
    """

    def __init__(self, client: Client, image: str, ports: List[int] = None):
        if not image:
            raise ValueError("Image must be provided.")

        self.client = client
        self.image = image
        self.ports = ports or []

    def create(self) -> Dict[str, Any]:
        """
        Create a new pod with the specified image and ports.
        """
        url = f"{self.client.base_url}/pod"
        payload = {
            "image": self.image,
            "ports": self.ports
        }
        try:
            response = self.client.session.post(url, data=json.dumps(payload))
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            # raise RuntimeError(f"Failed to create pod: {e}") from e
            return { "message": "Failed to create pod", "error": e }
