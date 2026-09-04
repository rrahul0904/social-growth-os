import { completeJob, failJob, leaseNextJob } from "../src/lib/queue/jobs";

const workerId = `worker-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const pollMs = Number(process.env.WORKER_POLL_MS ?? 2500);
const leaseSeconds = Number(process.env.WORKER_LEASE_SECONDS ?? 90);

async function processJob(job: Awaited<ReturnType<typeof leaseNextJob>>) {
  if (!job) return;
  try {
    // Replace with type-specific handlers. The durable lease/retry mechanics are production-ready;
    // provider-specific network calls remain isolated in adapter modules.
    console.log(`[${workerId}] processing ${job.type} ${job.id}`);
    await completeJob(job.id);
  } catch (error) {
    await failJob(job.id, error instanceof Error ? error.message : "Unknown worker failure");
  }
}

async function main() {
  console.log(`[${workerId}] started`);
  for (;;) {
    const job = await leaseNextJob(workerId, leaseSeconds);
    if (job) await processJob(job);
    else await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
