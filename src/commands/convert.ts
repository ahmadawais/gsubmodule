import * as p from '@clack/prompts';
import pc from 'picocolors';
import { exec } from '../utils.js';
import { existsSync } from 'fs';
import { basename, resolve } from 'path';

interface ConvertOptions {
  folder?: string;
  name?: string;
  visibility?: 'public' | 'private';
}

export async function convert(options: ConvertOptions) {
  p.intro(pc.bgCyan(pc.black(' gsubmodule convert ')));

  const folderPath = options.folder || await p.text({
    message: 'Enter the folder path to convert:',
    placeholder: 'packages/studio',
    validate: (value) => {
      if (!value) return 'Folder path is required';
      if (!existsSync(resolve(process.cwd(), value))) return 'Folder does not exist';
    }
  });

  if (p.isCancel(folderPath)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const repoName = options.name || await p.text({
    message: 'Enter the repository name:',
    placeholder: basename(folderPath as string),
    initialValue: basename(folderPath as string),
    validate: (value) => {
      if (!value) return 'Repository name is required';
    }
  });

  if (p.isCancel(repoName)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const visibility = options.visibility || await p.select({
    message: 'Repository visibility:',
    options: [
      { value: 'private', label: 'Private' },
      { value: 'public', label: 'Public' }
    ]
  });

  if (p.isCancel(visibility)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // Get GitHub username
  const spinner = p.spinner();
  spinner.start('Getting GitHub username...');

  let ghUser: string;
  try {
    ghUser = (await exec('gh api user -q .login')).trim();
    spinner.stop(`GitHub user: ${pc.green(ghUser)}`);
  } catch {
    spinner.stop(pc.red('Failed to get GitHub username'));
    p.log.error('Make sure you are logged in with `gh auth login`');
    process.exit(1);
  }

  const mainRepo = process.cwd();
  const fullFolderPath = resolve(mainRepo, folderPath as string);
  const tempDir = `/tmp/${repoName}`;

  // Confirm before proceeding
  const confirm = await p.confirm({
    message: `Convert ${pc.cyan(folderPath as string)} to submodule ${pc.green(`${ghUser}/${repoName}`)}?`
  });

  if (!confirm || p.isCancel(confirm)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const tasks = p.tasks([
    {
      title: 'Creating temporary repository',
      task: async () => {
        await exec(`rm -rf ${tempDir}`);
        await exec(`mkdir -p ${tempDir}`);
        await exec(`cp -r "${fullFolderPath}"/* ${tempDir}/`);
        await exec(`cd ${tempDir} && git init && git add . && git commit -m "📦 NEW: Initial commit"`);
        return 'Temporary repo created';
      }
    },
    {
      title: 'Creating GitHub repository',
      task: async () => {
        await exec(`cd ${tempDir} && gh repo create ${repoName} --${visibility} --source=. --remote=origin --push`);
        return `Created ${ghUser}/${repoName}`;
      }
    },
    {
      title: 'Removing folder from main repo',
      task: async () => {
        await exec(`cd "${mainRepo}" && git rm -rf "${folderPath}"`);
        await exec(`cd "${mainRepo}" && git commit -m "👌 IMPROVE: Remove ${repoName} folder for submodule conversion"`);
        return 'Folder removed';
      }
    },
    {
      title: 'Adding as git submodule',
      task: async () => {
        const repoUrl = `https://github.com/${ghUser}/${repoName}.git`;
        await exec(`cd "${mainRepo}" && git submodule add ${repoUrl} "${folderPath}"`);
        await exec(`cd "${mainRepo}" && git commit -m "📦 NEW: Add ${repoName} as git submodule"`);
        return 'Submodule added';
      }
    },
    {
      title: 'Cleaning up',
      task: async () => {
        await exec(`rm -rf ${tempDir}`);
        return 'Cleaned up';
      }
    }
  ]);

  await tasks.run();

  p.outro(pc.green('✓ Successfully converted folder to submodule!'));

  console.log('\n' + pc.dim('  Summary:'));
  console.log(pc.dim(`  • New repo: ${pc.cyan(`https://github.com/${ghUser}/${repoName}`)}`));
  console.log(pc.dim(`  • Submodule path: ${pc.cyan(folderPath as string)}`));
  console.log(pc.dim(`  • Visibility: ${pc.cyan(visibility as string)}\n`));
}
