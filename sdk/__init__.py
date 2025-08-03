import requests
from typing import Dict


class Client:
    """
    Base client for interacting with the API.
    """

    def __init__(self, api_key: str, base_url: str = "https://server.beamclone.abhigna.online"):
        if not api_key:
            raise ValueError("API key must be provided.")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update(self._get_headers())

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
