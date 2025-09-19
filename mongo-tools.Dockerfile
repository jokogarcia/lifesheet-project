FROM mongo:5

# Install utilities that might be helpful
RUN apt-get update && apt-get install -y \
    nano \
    vim \
    less \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /data

# Keep container running
CMD ["tail", "-f", "/dev/null"]
