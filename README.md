Node Web Application
Description
This web application allows for the creation and manipulation of nodes and edges, designed to display graphs and associated matrices. The interface provides forms for managing nodes and edges and allows the loading of JSON files with data for visualization.

Project Structure
The project consists of the following main files:

parcial.html: Contains the HTML structure of the application.
parcial.css: Contains the CSS styles for the application.
parcial.js: Contains the JavaScript logic for manipulating nodes and edges (not provided but mentioned in the HTML).
File Contents
parcial.html
The HTML file sets up the basic structure of the web application. It includes sections for:

The title and authors of the application.
A container for displaying the graph (#grafo).
A form for node management (#formularioNodos), which includes inputs for node name, duration, cost, prerequisites, and post-requisites, along with buttons for creating, deleting, and editing nodes.
A form for edge management (#formularioAristas), which includes inputs for edge name and cost, along with buttons for connecting nodes, deleting edges, editing edges, finding the shortest path, and finding the critical path.
A stylized input for uploading a JSON file.
Scripts for loading D3.js and parcial.js.
parcial.css
The CSS file provides the styles for the web application, including:

Basic styling for the body, forms, and containers.
Styling for centering and layout adjustments.
Custom styles for buttons and file upload inputs.
Styles for highlighting minimum paths and critical paths in the graph.
Getting Started
To get started with the application:

Clone the repository to your local machine.
Open parcial.html in a web browser.
Use the provided forms to create and manage nodes and edges.
Optionally, upload a JSON file with graph data using the stylized file input.
Authors
David Ricardo Jimenez Nuñez
Dependencies
D3.js (included via CDN in the HTML file)
License
This project is licensed under the MIT License - see the LICENSE file for details.

Feel free to customize this README further according to your needs.
