# CableNetworkVisualization

This project integrates an Angular front-end with a FastAPI back-end to visualize terrain data and cable network inquiries. The terrain data is processed using Docker and served through a Cesium Terrain Server.

## Table of Contents

1. [Development Server](#development-server)
2. [Backend Setup](#backend-setup)
3. [Installing Docker](#installing-docker)
4. [Running Docker Containers](#running-docker-containers)
5. [Code Scaffolding](#code-scaffolding)
6. [Build](#build)
7. [Running Unit Tests](#running-unit-tests)
8. [Running End-to-End Tests](#running-end-to-end-tests)
9. [Further Help](#further-help)

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Backend Setup

1. **Install Dependencies:**

   - Ensure you have Python 3.8+ installed.
   - Set up a Python virtual environment:

     ```sh
     python -m venv venv
     source venv/bin/activate  # On Windows use `venv\Scripts\activate`
     ```

   - Install the required Python packages:

     ```sh
     pip install -r requirements.txt
     ```

2. **Database Setup:**

   - Create a `.env` file in the `backend` directory with the following content:

     ```sh
     DB_NAME=your_db_name
     DB_USER=your_db_user
     DB_PASSWORD=your_db_password
     DB_HOST=your_db_host
     DB_PORT=your_db_port
     ```

3. **Running the Backend:**

   - Run the FastAPI server:

     ```sh
     uvicorn main:app --reload
     ```

   - The backend server will be available at `http://localhost:8000`.

## Installing Docker

1. **Install Docker:**

   - Follow the instructions on the [Docker website](https://docs.docker.com/get-docker/) to install Docker for your operating system.

2. **Verify Docker Installation:**

   - After installation, verify that Docker is installed correctly by running:

     ```sh
     docker --version
     ```

## Running Docker Containers

1. **Build the Docker Image:**

   - Build the Docker image using the Dockerfile provided in the repository:

     ```sh
     docker build -t cesium-terrain-builder .
     ```

2. **Run the Docker Container to Generate Terrain Tiles:**

   - Run the Docker container to generate terrain tiles. The `-v` option mounts the local directory to the Docker container. Use the command based on your operating system:

   - **Linux - bash:**

     ```sh
     docker run -it --name ctb -v "/docker/terrain:/data" cesium-terrain-builder
     ```

   - **Windows - cmd:**

     ```sh
     docker run -it --name ctb -v "c:/docker/terrain:/data" cesium-terrain-builder
     ```

   - **Windows - git-bash:**

     ```sh
     winpty docker run --rm -it --name ctb -v "c:\\docker\\terrain:/data" cesium-terrain-builder
     ```

   - **Windows - powershell:**

     ```sh
     docker run -it --name ctb -v "c:\docker\terrain:/data" cesium-terrain-builder
     ```

3. **Run Cesium Terrain Server:**

   - Pull the Cesium Terrain Server image:

     ```sh
     docker pull nmccready/cesium-terrain-server
     ```

   - Run the Cesium Terrain Server to serve the terrain tiles:

     ```sh
     docker run -p 8080:8000 --name cesium-terrain-server -v "C:/docker/terrain:/data/tilesets/terrain" nmccready/cesium-terrain-server
     ```

## Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running End-to-End Tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

### Additional Notes

- **Fetching and Processing GeoTIFF Files:**
  The backend endpoints `/fetch-geotiff` and `/process-geotiff` handle fetching and processing GeoTIFF files to generate terrain tiles.
- **Directory Structure:**

  - The terrain tiles are stored in the `C:/docker/terrain/output` directory.
  - Ensure Docker has access to the `C:/docker/terrain` directory for volume mounting.

- **Logging:**
  The backend uses logging to track the status of operations. Logs are stored in the `app.log` file.

- **API Endpoints:**
  - `GET /fetch-geotiff`: Fetches a GeoTIFF file based on the provided bounding box and dimensions.
  - `GET /process-geotiff`: Processes the fetched GeoTIFF file to generate terrain tiles.

Ensure you follow these steps to set up the project correctly. For any issues or further assistance, refer to the project documentation or reach out to the development team.

### Credits

- The Cesium Terrain Builder Docker setup is based on [tum-gis/cesium-terrain-builder-docker](https://github.com/tum-gis/cesium-terrain-builder-docker).
