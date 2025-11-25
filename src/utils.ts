import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(execCallback);

export async function exec(command: string): Promise<string> {
  const { stdout, stderr } = await execPromise(command);
  if (stderr && !stderr.includes('warning')) {
    // Only throw on actual errors, not warnings
    const isError = stderr.toLowerCase().includes('error') ||
                    stderr.toLowerCase().includes('fatal');
    if (isError) {
      throw new Error(stderr);
    }
  }
  return stdout;
}
