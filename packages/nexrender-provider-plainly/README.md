# Provider: Plainly

Plainly provider allows caching and syncing local project structure with remote one.

NOTE: We only support `gs` provider!

## Job Details

- `src` represents path to the project file (AEP, AEPX) on google cloud storage, with `plainly:` protocol prefix

    e.g. `plainly://my_bucket/project1/project.aep`

- project **directory** is downloaded to cache location (by default it is `~/.plainly`):

    e.g. `~/.plainly/my_bucket/project1/*`

## Environment Variables

Take a look at example [.env](../../.vscode/.env.example) file.

## Footage

`nexrender` clone and modify project file at temporary location, which causes `aerender` render to fail because of missing footage. To overcome this issue, plainly provider creates a symlink of a `(Footage)` directory at the temporary location.
