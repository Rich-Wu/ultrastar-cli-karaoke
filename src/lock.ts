import { Effect } from "effect";

// Created once when this module is first imported
export const separatorLock = Effect.runSync(Effect.makeSemaphore(1));
