import { posts } from "@/lib/demo-data";
import { getPublisher } from "@/lib/adapters/social";

export async function POST(request: Request) {
  const body = (await request.json()) as { postId?: string; approved?: boolean };
  const post = posts.find((item) => item.id === body.postId);
  if (!post) return Response.json({ error: "post not found" }, { status: 404 });
  if (!body.approved) return Response.json({ error: "explicit approval is required before publishing" }, { status: 409 });
  const result = await getPublisher(post.channel).publish(post);
  return Response.json(result);
}
