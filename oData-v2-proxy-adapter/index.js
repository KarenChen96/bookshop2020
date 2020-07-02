"use strict";

const express = require("express");
const http = require("http");

const odatav2proxy = require("@sap/cds-odata-v2-adapter-proxy");

//const host = process.env.HOST;
const PORT = process.env.PORT || 4000;

const app = express();

// serve odata v2
process.env.XS_APP_LOG_LEVEL = "warning";
app.use(
  odatav2proxy({
    path: "v2",
    model: "./srv.json",
    target :"http://localhost:8000", //for local
    // target:
    //   "https://c4p-project-management-pm-defiant-sandbox-enterpriseproject-srv.cfapps.sap.hana.ondemand.com", // target port
    services: {
      "/api/planning": "mainService",
    },
  })
);

// start server
const server = new http.Server(app);
server.listen(PORT, () => {
  console.info(`server listening on port ${PORT}`);
});
