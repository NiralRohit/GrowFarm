import uvicorn
import os
import sys

if __name__ == "__main__":
    print("Starting GrowFarm ML Inference Server...")
    print(f"Python: {sys.version}")
    print(f"Current Directory: {os.getcwd()}")
    
    try:
        # Import the app safely to catch errors
        from main import app1
        print("FastAPI App loaded. Starting Uvicorn on port 8001...")
        uvicorn.run(app1, host="0.0.0.0", port=8001, log_level="info")
    except Exception as e:
        print(f"Critical Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
