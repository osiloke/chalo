# Chalo Monorepo

A modern React component library with intelligent UI interactions and guided experiences.

## Structure

```
chalo/
├── packages/
│   └── chalo/          # Publishable npm package
├── apps/
│   └── demo/           # Demo application
└── scripts/            # Automation scripts
```

## Quick Start

```bash
# Install dependencies
npm install

# Run demo app (development)
npm run dev

# Build the library
npm run build:chalo

# Build everything
npm run build
```

## Available Scripts

- `npm run dev` - Start demo app in development mode
- `npm run build:chalo` - Build the chalo library
- `npm run build:demo` - Build the demo app
- `npm run build` - Build both library and demo
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format:fix` - Format code with Prettier

## Publishing

See [packages/chalo/README.md](packages/chalo/README.md) for publishing instructions.

## License

MIT
