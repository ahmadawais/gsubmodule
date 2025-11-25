import { program } from 'commander';
import pc from 'picocolors';
import { convert } from './commands/convert.js';

const banner = `
   ____  ____        _                          _       _
  / ___|/ ___| _   _| |__  _ __ ___   ___   __| |_   _| | ___
 | |  _\\___ \\| | | | '_ \\| '_ \` _ \\ / _ \\ / _\` | | | | |/ _ \\
 | |_| |___) | |_| | |_) | | | | | | (_) | (_| | |_| | |  __/
  \\____|____/ \\__,_|_.__/|_| |_| |_|\\___/ \\__,_|\\__,_|_|\\___|
`;

console.log(pc.cyan(banner));
console.log(pc.dim('  Convert folders to git submodules\n'));

program
  .name('gsubmodule')
  .description('Convert git folders to submodules with separate repos')
  .version('0.0.1');

program
  .command('convert')
  .description('Convert a folder to a git submodule')
  .option('-f, --folder <path>', 'Folder path to convert')
  .option('-n, --name <name>', 'Repository name')
  .option('-v, --visibility <type>', 'Repository visibility (public/private)', 'private')
  .action(convert);

program.parse();
