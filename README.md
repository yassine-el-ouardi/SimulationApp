
# SimulationTwin App

## Getting Started

This repository contains the SimulationTwin App designed for Digital Shadow deployment in the Mining industry. Follow these steps to set up and run the application on your local machine.

### Prerequisites

Ensure you have Python 3.11.2 installed. The app requires several Python libraries and Node.js for the backend and frontend respectively.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yassine-el-ouardi/SimulationApp
   ```

2. Navigate into the cloned directory and install the required Node.js packages:
   ```bash
   npm install
   ```

3. Install the required Python packages:
   ```bash
   pip install tensorflow==2.15.0 flask joblib pandas scikit-learn flask_cors
   ```

### Running the Application

You need to run multiple components in separate terminals:

1. Start the Flask server for the backend:
   ```bash
   cd BigDataBackend/flothProject
   python flaskp.py
   ```

2. Run a separate Python script needed for the backend processes:
   ```bash
   python boucle1.py
   ```

3. Launch the frontend application:
   ```bash
   npm run start
   ```

Now, the SimulationTwin App should be running on your local environment and accessible via a web browser.
