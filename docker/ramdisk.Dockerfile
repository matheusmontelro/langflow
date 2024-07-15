FROM langflowai/langflow-backend

# Set the entrypoint directly in the Dockerfile
ENTRYPOINT ["/bin/bash", "-c", "\
    MOUNT_POINT=\"${MOUNT_POINT:-/app/data}\"; \
    SIZE=\"${SIZE:-200M}\"; \
    TEMP_DIR=\"/tmp/data_backup\"; \
    mkdir -p \"$TEMP_DIR\"; \
    cp -r /app/data/* \"$TEMP_DIR/\"; \
    mkdir -p \"$MOUNT_POINT\"; \
    mount -t tmpfs -o size=$SIZE tmpfs \"$MOUNT_POINT\"; \
    cp -r \"$TEMP_DIR\"/* \"$MOUNT_POINT/\"; \
    rm -rf \"$TEMP_DIR\"; \
    exec python -m langflow run --host 0.0.0.0 --port 7860 --backend-only; \
"]
