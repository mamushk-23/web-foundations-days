# Capstone Reflection

The most difficult concept in this course was understanding how to prevent race conditions, specifically double-booking in a high-traffic system. Initially, I assumed checking a database record in application code was sufficient. I overcame this by learning about database transactions, row-level locking, and unique constraints, which shifted my perspective to rely on the database's built-in guarantees for strict correctness.

Based on the feedback from my previous assignments, the part of my capstone I would most improve is the granularity of my load estimates. In earlier designs, I only calculated average daily traffic. For this final project, I made sure to explicitly calculate the "big sale" peak (333 requests per second) and design the architecture specifically for that burst using a queue and Redis, rather than just scaling up the average numbers.

Moving forward, I want to learn more about message brokers like Kafka or RabbitMQ in depth. Specifically, I want to understand how to implement robust retry mechanisms and idempotency in distributed systems to gracefully handle failures in asynchronous workflows.