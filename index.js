// Connect to WebSockets
// Download all blocks
// Upload to database
// Continue to monitor blocks

import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Client } = pkg;
import { FetchBlockHeight, GetMissingBlocks } from "./blocks.js";
import { CreateSockets } from "./connect.js";
import { nodes } from "./nodes.js";

process.title = "quai-cli";

var names = [
  "prime",
  "region-1",
  "region-2",
  "region-3",
  "zone-1-1",
  "zone-1-2",
  "zone-1-3",
  "zone-2-1",
  "zone-2-2",
  "zone-2-3",
  "zone-3-1",
  "zone-3-2",
  "zone-3-3",
];

// var names = ["zone-1-1"];

async function initApp() {
  const client = new Client();
  await client.connect();

  const nodeHost = process.env.NODE_HOST;

  // See what latest data we have in Postgres
  const query =
    "SELECT DISTINCT ON (location) * from blocks ORDER BY location, timestamp DESC";
  var rows = [];
  try {
    const res = await client.query(query);
    rows = res.rows;
    console.log({ rows });
  } catch (err) {
    console.log(err.stack);
  }

  for (var i = 0; i < rows.length; i++) {
    var location = rows[i].location;
    var height;
    if (!rows[i].number) {
      height = 0;
    }
    height = rows[i].number.split(",")[nodes[location].context];
    nodes[location].height = height;
  }

  for (var i = 0; i < names.length; i++) {
    var nodeInfo = nodes[names[i]];
    // var currHeight = await FetchBlockHeight(nodeHost, nodeInfo.http);
    // if (nodeInfo.height < currHeight) {
    //   await GetMissingBlocks(client, nodeHost, nodeInfo, currHeight);
    // }
    await CreateSockets(client, nodeHost, nodeInfo);
  }
}

initApp();
