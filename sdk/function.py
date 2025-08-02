from functools import wraps
from typing import Callable, Any
import requests
import json
import inspect
import textwrap


def function(**config):
    """
    Decorator to wrap a function with local and remote execution capabilities.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # print(f"[Local] Running with config: {config}")
            return func(*args, **kwargs)

        def remote_method(*args, **kwargs) -> Any:
            # print(f"[Remote] Running with config: {config}")
            # print(f"[Remote] Calling {func.__name__} with arguments: {kwargs}")
            try:
                source_lines = inspect.getsourcelines(func)[0]
                source_code = textwrap.dedent("".join(source_lines[1:]))
            except Exception as e:
                # raise RuntimeError(f"Failed to extract function source code: {e}")
                return { "message": "Failed to extract function source code" }
        
            url = f"{config['client'].base_url}/function"
            payload = {
                "language": "python",
                "code": source_code,
                "functionName": func.__name__,
                "args": args,
            }
            try:
                response = config['client'].session.post(url, data=json.dumps(payload))
                response.raise_for_status()
                return response.json()
            except requests.RequestException as e:
                return { "success": False, "message": "Failed to run the function in a container" }

        wrapper.remote = remote_method
        return wrapper

    return decorator
