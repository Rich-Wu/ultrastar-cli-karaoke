import { spawn } from "node:child_process";
import { Effect } from "effect";
import ffmpeg from "fluent-ffmpeg";
import { join } from "node:path";
import { separatorLock } from "../lock";

export const ripAudio = (
  videoPath: string,
  outputFile: string,
): Effect.Effect<string, Error, never> => {
  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: async () => {
        await new Promise<void>((resolve, reject) =>
          ffmpeg(videoPath)
            .noVideo()
            .audioCodec("libmp3lame")
            .on("end", () => resolve())
            .on("error", reject)
            .save(outputFile),
        );
      },
      catch: (e) =>
        e instanceof Error
          ? e
          : new Error("Failed to split audio track: " + String(e)),
    });
    return outputFile;
  });
};

export const removeVocals = (audioFilePath: string, outputDir: string) => {
  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: async () => {
        return new Promise<void>((resolve, reject) => {
          const args = [
            audioFilePath,
            "-m",
            "UVR_MDXNET_KARA_2.onnx",
            "--output_dir",
            outputDir,
            "--output_format",
            "MP3",
            "--single_stem",
            "Instrumental",
            "--custom_output_names",
            '{"Instrumental": "audio[INSTR]"}',
          ];

          const child = spawn("audio-separator", args, {
            stdio: ["ignore", "pipe", "pipe"],
          });

          let stderr = "";
          child.stderr.on("data", (d) => {
            stderr += d.toString();
          });
          child.on("error", (e) =>
            reject(e instanceof Error ? e : new Error(String(e))),
          );
          child.on("close", (code) => {
            if (code !== 0) {
              reject(
                new Error(
                  `Instrumental isolation from audio-separator failed with exit code ${code}`,
                ),
              );
            }
            resolve();
            return;
          });
        });
      },
      catch: (e) =>
        e instanceof Error
          ? e
          : new Error("Failed to remove vocals: " + String(e)),
    });
  });
};

export const getAudioSerial = (inputDir: string, fileName: string) => {
  return Effect.gen(function* () {
    // For our purpose, all associated data for a song goes in the same folder.
    const outputDir = inputDir;
    const audioPath = yield* ripAudio(
      join(inputDir, fileName),
      join(outputDir, "audio.mp3"),
    );
    yield* removeVocals(audioPath, outputDir);
    return;
  });
};

export const getAudio = (inputDir: string, fileName: string = "video.mp4") => {
  return separatorLock.withPermits(1)(getAudioSerial(inputDir, fileName));
};
