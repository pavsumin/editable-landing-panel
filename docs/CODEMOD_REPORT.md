# CLI 0.3.0: local text migration

The installer now offers manual integration or a local TSX codemod. Noninteractive
runs remain manual by default; `--content codemod` explicitly opts into source
migration. `elp migrate` supports an already installed panel. Neither preview nor
application of the codemod needs an AI key or database connection.

The generated configuration contains route/page labels, section labels, unique
field keys, semantic field labels with text excerpts, types, defaults and limits.
Original content is preserved rather than regenerated. The tool rewrites only
supported literals in default-function TSX pages; it reports other work explicitly.
Manual review is required even when the tool migrates all visible text on a page.

Safety and verification:

- Dry-run and commands without --yes produce a plan without changing files.
- JSX defaults preserve whitespace/entities; tests compare server-rendered HTML
  before and after migration. Other attributes/business logic remain in source.
- Dynamic content, callbacks, imported components, unsupported page exports,
  static/edge route constraints and non-static routes are left for manual work.
- Simple client pages get a server wrapper and a preview view. Existing server
  pages use the content reader; unsaved preview needs a manual client boundary.
- Existing config keys/defaults are preserved. Repeating migration does not create
  duplicate fields in already integrated pages.
- Source snapshots and destination paths are checked before writes. Symlinks are
  not followed. Private backup files have a local gitignore. Failed writes roll
  back completed writes, and restore refuses files with subsequent modifications.
- After a failed optional migration, init reports exit 2 and skips optional AI.
  Successful installation remains in place. Migration does not alter database rows.
- Tests cover HTML equivalence, manual-mode preservation, client wrapping, repeat
  runs, restore/newer edits, unsupported syntax/routes and symlinked backups.
- The actual packed CLI is installed into a clean src/app fixture. Server and client
  pages are migrated there, and the project is built without Tailwind/shadcn/allowJs.
  Dependency files are shared from this session, not freshly resolved on every OS.

The interactive selection has also been exercised in a real PTY. README, /docs and
CLI reference include mode selection, review warnings, limits and restore commands.
This is an assisted migration base, not a general-purpose arbitrary React refactor.
No production source was migrated during development; only isolated fixtures.
