export type ThrottleDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type Bucket = {
  failures: number;
  windowStartedAt: number;
};

export type AttemptThrottleOptions = {
  maxAttempts: number;
  windowMs: number;
  now?: () => Date;
  maxKeys?: number;
};

export class AttemptThrottle {
  private readonly buckets = new Map<string, Bucket>();
  private readonly now: () => Date;

  constructor(private readonly options: AttemptThrottleOptions) {
    this.now = options.now ?? (() => new Date());
  }

  check(key: string): ThrottleDecision {
    const bucket = this.buckets.get(key);
    if (!bucket) return { allowed: true, retryAfterSeconds: 0 };

    const elapsed = this.now().getTime() - bucket.windowStartedAt;
    if (elapsed >= this.options.windowMs) {
      this.buckets.delete(key);
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (bucket.failures < this.options.maxAttempts) {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((this.options.windowMs - elapsed) / 1000),
      ),
    };
  }

  recordFailure(key: string): void {
    const startedAt = this.now().getTime();
    const bucket = this.buckets.get(key);

    if (!bucket || startedAt - bucket.windowStartedAt >= this.options.windowMs) {
      this.prune(startedAt);
      this.buckets.set(key, { failures: 1, windowStartedAt: startedAt });
      return;
    }

    bucket.failures += 1;
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  private prune(startedAt: number): void {
    if (this.buckets.size < (this.options.maxKeys ?? 5000)) return;

    for (const [key, bucket] of this.buckets) {
      if (startedAt - bucket.windowStartedAt >= this.options.windowMs) {
        this.buckets.delete(key);
      }
    }
  }
}
