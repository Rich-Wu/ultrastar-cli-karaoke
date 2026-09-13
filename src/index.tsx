import { render } from "ink";
import App from "./ui/App.tsx";
import { parseArgs } from "node:util";

const ENTER_ALTERNATE_SCREEN = "\u001b[?1049h";
const LEAVE_ALTERNATE_SCREEN = "\u001b[?1049l";
const CLEAR_SCREEN = "\u001b[2J"; // clear entire screen
const CURSOR_HOME = "\u001b[H"; // move cursor to 1;1

// Enter alternate screen so previous content is preserved and hidden,
// then clear and move cursor to the top-left to avoid inheriting the previous row.
process.stdout.write(ENTER_ALTERNATE_SCREEN + CLEAR_SCREEN + CURSOR_HOME);

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    songsDir: { type: "string", short: "d" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.log("Usage: ultrastar [--songsDir directory]");
  process.exit(0);
}

const instance = render(<App songsDir={values.songsDir ?? ""} />);

// Ensure we restore previous content when the app exits
instance.waitUntilExit().finally(() => {
  try {
    process.stdout.write(LEAVE_ALTERNATE_SCREEN);
  } catch {}
});
