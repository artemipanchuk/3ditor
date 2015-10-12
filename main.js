// Require main config
var main = require("./main.json");

// Require main classes
var HTTPServer = require("./server/classes/HTTPServer/HTTPServer");

// Create main objects
var httpServer = new HTTPServer;

// Execute main methods
httpServer.run(main.HTTPServerPort);