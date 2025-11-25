# gsubmodule

Convert folders to git submodules with separate repos.

## Install

```bash
npm install -g gsubmodule
```

## Usage

```bash
# Interactive mode
gsubmodule convert

# With options
gsubmodule convert --folder packages/studio --name studio --visibility private

# Short alias
gsub convert -f packages/studio -n studio -v private
```

## Commands

### `convert`

Convert a folder to a git submodule.

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --folder <path>` | Folder path to convert | (interactive) |
| `-n, --name <name>` | Repository name | folder basename |
| `-v, --visibility <type>` | Repository visibility (`public`/`private`) | `private` |

## Requirements

- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- Git repository initialized in current directory

## How it works

1. Creates a temporary repository from the folder contents
2. Creates a new GitHub repository
3. Removes the folder from the main repo
4. Adds it back as a git submodule
5. Cleans up temporary files

## License

MIT
