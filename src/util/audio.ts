import { Effect } from "effect";
import ffmpeg from "fluent-ffmpeg";

export const ripAudio = (path: string, outputPath: string) => {
  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: async () => {
        ffmpeg(path).noVideo().audioCodec("libmp3lame").save(outputPath);
      },
      catch: (e) =>
        e instanceof Error
          ? e
          : new Error("Failed to split audio track: " + String(e)),
    });
    return;
  });
};

export const removeVocals = (filePath: string, outputPath: string) => {
  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: async () => {},
      catch: (e) =>
        e instanceof Error
          ? e
          : new Error("Failed to remove vocals: " + String(e)),
    });
  });
};
