
# Campus Classroom Availability Map

![Campus Map](https://example.com/campus-map-screenshot.png) <!-- Replace with an actual screenshot -->

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Future Improvements](#future-improvements)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

The **Campus Classroom Availability Map** is a React-based web application designed to help students at the University of Maryland (UMD) find available classrooms across the campus in real-time. Inspired by platforms like [Spots](https://spots.cs.washington.edu/), this application integrates the UMD Building API and intercepts the 25live API to provide up-to-date information on classroom availability. Whether you're looking for a quiet study space or a room equipped with specific facilities, this map offers a convenient and interactive solution.

## Features

- **Real-Time Classroom Availability:** View available classrooms across all UMD buildings in real-time.
- **Interactive Map:** Visualize classroom locations on an interactive Mapbox map.
- **Geolocation:** Automatically center the map based on your current location.
- **Detailed Classroom Information:** Click on buildings to view individual classroom statuses and schedules.
- **Recenter Button:** Easily recenter the map to your current location with a single click.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- **Node.js** (v14 or later)
- **npm** (v6 or later)
- **Mapbox Account:** You'll need a Mapbox access token. Sign up at [Mapbox](https://www.mapbox.com/) if you don't have one.

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/campus-classroom-availability-map.git
   cd campus-classroom-availability-map
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory and add your Mapbox access token:

   ```env
   REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   ```

4. **Add Building Data:**

   Ensure that `buildings_data.json` is present in the `public` directory. This file should contain the necessary data about campus buildings and classrooms.

### Running the Application

Start the development server:

   ```bash
   npm start
   ```

Open `http://localhost:3000` in your browser to view the application. The page will reload automatically if you make any changes to the source code.

## Available Scripts

In the project directory, you can run:

- **`npm start`**: Runs the app in development mode.
- **`npm test`**: Launches the test runner in interactive watch mode.
- **`npm run build`**: Builds the app for production in the `build` folder.

## Future Improvements

- **Enhanced Mobile Responsiveness**
- **Route Planning**
- **User Authentication**
- **Filtering and Sorting**
- **Real-Time Notifications**
- **Integration with Campus Services**
- **Performance Optimization**

## Technologies Used

- React, Mapbox GL JS, JavaScript (ES6+), CSS Flexbox & Media Queries, Fetch API, PropTypes

## Contributing

1. **Fork the Repository**
2. **Create a New Branch:** `git checkout -b feature/YourFeatureName`
3. **Commit Your Changes:** `git commit -m "Add some feature"`
4. **Push to the Branch:** `git push origin feature/YourFeatureName`
5. **Open a Pull Request**

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

Andrew Xie  
Junior CS @ UMD
Email: andrewxie2004@gmail.com
LinkedIn: [linkedin.com/in/andrewxie04](https://linkedin.com/in/andrewxie04)
