from sdk import Client
from sdk.function import function

client = Client(api_key="YOUR_API_KEY")

@function(client=client)
def getCurrentDirectory():
    import os
    current_directory = os.getcwd()
    print("Hello from inside the function.")
    print(f"Current Working Directory: {current_directory}")
    return current_directory

# Calling and running the function locally
print(getCurrentDirectory())

# Calling and running the function remotely in a container in the cloud
res = getCurrentDirectory.remote()

if(res['success']):
    print(res['result'])    # Logs of the function call in the remote container
else:
    print(res['message'])   # Error message if the remote call failed