import type { Post, SocialChannel } from "../types";

export interface PublishResult {
  providerPostId: string;
  url?: string;
  publishedAt: string;
}

export interface SocialPublisher {
  channel: SocialChannel;
  publish(post: Post): Promise<PublishResult>;
}

class DemoPublisher implements SocialPublisher {
  constructor(public readonly channel: SocialChannel) {}

  async publish(post: Post): Promise<PublishResult> {
    if (post.channel !== this.channel) throw new Error(`Publisher channel mismatch: ${this.channel}`);
    return {
      providerPostId: `demo_${this.channel}_${post.id}`,
      publishedAt: new Date().toISOString(),
    };
  }
}

export function getPublisher(channel: SocialChannel): SocialPublisher {
  // Production adapters are intentionally isolated behind this interface so provider OAuth,
  // media-upload and rate-limit quirks never leak into the campaign/workflow domain.
  return new DemoPublisher(channel);
}
