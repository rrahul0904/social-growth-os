"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApprovalActions({entityId,entityType="post"}:{entityId:string;entityType?:"post"|"workflow"|"campaign"}){
  const router=useRouter();const [state,setState]=useState<"idle"|"saving"|"approved"|"rejected"|"error">("idle");
  async function decide(decision:"approved"|"rejected"){setState("saving");const response=await fetch("/api/approvals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({entityId,entityType,decision})});if(!response.ok){setState("error");return}setState(decision);router.refresh()}
  if(state==="approved"||state==="rejected")return <span className={`status-chip status-${state==="approved"?"published":"failed"}`}>{state}</span>;
  return <div className="approval-actions"><button disabled={state==="saving"} onClick={()=>decide("approved")}>Approve</button><button disabled={state==="saving"} onClick={()=>decide("rejected")}>Reject</button>{state==="error"?<small>Could not save</small>:null}</div>
}
