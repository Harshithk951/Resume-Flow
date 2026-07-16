import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function git(cwd: string, args: string): Promise<string> {
  const { stdout } = await execAsync(`git ${args}`, { cwd });
  return stdout.trim();
}
