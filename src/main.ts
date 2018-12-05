import os from "os";
import http from "http";
import cluster from "cluster";

const masterProcessName = "tngine";
let workerId = 0;
function makeWorkerId() {
  return workerId++;
}
function forkWorker() {
  const workerId = makeWorkerId() + "";
  const workerName = `${masterProcessName}:worker:${workerId}`;
  return cluster.fork({ workerId, workerName });
}
function main() {
  if (cluster.isMaster) {
    process.title = masterProcessName;
    const workers = os.cpus().map(cpu => forkWorker());
    cluster.on("exit", (worker, code, signal) => {
      const proc = worker.process;
      console.warn(`Worker ${proc.pid} started`);
    });
  } else {
    const workerId = process.env["workerId"]!;
    const workerName = process.env["workerName"]!;
    process.title = workerName;
    const httpServer = http.createServer((req, resp) => {
      resp.writeHead(200);
      resp.end(`${workerName} Hello World\n`);
    });
    httpServer.listen(3000);
    console.info(`Worker ${process.pid} started`);
  }
}

main();
