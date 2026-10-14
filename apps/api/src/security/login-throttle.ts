export type ThrottleDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export type LoginThrottle = {
  check(key: string): Promise<ThrottleDecision>;
  recordFailure(key: string): Promise<void>;
  reset(key: string): Promise<void>;
};

type Bucket = {
  failures: number;
  windowStartedAt: number;
};

export type MemoryLoginThrottleOptions = {
  maxAttempts: number;
  windowMs: number;
  now?: () => Date;
  maxKeys?: number;
};

export class MemoryLoginThrottle implements LoginThrottle {
  private readonly buckets = new Map<string, Bucket>();
  private readonly now: () => Date;

  constructor(private readonly options: MemoryLoginThrottleOptions) {
    this.now = options.now ?? (() => new Date());
  }

  async check(key: string): Promise<ThrottleDecision> {
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

  async recordFailure(key: string): Promise<void> {
    const startedAt = this.now().getTime();
    const bucket = this.buckets.get(key);

    if (!bucket || startedAt - bucket.windowStartedAt >= this.options.windowMs) {
      this.prune(startedAt);
      this.buckets.set(key, { failures: 1, windowStartedAt: startedAt });
      return;
    }

    bucket.failures += 1;
  }

  async reset(key: string): Promise<void> {
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
