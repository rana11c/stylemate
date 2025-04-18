import os
import logging
from app import app

logging.basicConfig(level=logging.DEBUG)

# Import routes to register them
import routes

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
