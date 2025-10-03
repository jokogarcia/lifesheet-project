#!/bin/bash
# Script to connect to a remote server, spin up mongo-tools and create an SSH tunnel

# Configuration - modify these variables
REMOTE_USER="joaquin"                         # Remote server username
REMOTE_HOST="irazu.com.ar"      # Remote server hostname or IP
REMOTE_PORT="22"                           # SSH port on the remote server
REMOTE_PROJECT_PATH="repos/lifesheet-project"  # Path to the project on the remote server
LOCAL_MONGO_PORT="27018"                   # Local port to forward MongoDB to
REMOTE_MONGO_PORT="27017"                  # Remote MongoDB port

# Command line argument handling
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <remote-user>@<remote-host> [remote-project-path] [ssh-port]"
    echo "Example: $0 user@example.com /home/user/lifesheet-project 22"
    echo "SSH port defaults to 22 if not specified"
    exit 1
fi

# Parse connection string if provided
if [[ $1 == *"@"* ]]; then
    REMOTE_USER=${1%@*}
    REMOTE_HOST=${1#*@}
fi

# Use provided project path if specified
if [[ $# -ge 2 ]]; then
    REMOTE_PROJECT_PATH=$2
fi

# Use provided SSH port if specified, otherwise keep default (22)
if [[ $# -ge 3 ]]; then
    REMOTE_PORT=$3
fi

echo "Connecting to $REMOTE_USER@$REMOTE_HOST on port $REMOTE_PORT..."
echo "Project path on remote: $REMOTE_PROJECT_PATH"

# Step 1: SSH to the remote server and set up the mongo-tools
ssh -t -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST << EOF
    echo "Connected to remote server."
    cd $REMOTE_PROJECT_PATH
    echo "Starting mongo-tools Docker Compose services..."
    docker compose -f docker-compose-mongo-tools.yml up -d
    if [ $? -ne 0 ]; then
        echo "Failed to start Docker Compose services."
        exit 1
    fi
    echo "Services started successfully!"
    exit
EOF

if [ $? -ne 0 ]; then
    echo "Failed to connect or start services on remote server."
    exit 1
fi

# Step 2: Create an SSH tunnel to forward the MongoDB port
echo "Creating SSH tunnel for MongoDB on port $LOCAL_MONGO_PORT..."
echo "Press Ctrl+C to close the tunnel when finished."
echo "You can now connect to MongoDB at localhost:$LOCAL_MONGO_PORT"

# Create the tunnel in the foreground
ssh -L $LOCAL_MONGO_PORT:localhost:$REMOTE_MONGO_PORT -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST

# When the user presses Ctrl+C, the script will continue here
echo "SSH tunnel closed."

# Optional: Ask if the user wants to stop the remote services
read -p "Do you want to stop the remote Docker Compose services? (y/n): " STOP_SERVICES

if [[ $STOP_SERVICES == "y" || $STOP_SERVICES == "Y" ]]; then
    echo "Stopping remote services..."
    ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST << EOF
        cd $REMOTE_PROJECT_PATH
        docker compose -f docker-compose-mongo-tools.yml down
        echo "Remote services stopped."
        exit
EOF
else
    echo "Remote services left running."
fi

echo "Done!"
