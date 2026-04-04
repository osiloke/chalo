# chalo

> A modern React component library for intelligent UI interactions and guided experiences.

## Installation

```bash
npm install chalo
# or
yarn add chalo
# or
pnpm add chalo
```

## Requirements

- **React** >= 18.0.0
- **React DOM** >= 18.0.0
- **Zustand** >= 5.0.0
- **Framer Motion** >= 12.0.0

## Quick Start

```tsx
import { useChalo, SmartDrawer, TargetHighlight } from 'chalo'

function App() {
  const { state, dispatch } = useChalo()
  
  return (
    <div>
      <SmartDrawer open={isOpen} onClose={() => setOpen(false)}>
        {/* Drawer content */}
      </SmartDrawer>
      <TargetHighlight target="#my-element">
        {/* Highlighted content */}
      </TargetHighlight>
    </div>
  )
}
```

## API Reference

### Hooks

#### `useChalo()`

Main hook for managing chalo state.

```tsx
const { state, dispatch, actions } = useChalo()
```

**Returns:**
- `state` - Current chalo state
- `dispatch` - Dispatch function for actions
- `actions` - Helper actions for common operations

### Components

#### `<SmartDrawer />`

A smart drawer component with intelligent positioning.

```tsx
<SmartDrawer open={isOpen} onClose={() => setOpen(false)}>
  Drawer content
</SmartDrawer>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controls open state |
| `onClose` | `() => void` | - | Close callback |
| `position` | `'left' \| 'right'` | `'right'` | Drawer position |

#### `<TargetHighlight />`

Highlights target elements on the page.

```tsx
<TargetHighlight target="#element-id">
  Content to highlight
</TargetHighlight>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `string` | - | CSS selector for target |
| `onHighlight` | `() => void` | - | Highlight callback |

### Types

```typescript
interface ChaloState {
  // State structure
}

type ChaloAction = 
  | { type: 'ACTION_ONE'; payload: any }
  | { type: 'ACTION_TWO'; payload: any }
```

## Development

This is a monorepo with the following structure:
- `packages/chalo` - The publishable library
- `apps/demo` - Demo application using the library

```bash
# Install dependencies
npm install

# Build the library
npm run build:chalo

# Run the demo app
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format:fix
```

## Publishing

To setup OIDC-based publishing (no API tokens needed!):

```bash
./scripts/setup-npm-oidc.sh
```

This will guide you through configuring Trusted Publishing with npm.

### Manual First Publish

The first publish must be done manually:

```bash
cd packages/chalo
npm publish --provenance --access public
```

After that, all future releases via GitHub Releases will auto-publish automatically.

## CI/CD

The repository uses GitHub Actions with OIDC Trusted Publishing:
- **CI Workflow**: Runs tests, linting, and builds on every PR
- **Publish Workflow**: Auto-publishes to npm when a GitHub Release is created

## License

MIT © [Your Name](https://github.com/yourusername)
