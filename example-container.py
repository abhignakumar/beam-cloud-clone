from sdk import Client
from sdk.pod import Pod

client = Client(api_key="YOUR_API_KEY")

pod = Pod(client, image="nginx:latest", ports=[80])

# Creating and starting a container with given image in the cloud
response = pod.create()

print(response) # Returns the container ID and a URL to access it
