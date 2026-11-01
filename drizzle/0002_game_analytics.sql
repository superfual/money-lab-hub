CREATE TABLE moneylab_analytics_events (id TEXT PRIMARY KEY NOT NULL, day TEXT NOT NULL, metric TEXT NOT NULL, mode TEXT NOT NULL, level TEXT NOT NULL, source TEXT NOT NULL, cohort TEXT NOT NULL, actor TEXT NOT NULL, value REAL NOT NULL DEFAULT 1, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX moneylab_analytics_events_day ON moneylab_analytics_events(day,metric);
--> statement-breakpoint
CREATE INDEX moneylab_analytics_events_actor ON moneylab_analytics_events(actor);
--> statement-breakpoint
CREATE TABLE moneylab_analytics_daily (id TEXT PRIMARY KEY NOT NULL, day TEXT NOT NULL, metric TEXT NOT NULL, mode TEXT NOT NULL, level TEXT NOT NULL, source TEXT NOT NULL, cohort TEXT NOT NULL, count INTEGER NOT NULL, sum_value REAL NOT NULL, updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TRIGGER moneylab_analytics_rollup AFTER INSERT ON moneylab_analytics_events BEGIN INSERT INTO moneylab_analytics_daily (id,day,metric,mode,level,source,cohort,count,sum_value,updated_at) VALUES (NEW.day||'|'||NEW.metric||'|'||NEW.mode||'|'||NEW.level||'|'||NEW.source||'|'||NEW.cohort,NEW.day,NEW.metric,NEW.mode,NEW.level,NEW.source,NEW.cohort,1,NEW.value,NEW.created_at) ON CONFLICT(id) DO UPDATE SET count=count+1,sum_value=sum_value+NEW.value,updated_at=MAX(updated_at,NEW.created_at); END;
--> statement-breakpoint
CREATE TABLE moneylab_analytics_snapshot (metric TEXT PRIMARY KEY NOT NULL, value REAL NOT NULL, note TEXT NOT NULL, updated_at INTEGER NOT NULL);
