import { db } from "../db/client";
import { isDemoMode } from "../config";

export type JobType="workflow.run"|"social.publish"|"analytics.collect"|"catalog.sync";
export interface QueueJob{id:string;workspaceId:string;type:JobType;payload:Record<string,unknown>;attempts:number;maxAttempts:number}

export async function enqueueJob(type:JobType,payload:Record<string,unknown>,workspaceId:string){if(isDemoMode())return{id:`demo_job_${crypto.randomUUID()}`,workspaceId,type,payload};const sql=db();const [row]=await sql`insert into job_queue (workspace_id,type,payload) values (${workspaceId}::uuid,${type},${sql.json(payload)}) returning id,workspace_id::text as "workspaceId",type,payload`;return row}
export async function leaseNextJob(workerId:string,leaseSeconds=90):Promise<QueueJob|null>{if(isDemoMode())return null;const sql=db();const rows=await sql<QueueJob[]>`with candidate as (select id from job_queue where status='queued' and run_at<=now() and attempts<max_attempts order by priority desc,created_at asc for update skip locked limit 1) update job_queue j set status='running',leased_by=${workerId},lease_expires_at=now()+(${leaseSeconds}||' seconds')::interval,attempts=attempts+1,updated_at=now() from candidate where j.id=candidate.id returning j.id,j.workspace_id::text as "workspaceId",j.type,j.payload,j.attempts,j.max_attempts as "maxAttempts"`;return rows[0]??null}
export async function completeJob(jobId:string){if(isDemoMode())return;const sql=db();await sql`update job_queue set status='completed',completed_at=now(),updated_at=now() where id=${jobId}`}
export async function failJob(jobId:string,error:string){if(isDemoMode())return;const sql=db();await sql`update job_queue set status=case when attempts>=max_attempts then 'dead' else 'queued' end,last_error=${error},leased_by=null,lease_expires_at=null,run_at=now()+(least(300,power(2,attempts)*5)::int||' seconds')::interval,updated_at=now() where id=${jobId}`}
