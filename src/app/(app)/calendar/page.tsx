import { PageHeading } from "@/components/page-heading";
import { posts } from "@/lib/demo-data";
import { StatusChip } from "@/components/status-chip";

const days = ["Thu 3", "Fri 4", "Sat 5", "Sun 6", "Mon 7", "Tue 8", "Wed 9"];

export default function CalendarPage() {
  return (
    <>
      <PageHeading eyebrow="Cross-channel calendar" title="One schedule. Channel-native execution." description="See drafts, approval gates, scheduled posts and published content without losing the reason each asset exists." />
      <section className="panel calendar-panel">
        <div className="calendar-toolbar"><strong>September 3–9, 2026</strong><div><button className="secondary-button">Today</button><button className="secondary-button">Week</button></div></div>
        <div className="week-grid">
          {days.map((day, index) => (
            <div className="day-column" key={day}><div className={index === 0 ? "day-label today" : "day-label"}>{day}</div>
              {posts.filter((_, postIndex) => postIndex % days.length === index || (index === 1 && postIndex < 2)).map((post) => (
                <article className={`calendar-post channel-${post.channel}`} key={`${day}-${post.id}`}><div><span>{post.channel}</span><StatusChip status={post.status}/></div><strong>{post.title}</strong><small>{post.assetType} · {new Date(post.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" })} UTC</small></article>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
