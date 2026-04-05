# chalo
<p align="center">
  <img src="./apps/demo/src/assets/logo.svg" alt="Chalo Logo" width="120" />
</p>

[![npm version](https://img.shields.io/npm/v/@osiloke%2Fchalo.svg?style=flat-square)](https://www.npmjs.com/package/@osiloke/chalo)
[![npm downloads](https://img.shields.io/npm/dm/@osiloke%2Fchalo.svg?style=flat-square)](https://www.npmjs.com/package/@osiloke/chalo)
[![license](https://img.shields.io/npm/l/chalo.svg?style=flat-square)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/chalo?style=flat-square)](https://bundlephobia.com/package/@osiloke/chalo)
[![typescript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?style=flat-square)](https://www.typescriptlang.org/)

> **A modern React component library for building intelligent, action-driven UI experiences.**

Chalo provides a declarative API for creating guided user experiences, interactive walkthroughs, and automated UI workflows. Built with Zustand for state management and Framer Motion for smooth animations.

---

## ✨ Features

- 🎯 **Declarative Missions** - Define multi-step guided experiences with JSON-like configs
- 🔄 **Action Execution Engine** - Automate UI interactions (clicks, form fills, API calls, navigation)
- 🎨 **Smart Components** - Pre-built `SmartDrawer`, `TargetHighlight`, and more
- 💫 **Smooth Animations** - Powered by Framer Motion with zero configuration
- 🧠 **State Management** - Lightweight Zustand store with full TypeScript support
- 🔌 **Extensible Handlers** - Register custom action handlers for any UI interaction
- 📦 **Tree-Shakeable** - Only bundle what you use
- 🌳 **Dual ESM/CJS** - Works with all modern bundlers and legacy setups

---

## 📦 Installation

```bash
# npm
npm install @osiloke/chalo

# yarn
yarn add @osiloke/chalo

# pnpm
pnpm add @osiloke/chalo
```

### Peer Dependencies

Chalo requires the following packages (must be installed in your project):

```json
{
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0",
  "zustand": ">=5.0.0",
  "framer-motion": ">=12.0.0"
}
```

---

## 🚀 Quick Start

### 1. Basic Setup

```tsx
import { useChalo, SmartDrawer, Mission } from 'chalo';

function App() {
  const {
    activeMissionId,
    currentStepId,
    nextStep,
    prevStep,
    completeMission
  } = useChalo();

  return (
    <div>
      {/* Your app content */}
      <SmartDrawer />
    </div>
  );
}
```

### 2. Define a Mission

```tsx
import { Mission, Step, Bubble } from 'chalo';

const onboardingMission: Mission = {
  id: 'app-onboarding',
  title: 'Welcome to the App! 👋',
  description: 'Let us walk you through the main features.',
  steps: [
    {
      id: 'welcome',
      title: 'Getting Started',
      content: 'This is the dashboard. Here you can manage your projects.',
      targetElement: '#dashboard',
      bubbles: [
        {
          id: 'continue-btn',
          type: 'action-group',
          actions: [
            { label: 'Next →', type: 'next' }
          ]
        }
      ]
    },
    {
      id: 'create-project',
      title: 'Create Your First Project',
      content: 'Click the button below to create a new project.',
      targetElement: '#create-btn',
      waitFor: {
        type: 'field_value',
        field: 'projectCreated',
        value: true
      },
      actionSequence: [
        {
          id: 'click-create',
          type: 'click',
          config: { field: 'create-btn' }
        }
      ]
    }
  ],
  allowCompletion: true
};
```

### 3. Register and Start

```tsx
import { useChalo } from 'chalo';
import { useEffect } from 'react';

function App() {
  const { registerMission, startMission } = useChalo();

  useEffect(() => {
    registerMission(onboardingMission);
    startMission('app-onboarding');
  }, [registerMission, startMission]);

  return <YourApp />;
}
```

---

## 📖 API Reference

### Hooks

#### `useChalo(options?)`

Main hook for accessing chalo state and actions.

**Parameters:**
```typescript
interface UseChaloOptions {
  debug?: boolean;  // Enable debug logging (default: false)
}
```

**Returns:**
```typescript
interface ChaloActions {
  // Mission Management
  registerMission: (mission: Mission) => void;
  startMission: (missionId: string) => void;
  pauseMission: () => void;
  resumeMission: () => void;
  completeMission: () => void;
  resetMission: () => void;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepId: string) => void;

  // Field Management
  updateField: (name: string, value: any, status?: FieldStatus) => void;

  // Action Engine
  registerActionHandler: (type: string, handler: ActionHandler) => void;
  executeAction: (action: Action) => Promise<ActionResult>;
  executeActionSequence: (actions: Action[]) => Promise<Record<string, ActionResult>>;
  cancelExecution: () => void;

  // Tours & History
  dismissAllTours: () => void;
  recordTourEntry: (missionId: string, stepId: string, completed: boolean) => void;

  // State
  reset: () => void;
  setError: (error: string | null) => void;
}
```

**Example:**
```tsx
const {
  activeMissionId,
  currentStepId,
  missionProgress,
  fieldValues,
  nextStep,
  prevStep,
  updateField
} = useChalo({ debug: true });
```

---

### Components

#### `<SmartDrawer />`

A context-aware drawer component for displaying mission steps.

```tsx
<SmartDrawer
  position="right"
  width="400px"
  renderBubble={(bubble) => <CustomBubble {...bubble} />}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Drawer position |
| `width` | `string` | `'360px'` | Drawer width |
| `renderBubble` | `(bubble: Bubble) => ReactNode` | - | Custom bubble renderer |
| `onOpen` | `() => void` | - | Open callback |
| `onClose` | `() => void` | - | Close callback |

---

#### `<TargetHighlight />`

Highlights target elements with animated overlays.

```tsx
<TargetHighlight
  selector="#my-element"
  label="Click here to continue"
  pulse
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selector` | `string` | **required** | CSS selector for target |
| `label` | `string` | - | Tooltip text |
| `pulse` | `boolean` | `false` | Enable pulse animation |
| `onClick` | `() => void` | - | Click handler |
| `style` | `CSSProperties` | - | Custom styles |

---

### Core Types

#### `Mission`

Defines a complete guided experience.

```typescript
interface Mission {
  id: string;
  title: string;
  description?: string;
  steps: Step[];
  metadata?: Record<string, unknown>;
  onComplete?: () => void;
  allowCompletion?: boolean;
  actions?: Action[];
}
```

#### `Step`

A single step within a mission.

```typescript
interface Step {
  id: string;
  title: string;
  content: string | ReactNode;
  bubbles?: Bubble[];
  targetField?: string;
  targetElement?: string;
  successCondition?: SuccessCondition;
  waitFor?: SuccessCondition;
  condition?: SuccessCondition;
  navigationRules?: {
    canGoBack?: boolean;
    canSkip?: boolean;
  };
  actions?: StepAction[];
  actionSequence?: Action[];
}
```

#### `Action`

Atomic UI interaction for the execution engine.

```typescript
interface Action {
  id: string;
  type: 'click' | 'scroll' | 'fill_field' | 'api_call' | 'wait' | 'conditional' | 'navigate' | 'custom';
  config: ActionConfig;
  label?: string;
  retry?: RetryConfig;
  rollback?: RollbackConfig;
  dependsOn?: string[];
  condition?: SuccessCondition;
}
```

> 💡 **See the [TypeScript Definitions](packages/chalo/src/types.ts) for complete type documentation.**

---

## 🔧 Advanced Usage

### Custom Action Handlers

Extend the engine with your own action types:

```tsx
import { useChalo, ActionHandler } from 'chalo';

function App() {
  const { registerActionHandler } = useChalo();

  useEffect(() => {
    const showToast: ActionHandler = async (config, context) => {
      const { message, duration } = config;
      toast.show(message, { duration });
      return { success: true };
    };

    registerActionHandler('show_toast', showToast);
  }, [registerActionHandler]);
}
```

### Conditional Steps

Make steps dynamic based on user state:

```tsx
{
  id: 'advanced-feature',
  title: 'Advanced Features',
  content: 'Check out these powerful tools!',
  condition: {
    type: 'custom',
    predicate: (value, formState) => formState.isPremiumUser
  },
  // This step only runs if the user is premium
}
```

### Tour History & Resumption

Chalo automatically tracks tour progress:

```tsx
const { tourHistory, recordTourEntry } = useChalo();

// Check if user completed a tour
if (tourHistory['onboarding']?.completed) {
  // Skip onboarding next time
}
```

---

## 📁 Package Structure

```
packages/chalo/
├── src/
│   ├── components/        # UI components
│   │   ├── SmartDrawer.tsx
│   │   └── TargetHighlight.tsx
│   ├── engine/            # Action execution engines
│   │   ├── action-engine.ts
│   │   └── index.ts
│   ├── hooks/             # React hooks
│   │   └── use-chalo.ts
│   ├── store.ts           # Zustand store
│   ├── types.ts           # TypeScript definitions
│   └── index.ts           # Public API
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🧪 Development

This package is part of a **pnpm monorepo**:

```bash
# Install dependencies
pnpm install

# Build the library
pnpm run build:chalo

# Run tests
pnpm test

# Run tests with UI
pnpm run test:ui

# Lint code
pnpm run lint

# Format code
pnpm run format:fix

# Verify build
./scripts/verify-build.sh
```

---

## 🚢 Publishing

Releases are fully automated via [semantic-release](https://github.com/semantic-release/semantic-release). Every push to `main` is analyzed for conventional commits, and if there are release-worthy changes, a new version is automatically:

1. **Version-bumped** (semver based on commit type)
2. **Changelog-updated**
3. **Published to npm** with provenance
4. **Released on GitHub** with auto-generated notes

### Conventional Commits

Use these commit prefixes to trigger releases:

| Prefix | Example | Effect |
|--------|---------|--------|
| `feat:` | `feat: add TargetHighlight component` | Bumps **minor** version |
| `fix:` | `fix: resolve drawer positioning bug` | Bumps **patch** version |
| `BREAKING CHANGE:` in body | `feat: redesign API\n\nBREAKING CHANGE: ...` | Bumps **major** version |
| `docs:`, `chore:`, `ci:` | `docs: update README` | No release |

### Manual Release (Local)

```bash
npx semantic-release --dry-run
```

> 📖 See [GitHub Actions Workflow](.github/workflows/release.yml) for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Run tests** (`pnpm test`)
5. **Lint & format** (`pnpm run lint && pnpm run format:fix`)
6. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/)
7. **Push** and **open a PR**

### Development Guidelines

- Use TypeScript strictly (no `any` unless absolutely necessary)
- Follow existing code style (enforced by ESLint + Prettier)
- Write tests for new features
- Update documentation for API changes

---

## 📝 Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backwards compatible)
- **PATCH** - Bug fixes

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

## 🐛 Known Issues & Limitations

| Issue | Workaround | Status |
|-------|-----------|--------|
| SSR not yet supported | Use dynamic imports with `ssr: false` | 🚧 Planned |
| React 17 compatibility | Use React 18+ | ⚠️ Won't Fix |

> Found a bug? [Open an issue](https://github.com/osiloke/chalo/issues)!

---

## 📄 License

[MIT](LICENSE) © Osiloke Harold Emoekpere

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/) - UI library
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

<div align="center">
  <strong>chalo</strong> — Making UIs smarter, one step at a time. 🚀
</div>
