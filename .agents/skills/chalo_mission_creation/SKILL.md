---
name: chalo_mission_creation
description: A comprehensive guide on how to create Missions in the Chalo framework, utilizing the action engine, conditions, and deeply linking with the UI.
---

# Creating Missions in Chalo: Advanced Guide

This guide describes the complete process of defining a `Mission` in Chalo. It goes beyond basic setup to detail the sophisticated ways you can guide users, automate their interactions, and connect bidirectional state using `@osiloke/chalo`.

## 1. Defining a Mission and Steps

A `Mission` is a declarative, state-machine-like JSON configuration defining a multi-step guided experience.

### Mission Structure
```typescript
import { Mission } from 'chalo';

const onboardingMission: Mission = {
  id: 'app-onboarding',
  title: 'Welcome to the App! 👋',
  description: 'Let us walk you through the main features.',
  allowCompletion: true,
  steps: [ /* ... */ ],
  onComplete: () => {
    console.log("Mission finished!");
  }
};
```

### Step Anatomy
Each step defines visibility, navigation gates, and side-effects.

```typescript
const step: Step = {
  id: 'welcome_step',
  title: 'Getting Started',
  content: 'Follow the glowing element.', // Shown in the Drawer

  // Highlighting: For registered elements, prefer using the auto-generated #chalo-<fieldName> id
  // or [data-chalo-field="<fieldName>"] instead of raw DOM id selectors.
  targetElement: '#chalo-dashboard',

  targetField: 'userName', // Pre-focuses this field and syncs its state

  // Gate: Auto-advance automatically AFTER this condition becomes true
  waitFor: {
    type: 'element_exists',
    field: 'my_button' // References the element created via registerElement('my_button')
  },

  // Gate: Only execute actionSequence if this condition is true
  condition: {
    type: 'field_value',
    field: 'isNewUser',
    value: true
  },

  // Reload Behavior: Re-execute actionSequence on page reload to restore UI state
  executeOnReload: true, // Forces all actions to re-run when page is reloaded

  // Actions: Automation engine side-effects triggered when step is reached
  actionSequence: [ /* ... Actions ... */ ],

  // Interactive UI embedded in the drawer
  bubbles: [ /* ... Bubbles ... */ ]
};
```

## 2. Guiding Users: The Action Engine

The Action Engine (`packages/chalo/src/engine/action-engine.ts`) is the powerhouse of UI automation. Instead of just pointing at things, you can automate clicks, API calls, scrolls, and more.

### Built-in Action Types

Instead of relying on fragile CSS selectors, Actions natively understand the `field` names you define via `registerField` and `registerElement`.

- **`click`**: Simulates a native click on a DOM element. Supports both `config: { field: "my_button" }` (preferred for registered elements) and `config: { selector: ".my-class" }`.
- **`scroll`**: Smoothly scrolls the registered element (e.g. `config: { field: "results-container", block: "start", inline: "nearest" }`) into view and **highlights it briefly** with a blue outline to immediately grab user attention. By default, it centers the block and sets `inline: 'nearest'` to prevent unwanted horizontal scrolling jumps—an essential fix for complex React flex layouts.
- **`fill_field`**: Updates state variables and forcefully sets the native DOM element's value using its `field` ID, dispatching `input` and `change` events so React/Vue/vanilla apps catch the update. The `value` can be a literal, a field reference (`{ type: 'ref', field: 'sourceField' }`), or a function (`{ type: 'fn', generator: () => value }`). See **Dynamic Field Values** below.
- **`api_call`**: Initiates a `fetch` request (`url`, `method`, `headers`, `body`).
- **`wait`**: Suspends the execution pipeline for `durationMs`.
- **`navigate`**: Pushes state to `window.history` and fires a `popstate` event for client-side routers.
- **`conditional`**: Evaluates a condition and saves `conditionMet` to the execution results.
- **`custom`**: Invokes an action registered via `useChalo().registerActionHandler(type, handler)`.

> **Tip:** The engine is resilient. If you accidentally use `data` instead of `config` in your `actionSequence`, the engine will gracefully accept it as an alias.

### Advanced Action Features (Retries and Dependencies)

The engine supports topological sorting of directed acyclic graphs (DAGs) and robust retry mechanics.

```typescript
actionSequence: [
  {
    id: 'fetch-data',
    type: 'api_call',
    config: { url: '/api/init' },
    retry: {
      maxAttempts: 3,
      backoff: 'exponential',
      delayMs: 500
    }
  },
  {
    id: 'scroll-to-result',
    type: 'scroll',
    config: { field: 'results-container' },
    dependsOn: ['fetch-data'] // Engine guarantees UI script execution order
  }
]
```

## 3. Condition Evaluation and Flow Control

Conditions (`SuccessCondition`) govern both step progression (`waitFor`) and action execution (`condition`).

| Condition Type | Required Configuration | Example Implementation |
|---|---|---|
| `field_value` | `field`, `value` | `ctx.variables[field] == value` |
| `field_touched` | `field` | True if the field was ever focused/blurred |
| `element_exists` | `field`, `exists` (boolean) | Checks the DOM for `[data-chalo-field="..."]` |
| `custom` | `predicate` function | `(variables, formState) => boolean` |

**Example of an inverted existence check:**
```typescript
waitFor: {
  type: 'element_exists',
  field: 'loading-spinner',
  exists: false // Waits until the element is REMOVED from the DOM
}
```

## 4. Deep UI Integration Strategies

To make conditions and actions work, elements must be annotated.

### Forms and State Synchronization (react-hook-form)
If you are using `react-hook-form`, `useChalo` can automatically orchestrate bidirectional synchronization.

1. Drawer inputs sync to the store.
2. The store syncs to your App's Form.
3. Your App's Form syncs back to the store.

```tsx
import { useForm } from 'react-hook-form';
import { useChalo } from 'chalo';

function MyForm() {
  const form = useForm();
  // Pass the RHF instance directly into useChalo
  const { registerField, registerElement } = useChalo({ form });

  return (
    <form>
      {/* registerField provides name, id, data-chalo-field, onChange, onBlur, onFocus */}
      <input placeholder="Name" {...registerField('userName')} />

      {/* registerElement injects data-chalo-field for the action-engine to target via 'click'/'scroll' */}
      <button ref={registerElement('submit-btn')} type="submit">
        Submit
      </button>
    </form>
  );
}
```

## 5. Conversational UI (Bubbles)

Bubbles render interactive chat-like components natively inside the `SmartDrawer`.

### Available Bubble Types

| Bubble Type | Description | Configuration Needs |
|-------------|-------------|---------------------|
| `message` | A standard chat message from the system (often used for hints/information). | `content` (string or ReactNode) |
| `input` | An interactive text input rendered inside the chat. Synchronizes directly with the specified form field. | `targetField` (must match a registered form field name) |
| `select` | An interactive dropdown rendered inside the chat. Synchronizes directly with the specified form field. | `targetField`, `options` array (`{label, value}`) |
| `action-group` | Creates a group of interactive buttons that can trigger actions. | `actions` array (`{label, type, data}`) |

### Bubble Action Types (`StepAction`)

When defining actions within an `action-group` bubble, the following types are available. Use `config` (preferred) or `data` (backward compatibility) to provide the action details.

| Action Type | Configuration Property (`config` or `data`) | Description |
|---|---|---|
| `next` | N/A | Advances to the next step. |
| `prev` | N/A | Goes back to the previous step. |
| `click` | `{ field: string }` or `{ selector: string }` | Performs a DOM click. |
| `fill_field` | `{ field: string, value: any }` | Sets a value in the store and form. |
| `trigger_action` | `Action[]` | **Powerful**: Triggers a sequence of Action Engine steps (scroll, wait, etc.). **Full progress is shown in the Drawer UI.** |
| `custom` | N/A | Triggers the `onClick` handler provided in the action object. |

### Dynamic Field Values in `fill_field`

The `fill_field` action (both in `actionSequence` and bubble `config`/`data`) supports **dynamic value resolution** via the `FieldValueSource` type. This enables two powerful patterns:

#### 1. Reference Another Field's Value

Use `{ type: 'ref', field: 'sourceField' }` to copy the value of a previously filled field. This is useful for confirmation fields, derived values, or multi-step forms where data flows between fields.

```typescript
actionSequence: [
  {
    id: 'fill-email',
    type: 'fill_field',
    config: { field: 'email', value: 'user@example.com' }
  },
  {
    id: 'confirm-email',
    type: 'fill_field',
    config: {
      field: 'confirmEmail',
      value: { type: 'ref', field: 'email' }  // copies the email value
    }
  }
]
```

#### 2. Generate Values with Functions

Use `{ type: 'fn', generator: () => value }` to compute values at execution time. This is ideal for passwords, timestamps, UUIDs, random data, or any value that must be computed dynamically.

```typescript
actionSequence: [
  {
    id: 'gen-password',
    type: 'fill_field',
    config: {
      field: 'password',
      value: { type: 'fn', generator: () => crypto.randomUUID() }
    }
  },
  {
    id: 'confirm-password',
    type: 'fill_field',
    config: {
      field: 'confirmPassword',
      value: { type: 'ref', field: 'password' }  // reuses the generated value
    }
  }
]
```

#### 3. Works in Bubble Actions Too

```typescript
bubbles: [
  {
    id: 'b1',
    type: 'action-group',
    actions: [
      {
        label: 'Auto-fill password',
        type: 'fill_field',
        data: {
          field: 'password',
          value: { type: 'fn', generator: () => generateStrongPassword() }
        }
      },
      {
        label: 'Copy to confirmation',
        type: 'fill_field',
        data: {
          field: 'confirmPassword',
          value: { type: 'ref', field: 'password' }
        }
      }
    ]
  }
]
```

> **Important:** Field references (`type: 'ref'`) read from the execution context (`ctx.variables`), so the referenced field must have been filled in a prior action within the same sequence. Function values (`type: 'fn'`) are evaluated once at execution time and the result is stored for later reference.

### Example implementation

```typescript
bubbles: [
  { id: 'b1', type: 'message', content: 'Let us customize your profile.' },
  {
    id: 'b2',
    type: 'input',
    targetField: 'userName' // Two-way binds directly with the app form!
  },
  {
    id: 'b3',
    type: 'select',
    targetField: 'userRole',
    options: [{ label: 'Admin', value: 'admin' }, { label: 'Viewer', value: 'viewer' }]
  },
  {
    id: 'b4',
    type: 'action-group',
    actions: [
      { label: 'Auto-Fill', type: 'fill_field', data: { field: 'userName', value: 'John' } },
      // Dynamic value: copy userName from a previously filled field
      {
        label: 'Copy Name',
        type: 'fill_field',
        data: { field: 'displayName', value: { type: 'ref', field: 'userName' } }
      },
      {
        label: 'Auto-Fill & Submit',
        type: 'trigger_action',
        data: [
          { id: 'f1', type: 'fill_field', config: { field: 'userName', value: 'John' } },
          { id: 'w1', type: 'wait', config: { durationMs: 400 } },
          { id: 'c1', type: 'click', config: { field: 'submit-btn' } }
        ]
      },
      { label: 'Next', type: 'next' }
    ]
  }
]
```

## 6. SmartDrawer Configuration Options

The `useSmartDrawer` hook accepts an options object to customize the drawer's behavior.

### Available Options

```typescript
interface UseSmartDrawerOptions {
  /** Enable debug logging to console. Default: false in production, true in dev */
  debug?: boolean;

  /** Typing delay in ms before showing next bubble (default: 1200) */
  typingDelay?: number;

  /** Disable action interaction messages from being added to chat history (default: false) */
  disableActionInteractions?: boolean;
}
```

### Usage Example

```typescript
import { useSmartDrawer } from 'chalo';

function MyComponent() {
  const drawer = useSmartDrawer({
    debug: false,
    typingDelay: 800, // Faster typing
    disableActionInteractions: true, // Don't show action execution messages
  });

  // ...
}
```

### Disabling Action Interaction Messages

When `disableActionInteractions` is set to `true`, actions still execute normally but don't create chat messages in the conversation history. This keeps the chat cleaner when you have many automated actions.

```typescript
const drawer = useSmartDrawer({
  disableActionInteractions: true,
});
```

**What happens when disabled:**
- ✅ Actions still execute (clicks, fills, API calls, etc.)
- ✅ Bubble UI (message, input, select) still render normally
- ❌ No "Auto-filled X with Y" messages
- ❌ No "Clicked: selector" messages
- ❌ No "Triggered action sequence" messages

**Use case example:**
```typescript
// Clean chat - only show step content and explicit message bubbles
const drawer = useSmartDrawer({ disableActionInteractions: true });

// With a mission like:
{
  id: 'form-filling',
  steps: [
    {
      id: 'fill-basic-info',
      content: 'Let me help you fill out this form.',
      bubbles: [
        { id: 'msg1', type: 'message', content: 'I\'ll auto-fill your details.' },
        { id: 'actions', type: 'action-group', actions: [
          { label: 'Auto-fill', type: 'fill_field', data: { field: 'name', value: 'John' } },
          // This fills the field but doesn't add a chat message
        ]}
      ]
    }
  ]
}
// Chat shows: step content → message bubble → user action → next step
// Instead of: step content → message bubble → action message → action message → next step
```

## 7. Page Reload and State Recovery

When a user refreshes the page during an active mission, Chalo automatically restores the mission state from `localStorage`. However, DOM elements (like modals, dialogs, or dynamically created content) are lost on reload. The `executeOnReload` flag ensures critical UI state is restored.

### Understanding Reload Behavior

By default, when a page reloads:
- ✅ Mission state is restored (current step, field values, progress)
- ❌ DOM state is lost (modals close, dynamic content disappears)
- ❌ Action sequences do NOT re-execute (to prevent unwanted side effects)

Use `executeOnReload` to override this behavior and restore critical UI state.

### Step-Level `executeOnReload`

When set to `true` on a step, the entire `actionSequence` will re-execute on page reload, regardless of whether it already ran or if conditions are met.

```typescript
{
  id: 'open-modal-step',
  title: 'Open Configuration Modal',
  content: 'I\'ll open the configuration modal for you.',
  executeOnReload: true, // ← Entire step re-executes on reload
  actionSequence: [
    {
      id: 'click-open-btn',
      type: 'click',
      config: { selector: '#btn-open-modal' },
      label: 'Open modal'
    }
  ]
}
```

### Action-Level `executeOnReload`

For finer control, mark individual actions within an `actionSequence` to run on reload. This is useful when you only want certain actions to restore state.

```typescript
{
  id: 'setup-step',
  actionSequence: [
    {
      id: 'open-modal',
      type: 'click',
      config: { selector: '#btn-modal' },
      label: 'Open modal',
      executeOnReload: true  // ← This action runs on reload
    },
    {
      id: 'track-analytics',
      type: 'api_call',
      config: { url: '/api/track', method: 'POST' },
      executeOnReload: false  // ← Skip this on reload (default)
    }
  ]
}
```

### When to Use `executeOnReload`

**✅ Use it for:**
- Opening modals, dialogs, or overlays that define the mission context
- Clicking buttons that reveal critical UI elements
- Scrolling to elements that must be visible for the mission to continue
- Any action that establishes the initial state for a step

**❌ Don't use it for:**
- Destructive actions (form submissions, API mutations)
- Analytics or tracking calls
- Actions that should only happen once per session
- Actions with side effects that shouldn't repeat

### Reload Behavior Decision Matrix

| Scenario | `executeOnReload` | Conditions Met | Previously Executed | Result |
|----------|-------------------|----------------|---------------------|--------|
| Normal step advance | ❌ | ✅ | ❌ | ✅ Execute all actions |
| Normal step advance | ❌ | ✅ | ✅ | ❌ Skip (already executed) |
| Page reload | ❌ | ✅ | ❌ | ✅ Execute all actions |
| Page reload | ❌ | ❌ | ❌ | ❌ Skip (conditions fail) |
| Page reload | ❌ | ❌ | ✅ | ❌ Skip (already executed) |
| Page reload | ✅ (step) | ❌ | ✅ | ✅ Execute all actions |
| Page reload | ✅ (action) | ❌ | ✅ | ✅ Execute marked actions only |
| Page reload | ✅ (both) | ❌ | ✅ | ✅ Execute all actions |

### Practical Example: Modal-Based Mission

This example shows a mission that guides users through creating a project in a modal:

```typescript
{
  id: 'find-create-btn',
  title: 'Find the Create Button',
  content: 'Look for the "Create Project" button. I\'ll click it for you.',
  targetElement: '#btn-create-project',
  executeOnReload: true, // Restore modal if page reloads
  condition: {
    type: 'custom',
    predicate: () => !document.querySelector('[role="dialog"]'),
  },
  actionSequence: [
    {
      id: 'click-create',
      type: 'click',
      config: { selector: '#btn-create-project' },
      label: 'Open create modal',
      executeOnReload: true, // This action MUST run on reload even if condition fails
    },
  ],
  waitFor: {
    type: 'custom',
    predicate: () => !!document.querySelector('[role="dialog"]'),
  },
}
```

**What happens on reload:**
1. User is on this step when they refresh
2. Modal is gone (DOM reset), so `condition` would fail
3. But `executeOnReload: true` on the action overrides the condition check
4. The click action executes, reopening the modal
5. Mission continues seamlessly

## Workflow Summary

1. **Build The UI:** Use `registerField` and `registerElement` from `useChalo` in your React components.
2. **Define Interactions:** Construct your `Mission` with conditions (`waitFor`), animations (`scroll`), and dom automations (`actionSequence`).
3. **Handle Reloads:** Add `executeOnReload: true` to steps/actions that restore critical UI state (modals, dialogs, overlays).
4. **Register Context:** Use `useChalo({ form: myRHFForm })` to seamlessly lock the UI automation to your native form validation.
5. **Activate:** Call `registerMission(mission)` and `startMission(mission.id)`. The `SmartDrawer` will mount and orchestrate the flow.
