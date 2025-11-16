# CLAUDE.md - AI Assistant Guide for Nexrender

> **Last Updated**: 2025-11-16
> **Repository**: nexrender
> **Version**: 1.62.10
> **Purpose**: Guide for AI assistants working with the nexrender codebase

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Setup](#development-setup)
4. [Key Concepts](#key-concepts)
5. [Code Conventions](#code-conventions)
6. [Working with the Codebase](#working-with-the-codebase)
7. [Testing](#testing)
8. [Common Tasks](#common-tasks)
9. [Critical Patterns](#critical-patterns)
10. [Pitfalls & Gotchas](#pitfalls--gotchas)
11. [File Locations Reference](#file-locations-reference)

---

## Project Overview

### What is Nexrender?

Nexrender is an automation tool for Adobe After Effects rendering workflows. It enables:
- Data-driven, template-based video generation
- Network rendering with server/worker architecture
- Plugin-based extensibility for actions and protocols
- Programmatic and CLI-based rendering

### Core Philosophy

- **Do one thing well**: Focus on automating After Effects rendering
- **Minimal dependencies**: Keep packages lightweight
- **Pure Node.js**: No native modules, cross-platform compatibility
- **Modular architecture**: Extensive plugin support
- **Idiomatic Node.js**: Small modules, promise-based async

### Technology Stack

- **Language**: JavaScript (ES2021, CommonJS)
- **Runtime**: Node.js (target: v18 for binaries)
- **Monorepo Tool**: Lerna 3.21.0
- **HTTP Framework**: micro (~9.3.3)
- **Testing**: Mocha + Chai + testdouble
- **Linting**: ESLint (recommended configuration)
- **Binary Packaging**: pkg 5.8.1

---

## Architecture

### Monorepo Structure

```
nexrender/
├── packages/                  # All packages (Lerna managed)
│   ├── nexrender-core/       # Main rendering engine
│   ├── nexrender-types/      # Job validation and types
│   ├── nexrender-api/        # HTTP client
│   ├── nexrender-server/     # Job queue server
│   ├── nexrender-cli/        # CLI tool
│   ├── nexrender-worker/     # Worker node
│   ├── nexrender-action-*/   # Post-processing actions (13 packages)
│   ├── nexrender-provider-*/ # Protocol handlers (5 packages)
│   └── nexrender-database-*/ # Database integrations (1 package)
├── misc/                      # Utility scripts
├── lerna.json                 # Lerna configuration
├── package.json               # Root package (dev dependencies)
├── .eslintrc.js              # ESLint configuration
├── .mocharc.cjs              # Mocha test configuration
└── README.md                  # User documentation
```

### Package Categories

#### Core Packages (4)

1. **@nexrender/core** - Main rendering engine
   - Entry: `init()`, `render()`
   - Orchestrates entire pipeline
   - Location: `packages/nexrender-core/`

2. **@nexrender/types** - Job schema and validation
   - Entry: `create()`, `validate()`
   - Job structure definitions
   - Location: `packages/nexrender-types/`

3. **@nexrender/api** - HTTP client
   - REST API wrapper
   - Used by workers
   - Location: `packages/nexrender-api/`

4. **@nexrender/server** - Job queue HTTP server
   - Routes: `/api/v1/jobs/*`
   - In-memory or Redis-backed queue
   - Location: `packages/nexrender-server/`

#### CLI Tools (3)

- **@nexrender/cli** - Local standalone rendering
- **@nexrender/worker** - Network worker node
- **@nexrender/server** - Server binary

#### Actions (13)

Post-processing plugins executed at different pipeline stages:
- `action-cache`, `action-compress`, `action-copy`, `action-decompress`
- `action-encode`, `action-fonts`, `action-image`, `action-link`
- `action-lottie`, `action-mogrt`, `action-upload`, `action-webhook`

#### Providers (5)

Protocol handlers for asset sources:
- `provider-ftp` (ftp://)
- `provider-gs` (gs://)
- `provider-nx` (nx://)
- `provider-s3` (s3://)
- `provider-sftp` (sftp://)

Built-in protocols: `file://`, `http://`, `https://`, `data://`

### Dependency Flow

```
nexrender-cli ──→ nexrender-core ──→ nexrender-types
                        ↓
                  Plugin System (actions, providers)

nexrender-worker ──→ nexrender-core + nexrender-api

nexrender-server ──→ nexrender-types + database-redis (optional)
```

### Plugin System Architecture

**Dynamic Loading Pattern:**
```javascript
// Actions loaded via requireg (global require)
const action = requireg(action.module)

// Or from pre-loaded settings.actions
const action = settings.actions[action.module]

// Providers loaded by protocol
const provider = requireg('@nexrender/provider-' + protocol)
```

**Why this matters:**
- Allows external npm packages as plugins
- No core modification needed for extensions
- Works with local paths for development
- Binary packaging requires explicit requires

---

## Development Setup

### Initial Setup

```bash
# Clone repository
git clone https://github.com/inlife/nexrender.git
cd nexrender

# Install root dependencies (lerna, eslint, mocha, etc.)
npm install

# Bootstrap all packages (link dependencies)
npm start   # Runs: lerna bootstrap --no-ci -- --no-package-lock
```

**What happens during bootstrap:**
1. Lerna installs dependencies for each package
2. Inter-package dependencies are symlinked
3. No package-lock.json files created (by design)

### Working on a Specific Package

```bash
cd packages/nexrender-core
npm test            # Run tests for this package
npm start           # Package-specific start script (if defined)
```

### Building Binaries

```bash
# Build all binaries
npm run pkg         # Runs prelink → cli → server → worker → rename

# Build specific binary
npm run pkg-cli
npm run pkg-worker
npm run pkg-server

# Output: bin/ directory (gitignored)
```

**Binary Targets:**
- node18-macos-x64
- node18-linux-x64 (server only)
- node18-win-x64

### Environment Variables

- `NEXRENDER_REQUIRE_PLUGINS=1` - Required for pkg to bundle plugins

---

## Key Concepts

### Job Structure

A job is the fundamental unit of work in nexrender:

```javascript
{
  "template": {
    "src": "file:///path/to/project.aep",
    "composition": "main",
    "outputModule": "H.264 - Match Render Settings - 15 Mbps",  // Required for AE 2023+
    "outputExt": "mp4",
    "settingsTemplate": "Best Settings",
    "frameStart": 0,
    "frameEnd": 100
  },
  "assets": [
    // Footage, data, script, or static assets
  ],
  "actions": {
    "predownload": [],
    "postdownload": [],
    "prerender": [],
    "postrender": []
  },
  "tags": "primary,plugins",  // Comma-delimited
  "priority": 0
}
```

### Asset Types

#### 1. Footage Assets (`image`, `audio`, `video`)

Replaces After Effects footage items:

```javascript
{
  "src": "https://example.com/image.jpg",
  "type": "image",
  "layerName": "background.jpg",      // OR layerIndex: 1
  "composition": "main",               // Optional, defaults to "*"
  "name": "custom-name.jpg",           // Optional
  "extension": "jpg",                  // Optional
  "useOriginal": false,                // file:// only, use original path
  "sequence": false,                   // Image sequence support
  "removeOld": false                   // Remove old footage item
}
```

#### 2. Data Assets

Modifies layer properties dynamically:

```javascript
{
  "type": "data",
  "layerName": "Text Layer",
  "property": "Source Text",           // Or "Position", "Scale", etc.
  "value": "Hello World",              // Static value
  "expression": "time > 100 ? 'A' : 'B'",  // Dynamic expression
  "composition": "main",
  "continueOnMissing": false
}
```

**Deep Properties:**
- Use `.` separator: `"Effects.Blur.Amount"`
- Use `->` if property name contains `.`: `"Effects->Skin.Color->Color"`

#### 3. Script Assets

Custom JSX scripts with parameter injection:

```javascript
{
  "src": "https://example.com/script.jsx",
  "type": "script",
  "keyword": "NX",                     // Default: "NX", configurable
  "parameters": [
    {
      "key": "userName",
      "value": "John Doe"              // string, number, array, object, null, or function
    },
    {
      "key": "calculate",
      "value": "function(a, b) { return a + b; }"
    }
  ]
}
```

**In JSX:**
```jsx
var name = NX.get("userName");        // "John Doe"
var sum = NX.call("calculate", [5, 3]); // 8
```

#### 4. Static Assets

Plain file downloads (no processing):

```javascript
{
  "src": "https://example.com/data.json",
  "type": "static",
  "name": "custom-data.json"           // Optional
}
```

### Action Types

Actions run at different pipeline stages:

1. **predownload** - Before assets are downloaded (can modify job)
2. **postdownload** - After assets downloaded, before render
3. **prerender** - Right before After Effects execution
4. **postrender** - After rendering completes (encoding, upload, etc.)

**Action Signature:**
```javascript
module.exports = (job, settings, action, type) => {
  // type = 'predownload' | 'postdownload' | 'prerender' | 'postrender'

  // Process the action
  // Can modify job object (mutable)

  return Promise.resolve(job);  // Must return Promise<job>
}
```

### Rendering Pipeline

```
1. init(settings)          - Initialize environment
2. create(job)             - Validate job
3. setup                   - Create workpath directory
4. predownload actions     - Modify job before download
5. download                - Fetch template + assets
6. postdownload actions    - Process downloaded assets
7. prerender actions       - Final preparations
8. script                  - Generate JSX injection script
9. dorender                - Execute aerender binary
10. postrender actions     - Encode, upload, notify
11. cleanup                - Remove temp files (unless skipCleanup)
```

### Job States

```
created → queued → picked → started
  ↓
render:setup → render:predownload → render:download → render:postdownload
  ↓
render:prerender → render:script → render:dorender → render:postrender
  ↓
render:cleanup → finished (or error)
```

---

## Code Conventions

### Style Guide

**ESLint Configuration:**
- Base: `eslint:recommended`
- Env: Node.js, ES2021, CommonJS, Mocha
- Line endings: Unix (LF)
- Indentation: 4 spaces
- Quotes: Not enforced (flexible)
- Semicolons: Not enforced (flexible)
- Functions: Declarations preferred, arrows allowed

**EditorConfig:**
```ini
[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
insert_final_newline = true
```

### Module System

**Always use CommonJS:**
```javascript
// Good
const { render } = require('@nexrender/core');
module.exports = { init, render };

// Bad (ES modules not used)
import { render } from '@nexrender/core';
export { init, render };
```

### Error Handling

**Promise-based with descriptive errors:**
```javascript
// Good
return doSomething()
  .catch(err => {
    throw new Error(`[${job.uid}] Failed to process: ${err.message}`);
  });

// Include context in errors
if (!asset.src) {
  throw new Error(`[${job.uid}] Asset missing required 'src' field`);
}
```

### Logging

**Always use settings.logger:**
```javascript
// Good
settings.logger.log(`[${job.uid}] Starting download...`);

// Bad
console.log('Starting download');  // Bypasses user configuration
```

### Path Handling

**Cross-platform compatibility:**
```javascript
const path = require('path');

// Good
const filePath = path.join(workpath, 'assets', 'image.jpg');

// Bad
const filePath = workpath + '/assets/image.jpg';  // Unix-only
```

### Naming Conventions

- **Packages**: `kebab-case` with scope (`@nexrender/action-copy`)
- **Files**: `kebab-case` (`jobs-create.js`, `asset-download.js`)
- **Functions**: `camelCase` (`downloadAssets`, `renderJob`)
- **Classes**: `PascalCase` (rare, prefer functional)
- **Constants**: `UPPER_SNAKE_CASE` (`MAX_TIMEOUT`, `DEFAULT_PORT`)

### Function Patterns

**Task Pattern:**
```javascript
module.exports = (job, settings) => {
  settings.logger.log(`[${job.uid}] task starting...`);

  // Perform task

  return Promise.resolve(job);
};
```

**Provider Pattern:**
```javascript
module.exports = {
  download: async (job, settings, src, dest, params) => {
    // Download from protocol://
    return dest;
  },

  upload: async (job, settings, src, params, onProgress, onComplete) => {
    // Upload to protocol://
    onProgress(bytesUploaded, totalBytes);
    onComplete();
  }
};
```

**Action Pattern:**
```javascript
module.exports = (job, settings, action, type) => {
  if (type !== 'postrender') {
    throw new Error(`Action only supports postrender`);
  }

  const { input, output } = action;

  // Process action

  return Promise.resolve(job);
};
```

---

## Working with the Codebase

### Adding a New Action

1. **Create package directory:**
   ```bash
   mkdir packages/nexrender-action-myaction
   cd packages/nexrender-action-myaction
   ```

2. **Create package.json:**
   ```json
   {
     "name": "@nexrender/action-myaction",
     "version": "1.0.0",
     "main": "index.js",
     "dependencies": {}
   }
   ```

3. **Create index.js:**
   ```javascript
   module.exports = (job, settings, action, type) => {
     settings.logger.log(`[${job.uid}] running myaction`);

     // Your logic here

     return Promise.resolve(job);
   };
   ```

4. **Add to root package.json for pkg:**
   ```javascript
   // In packages/nexrender-cli/package.json or similar
   require('@nexrender/action-myaction');
   ```

5. **Test:**
   ```bash
   cd packages/nexrender-action-myaction
   npm test
   ```

### Adding a New Provider

1. **Create package:**
   ```bash
   mkdir packages/nexrender-provider-myprotocol
   ```

2. **Implement download/upload:**
   ```javascript
   module.exports = {
     download: async (job, settings, src, dest, params) => {
       const uri = new URL(src);
       // Download from myprotocol://
       return dest;
     },

     upload: async (job, settings, src, params, onProgress, onComplete) => {
       // Upload to myprotocol://
       onComplete();
     }
   };
   ```

3. **Register in core** (`packages/nexrender-core/src/helpers/download.js`):
   ```javascript
   // Auto-loaded by protocol name
   // myprotocol:// → require('@nexrender/provider-myprotocol')
   ```

### Modifying Core Rendering

**Core task files:**
- `packages/nexrender-core/src/tasks/`
  - `setup.js` - Workpath creation
  - `download.js` - Asset fetching
  - `script.js` - JSX generation
  - `render.js` - aerender execution
  - `actions.js` - Action execution
  - `cleanup.js` - Temp file removal

**To add a task:**
1. Create `packages/nexrender-core/src/tasks/mytask.js`
2. Export function: `module.exports = (job, settings) => Promise`
3. Import in `packages/nexrender-core/src/index.js`
4. Add to rendering chain

### Modifying Job Schema

**Location:** `packages/nexrender-types/job.js`

```javascript
const create = (job = {}) => {
  // Validate and set defaults
  return Object.assign({
    uid: nanoid(),
    state: 'created',
    // ... defaults
  }, job);
};

module.exports = { create, validate };
```

### Working with JSX Scripts

**Location:** `packages/nexrender-core/src/assets/`

**Main scripts:**
- `nexrender.jsx` - Core utilities (selectors, replace, evaluate)
- `wrap-footage.js` - Wraps footage replacement
- `wrap-data.js` - Wraps property changes
- `wrap-enhanced-script.js` - Wraps custom scripts with parameters

**Testing JSX:**
1. Generate script: `npm test` in nexrender-core
2. Manual test: Open After Effects → File → Scripts → Run Script File
3. Automated: Use `render()` with `skipRender: true` to see generated script

---

## Testing

### Running Tests

```bash
# All packages
npm test              # Runs eslint + mocha

# Specific package
cd packages/nexrender-core
npm test

# Watch mode
mocha --watch

# Specific file
mocha packages/nexrender-core/test/render.test.js
```

### Test Configuration

**File:** `.mocharc.cjs`

```javascript
module.exports = {
  spec: [
    'packages/*/src/**/*.spec.js',
    'packages/*/test/*.test.js'
  ],
  timeout: 10000,
  jobs: 3,              // Parallel execution
  checkLeaks: true,
  bail: true            // Stop on first failure
};
```

### Writing Tests

**Pattern:**
```javascript
const { describe, it, afterEach } = require('mocha');
const { expect } = require('chai');
const td = require('testdouble');

describe('module-name', () => {
  afterEach(() => td.reset());

  it('should do something', async () => {
    const result = await myFunction();
    expect(result).to.equal('expected');
  });

  it('should handle errors', async () => {
    try {
      await myFunction(badInput);
      throw new Error('Should have thrown');
    } catch (err) {
      expect(err.message).to.include('expected error');
    }
  });
});
```

### Test Doubles

**Mocking with testdouble:**
```javascript
const fs = td.replace('fs');
td.when(fs.readFile('path')).thenResolve('content');

const module = require('../src/module');
const result = await module.read('path');
expect(result).to.equal('content');
```

### Coverage

**Not currently configured**, but can add:
```bash
npm install --save-dev nyc
# Add to package.json: "test": "nyc mocha"
```

---

## Common Tasks

### Adding Dependencies

**To a specific package:**
```bash
cd packages/nexrender-action-myaction
npm install --save some-package

# Or from root (using lerna)
lerna add some-package --scope=@nexrender/action-myaction
```

**To all packages:**
```bash
lerna add some-package
```

### Publishing

```bash
# Interactive publish (asks for version)
npm run publish

# Force public access
npm run public-publish
```

### Cleaning Node Modules

```bash
# Clean all package node_modules
npm run purge-cache

# Clean root node_modules
npm run purge-master

# Full clean
npm run purge-cache && npm run purge-master && npm install && npm start
```

### Linting

```bash
# Lint all files
npm run lint

# Lint with fix
npx eslint . --fix
```

### Debugging

**Enable debug logging:**
```javascript
const { render } = require('@nexrender/core');

await render(job, {
  debug: true,           // Verbose logging
  skipCleanup: true,     // Preserve temp files
  logger: console        // Custom logger
});
```

**Inspect generated JSX:**
```bash
# Set skipCleanup and check workpath
cat /tmp/nexrender-*/nexrender-*-script.jsx
```

**Aerender debugging:**
```bash
# Run aerender manually
/Applications/Adobe\ After\ Effects\ 2023/aerender \
  -project /path/to/project.aep \
  -comp "main" \
  -output /path/to/output.mov \
  -s /path/to/script.jsx
```

---

## Critical Patterns

### State Management

**Wrapper pattern for task execution:**
```javascript
const state = (job, settings, task, taskName) => {
  job.state = `render:${taskName}`;

  if (job.onChange) {
    job.onChange(job, job.state);
  }

  settings.logger.log(`[${job.uid}] ${taskName} state...`);

  return task(job, settings).then(result => {
    settings.logger.log(`[${job.uid}] ${taskName} finished`);
    return result;
  });
};

// Usage
await state(job, settings, downloadTask, 'download');
```

### Sequential Promise Execution

**PromiseSerial pattern:**
```javascript
const serial = tasks => {
  return tasks.reduce((promise, task) => {
    return promise.then(result => task(result));
  }, Promise.resolve(initialValue));
};

// Used for actions
await serial(actions.map(action =>
  job => runAction(job, settings, action, 'postrender')
));
```

### URI Protocol Handling

```javascript
const uri = new URL(src);
const protocol = uri.protocol.slice(0, -1);  // Remove trailing ':'

// Built-in protocols
if (['http', 'https', 'file', 'data'].includes(protocol)) {
  return builtInHandler(uri);
}

// External providers
const provider = requireg(`@nexrender/provider-${protocol}`);
return provider.download(job, settings, src, dest, params);
```

### Dynamic Parameter Injection

**Enhanced script pattern:**
```javascript
// Generate parameter object
const NX = {
  get: (key) => parameters[key],
  call: (key, args) => parameters[key](...args),
  arg: (key) => arguments[key]
};

// Inject before user script
const script = `
var ${keyword} = ${JSON.stringify(NX)};
${userScript}
`;
```

### HTTP Caching

```javascript
const makeFetchHappen = require('make-fetch-happen');

const fetch = makeFetchHappen.defaults({
  cachePath: settings.cache === true
    ? path.join(settings.workpath, 'http-cache')
    : settings.cache || null,
  retry: 3
});

// Per-asset override
const response = await fetch(src, asset.params);
```

### After Effects Binary Detection

```javascript
const findAe = require('./helpers/find-ae');

const binary = settings.binary || findAe();

if (!binary) {
  throw new Error('After Effects binary not found. Specify with --binary');
}
```

### WSL Path Translation

```javascript
const isWsl = require('is-wsl');

if (isWsl && settings.wslMap) {
  // Linux path: /home/user/project
  // Windows path: Z:\home\user\project
  const windowsPath = settings.wslMap + ':\\' +
    linuxPath.replace(/\//g, '\\');
}
```

---

## Pitfalls & Gotchas

### 1. Lerna Bootstrap Without package-lock.json

**Problem:** Lerna configured with `--no-package-lock`

**Why:** Keeps packages lightweight, avoids lock file conflicts

**Impact:**
- Don't commit `package-lock.json` in package directories
- Root `package-lock.json` is OK (gitignored in packages/)
- Dependency versions may vary between installs

**Solution:** Pin critical dependencies in package.json

### 2. requireg vs require

**Problem:** Plugins loaded with `requireg` (global require)

**Why:** Allows globally installed npm packages as plugins

**Impact:**
- Local development: Use relative/absolute paths
- Global install: `npm i -g @nexrender/action-myplugin`
- Binary packaging: Must explicitly require in pkg config

**Example:**
```javascript
// Works in development and production
const action = requireg('@nexrender/action-copy');

// Only works if installed globally
const action = requireg('my-custom-action');
```

### 3. After Effects 2023+ Requires Output Module

**Problem:** AE 2023 won't render without explicit output module

**Why:** Breaking change in AE 2023 aerender binary

**Impact:** Jobs fail silently or error with "No output module"

**Solution:**
```javascript
{
  "template": {
    "outputModule": "H.264 - Match Render Settings - 15 Mbps",
    "outputExt": "mp4"
  }
}
```

### 4. Asset layerName Must Include Extension

**Problem:** Footage replacement fails if extension missing

**Why:** After Effects matches by exact footage item name

**Example:**
```javascript
// Bad
{ "layerName": "background", "type": "image" }

// Good
{ "layerName": "background.jpg", "type": "image" }
```

### 5. Actions Execute Sequentially

**Problem:** Order matters for actions

**Why:** Each action receives result of previous action

**Impact:**
```javascript
// Bad - upload happens before encode finishes
{
  "postrender": [
    { "module": "@nexrender/action-upload", "input": "output.mp4" },
    { "module": "@nexrender/action-encode", "output": "output.mp4" }
  ]
}

// Good
{
  "postrender": [
    { "module": "@nexrender/action-encode", "output": "output.mp4" },
    { "module": "@nexrender/action-upload", "input": "output.mp4" }
  ]
}
```

### 6. Job Object is Mutable

**Problem:** Actions can modify job, affecting subsequent actions

**Why:** Design choice for state sharing

**Impact:**
- Actions can add properties to job
- Can modify assets, actions, template
- Changes persist through pipeline

**Best Practice:** Document mutations, use cautiously

### 7. WSL Requires wslMap

**Problem:** Rendering fails on WSL without `wslMap` setting

**Why:** After Effects is Windows binary, needs Windows paths

**Solution:**
```javascript
await render(job, {
  wslMap: 'Z',  // Drive letter where Linux FS is mapped
  workpath: '/mnt/d/nexrender-temp'  // Use Windows drive
});
```

### 8. Cleanup Happens by Default

**Problem:** Rendered files disappear after job completion

**Why:** Default behavior to save disk space

**Solution:**
```javascript
await render(job, {
  skipCleanup: true  // Preserve temp folder
});
```

### 9. Binary Auto-Detection Can Fail

**Problem:** After Effects not found on custom installations

**Why:** Detection searches common paths only

**Solution:**
```javascript
await render(job, {
  binary: '/custom/path/to/aerender'
});
```

### 10. Analytics Enabled by Default

**Problem:** Telemetry data sent unless opted out

**Why:** Helps developers understand usage patterns

**What's Collected:**
- Anonymized job execution stats
- System info (OS, CPU, memory)
- Configuration options (yes/no, not values)

**What's NOT Collected:**
- Personal information
- Project names, asset URLs
- Credentials, scripts, expressions

**Solution:**
```javascript
await render(job, {
  noAnalytics: true
});
```

### 11. Expression Errors Break Rendering

**Problem:** Invalid expressions cause aerender to fail

**Why:** Evaluated by After Effects, no pre-validation

**Example:**
```javascript
// Bad - syntax error
{ "expression": "time > 100 ?" }  // Missing ternary branches

// Good
{ "expression": "time > 100 ? 'A' : 'B'" }
```

### 12. Script Parameters Are Not Sanitized

**Problem:** Malicious parameters can execute arbitrary code

**Why:** Direct injection into JSX context

**Security:**
- Validate inputs before creating jobs
- Don't accept user input directly into parameters
- Especially dangerous with function parameters

---

## File Locations Reference

### Core Logic
```
packages/nexrender-core/
├── src/
│   ├── index.js                 # Main exports: init, render
│   ├── helpers/
│   │   ├── download.js          # Asset downloading
│   │   ├── find-ae.js           # AE binary detection
│   │   ├── patch.js             # AE CLI patching
│   │   ├── protocol.js          # URI parsing
│   │   └── state.js             # State management wrapper
│   ├── tasks/
│   │   ├── setup.js             # Workpath creation
│   │   ├── download.js          # Template + asset download
│   │   ├── script.js            # JSX generation
│   │   ├── render.js            # aerender execution
│   │   ├── actions.js           # Action execution
│   │   └── cleanup.js           # Temp file removal
│   └── assets/
│       ├── nexrender.jsx        # Core JSX utilities
│       ├── wrap-footage.js      # Footage replacement wrapper
│       ├── wrap-data.js         # Property change wrapper
│       └── wrap-enhanced-script.js  # Custom script wrapper
```

### Job Schema
```
packages/nexrender-types/
└── job.js                       # create(), validate()
```

### Server Routes
```
packages/nexrender-server/
└── src/
    └── routes/
        ├── jobs-create.js       # POST /api/v1/jobs
        ├── jobs-fetch.js        # GET /api/v1/jobs/:uid
        ├── jobs-pickup.js       # GET /api/v1/jobs/pickup
        ├── jobs-update.js       # PUT /api/v1/jobs/:uid
        ├── jobs-remove.js       # DELETE /api/v1/jobs/:uid
        └── jobs-list.js         # GET /api/v1/jobs
```

### CLI Tools
```
packages/nexrender-cli/
└── bin/
    └── nexrender-cli.js         # CLI entry point

packages/nexrender-worker/
└── bin/
    └── nexrender-worker.js      # Worker entry point
```

### Actions (Example)
```
packages/nexrender-action-encode/
└── index.js                     # module.exports = (job, settings, action, type) => {}
```

### Providers (Example)
```
packages/nexrender-provider-s3/
└── index.js                     # module.exports = { download, upload }
```

### Configuration Files
```
.eslintrc.js                     # ESLint rules
.mocharc.cjs                     # Mocha test config
.editorconfig                    # Editor settings
lerna.json                       # Lerna config
package.json                     # Root package (dev deps)
```

---

## Resources

### Documentation
- **Main README**: `/README.md` - User-facing documentation
- **Package READMEs**: Each package has its own README
- **Examples**: Check README for job examples

### External Links
- **Repository**: https://github.com/inlife/nexrender
- **Issues**: https://github.com/inlife/nexrender/issues
- **Releases**: https://github.com/inlife/nexrender/releases
- **Discord**: https://discord.gg/S2JtRcB
- **Website**: https://www.nexrender.com

### Related Projects
- **Adobe After Effects Scripting Guide**: Essential for JSX development
- **aerender Documentation**: https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html

### Community Packages
See README.md section "Awesome External Packages" for community plugins

---

## Quick Reference

### Common Commands

```bash
# Setup
npm install && npm start

# Test
npm test                         # All packages
cd packages/XXX && npm test      # Specific package

# Lint
npm run lint
npx eslint . --fix

# Build binaries
npm run pkg

# Clean
npm run purge-cache && npm run purge-master

# Publish
npm run publish
```

### Job Template

```json
{
  "template": {
    "src": "file:///path/to/project.aep",
    "composition": "main",
    "outputModule": "H.264",
    "outputExt": "mp4"
  },
  "assets": [
    {
      "src": "https://example.com/image.jpg",
      "type": "image",
      "layerName": "background.jpg"
    },
    {
      "type": "data",
      "layerName": "Text",
      "property": "Source Text",
      "value": "Hello"
    },
    {
      "src": "https://example.com/script.jsx",
      "type": "script"
    }
  ],
  "actions": {
    "postrender": [
      {
        "module": "@nexrender/action-encode",
        "preset": "mp4",
        "output": "output.mp4"
      },
      {
        "module": "@nexrender/action-copy",
        "input": "output.mp4",
        "output": "/final/output.mp4"
      }
    ]
  }
}
```

### Rendering Programmatically

```javascript
const { render } = require('@nexrender/core');

const job = {
  template: {
    src: 'file:///path/to/project.aep',
    composition: 'main'
  }
};

const settings = {
  workpath: '/tmp/nexrender',
  debug: true,
  skipCleanup: true,
  logger: console
};

render(job, settings)
  .then(result => console.log('Done:', result))
  .catch(err => console.error('Error:', err));
```

---

## For AI Assistants

### When Writing Code

1. **Always return Promise** from tasks/actions
2. **Always include job.uid** in log messages
3. **Always use settings.logger.log()** not console
4. **Always use path.join()** for paths
5. **Always validate required fields** before using
6. **Always handle errors** with descriptive messages

### When Debugging

1. **Check job.uid exists** - Required for logging
2. **Check asset.type** - Determines processing
3. **Check protocol is lowercase** - URI parsing
4. **Check After Effects version** - AE 2023+ needs outputModule
5. **Check workpath exists** - Created in setup task
6. **Check binary path** - Auto-detection can fail

### When Modifying

1. **Test in specific package first** - Don't break others
2. **Update tests** - Match behavior changes
3. **Run lint** - Before committing
4. **Check all packages** - For cross-package changes
5. **Update README** - If user-facing changes
6. **Update CLAUDE.md** - If architecture changes

### Common Mistakes to Avoid

- Using console.log instead of settings.logger.log
- Forgetting to return Promise from task/action
- Not including job.uid in error messages
- Using Windows-specific paths (use path.join)
- Mutating job without documenting it
- Adding dependencies without checking size/complexity
- Not testing on target platforms (Windows, macOS, Linux)

---

**End of CLAUDE.md**

> This document is maintained as a living guide. When making significant changes to the codebase, update this file to reflect the current state of the project.
