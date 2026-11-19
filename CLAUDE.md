# Claude instructions

## Git commits and pull requests

- Commit as the repository owner: `AndrewBogdanovTSS <andrewbogdanov@ukr.net>`. A SessionStart hook in `.claude/settings.json` sets this as the repo-local git identity; if `git config user.email` shows anything else, set it before committing.
- Do NOT add `Co-Authored-By: Claude…` or `Claude-Session: …` trailers (or any other Claude attribution lines) to commit messages.
- Do NOT add "Generated with Claude Code" or Claude session links to pull request descriptions.
