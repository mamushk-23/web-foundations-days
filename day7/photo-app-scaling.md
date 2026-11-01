# SnapShare — Scaling Plan

## Assumptions

- 10,000,000 registered users.
- 10% of registered users are active on any given day.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Average photo size = 2 MB; each photo also produces a 50 KB thumbnail.
- A "feed view" is one paginated request that returns ~20 photos.
- Traffic is spread evenly across 24 hours for the average, and peaks at 5× the average for a short window.

## Derived Numbers

- **Daily Active Users (DAU):** 10,000,000 × 0.10 = **1,000,000 DAU**
- **Uploads per day:** 1,000,000 photos
- **Uploads per second (avg):** 1,000,000 / 86,400 ≈ **~12 uploads/sec**
- **Feed views per day:** 1,000,000 × 50 = 50,000,000
- **Feed views per second (avg):** 50,000,000 / 86,400 ≈ **~579 views/sec**
- **Feed views per second (peak, 5×):** **~2,895 views/sec**
- **Storage per photo (original + thumbnail):** 2 MB + 0.05 MB = **2.05 MB**
- **Storage per day:** 1,000,000 × 2.05 MB ≈ **2.05 TB/day**
- **Storage per year:** 2.05 TB × 365 ≈ **~750 TB/year**

## Read-Heavy vs Write-Heavy

SnapShare is **read-heavy**: roughly 48 reads for every 1 write (579 feed views/sec vs 12 uploads/sec).

What this means for the design:
- Reads must be served from caches and replicas, not the primary database.
- Photos and feed content should be served through a CDN so the origin is hit only on misses.
- The write path (upload + thumbnail generation) can be slower and asynchronous without hurting user experience, because writes are a small fraction of traffic.
- The feed read path must be extremely fast, so we denormalize and pre-compute feeds where possible.

## Why Photos Should Not Live in the Database

Storing photo bytes as BLOBs inside the relational database would bloat every backup, blow out the buffer pool, prevent independent scaling of storage and compute, and make it impossible to serve photos through a CDN (which needs plain HTTP URLs). Photos should instead live in **object storage** (e.g. S3-compatible), which is cheap, scales to petabytes, and is directly CDN-friendly. The database keeps only the small metadata rows (photo id, owner id, URLs, timestamps, caption).

## Architecture
# SnapShare — Scaling Plan

## Assumptions

- 10,000,000 registered users.
- 10% of registered users are active on any given day.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Average photo size = 2 MB; each photo also produces a 50 KB thumbnail.
- A "feed view" is one paginated request that returns ~20 photos.
- Traffic is spread evenly across 24 hours for the average, and peaks at 5× the average for a short window.

## Derived Numbers

- **Daily Active Users (DAU):** 10,000,000 × 0.10 = **1,000,000 DAU**
- **Uploads per day:** 1,000,000 photos
- **Uploads per second (avg):** 1,000,000 / 86,400 ≈ **~12 uploads/sec**
- **Feed views per day:** 1,000,000 × 50 = 50,000,000
- **Feed views per second (avg):** 50,000,000 / 86,400 ≈ **~579 views/sec**
- **Feed views per second (peak, 5×):** **~2,895 views/sec**
- **Storage per photo (original + thumbnail):** 2 MB + 0.05 MB = **2.05 MB**
- **Storage per day:** 1,000,000 × 2.05 MB ≈ **2.05 TB/day**
- **Storage per year:** 2.05 TB × 365 ≈ **~750 TB/year**

## Read-Heavy vs Write-Heavy

SnapShare is **read-heavy**: roughly 48 reads for every 1 write (579 feed views/sec vs 12 uploads/sec).

What this means for the design:
- Reads must be served from caches and replicas, not the primary database.
- Photos and feed content should be served through a CDN so the origin is hit only on misses.
- The write path (upload + thumbnail generation) can be slower and asynchronous without hurting user experience, because writes are a small fraction of traffic.
- The feed read path must be extremely fast, so we denormalize and pre-compute feeds where possible.

## Why Photos Should Not Live in the Database

Storing photo bytes as BLOBs inside the relational database would bloat every backup, blow out the buffer pool, prevent independent scaling of storage and compute, and make it impossible to serve photos through a CDN (which needs plain HTTP URLs). Photos should instead live in **object storage** (e.g. S3-compatible), which is cheap, scales to petabytes, and is directly CDN-friendly. The database keeps only the small metadata rows (photo id, owner id, URLs, timestamps, caption).

## Architecture


## Component Responsibilities (one sentence each)

- **CDN** — Caches photos, thumbnails, and static assets at edge locations worldwide so the vast majority of feed reads never reach our origin.
- **Load Balancer** — Distributes incoming API requests across a fleet of app servers and performs health checks.
- **App Servers** — Run the business logic for uploads, feed reads, auth, and fan-out; they are stateless so we can scale horizontally.
- **Cache (Redis)** — Holds hot data such as recent feeds, user sessions, and photo metadata so the database is only hit on cache misses.
- **Primary Database** — The source of truth for user accounts, follow relationships, and photo metadata; all writes go here.
- **Read Replica** — An asynchronously replicated copy of the database that serves read queries (feeds, profile lookups) to relieve the primary.
- **Object Storage** — Stores the actual photo and thumbnail bytes as files addressed by URL; it scales independently and is cheap per GB.
- **Queue** — Buffers thumbnail-generation jobs so uploads return quickly and the work can be retried if a worker fails.
- **Worker** — Pulls jobs from the queue, generates the 50 KB thumbnail from the original, uploads it to object storage, and updates the photo's metadata.

## Upload Flow (step by step)

1. The client authenticates and POSTs the photo bytes to an app server via the load balancer.
2. The app server streams the original bytes directly into object storage and receives back a public URL.
3. The app server inserts a row into the primary database (photo id, owner id, original URL, caption, timestamp) with thumbnail URL initially empty.
4. The app server publishes a `generate_thumbnail` message to the queue containing the photo id and original URL.
5. The app server returns HTTP 200 to the client with the photo id and original URL; the upload feels instant.
6. A worker picks up the message, downloads the original from object storage, resizes it to a 50 KB thumbnail, and uploads the thumbnail back to object storage.
7. The worker updates the photo row in the primary database with the thumbnail URL and deletes the job from the queue.
8. Subsequent feed reads now return both the original and thumbnail URLs; the CDN caches both on first access.

## Trade-offs

1. **Pull vs. Push feed model.** We chose a *pull* model (build the feed on read by querying the follow graph + recent photos) because it is simple and storage-cheap for users with millions of followers (e.g. celebrities). The downside is that feed reads hit the database/cache on every request; a *push* (fan-out-on-write) model would make reads O(1) per user but would explode write amplification for popular users. A hybrid (push for normal users, pull for celebrities) is the usual production answer.

2. **Synchronous vs. asynchronous thumbnail generation.** We chose *asynchronous* (queue + worker) so the upload returns to the user immediately and a slow worker cannot block the upload path. The downside is that for a brief window the photo has no thumbnail, so the client must either show the original or a placeholder; a *synchronous* path would be simpler and give an instant thumbnail but would make uploads slower and couple the upload latency to worker health.

3. **SQL vs. NoSQL for metadata.** We chose a relational primary + read replica because follow relationships and photo metadata benefit from strong consistency and joins. The downside is that horizontal sharding of the primary is harder than with a key-value store; if write volume grows beyond what a sharded SQL cluster can handle, we would migrate the feed timeline itself to a wide-column or document store.
