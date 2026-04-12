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
- **`scroll`**: Smoothly scrolls the registered element (e.g. `config: { field: "results-container" }`) into center view and **highlights it briefly** with a blue outline to immediately grab user attention.
- **`fill_field`**: Updates state variables and forcefully sets the native DOM element's value using its `field` ID, dispatching `input` and `change` events so React/Vue/vanilla apps catch the update.
- **`api_call`**: Initiates a `fetch` request (`url`, `method`, `headers`, `body`).
- **`wait`**: Suspends the execution pipeline for `durationMs`.
- **`navigate`**: Pushes state to `window.history` and fires a `popstate` event for client-side routers.
- **`conditional`**: Evaluates a condition and saves `conditionMet` to the execution results.
- **`custom`**: Invokes an action registered via `useChalo().registerActionHandler(type, handler)`.

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

When defining actions within an `action-group` bubble, the following types are available:

| Action Type | Data Configuration | Description |
|---|---|---|
| `next` | N/A | Advances to the next step. |
| `prev` | N/A | Goes back to the previous step. |
| `click` | `{ field: string }` or `{ selector: string }` | Performs a DOM click. |
| `fill_field` | `{ field: string, value: any }` | Sets a value in the store and form. |
| `trigger_action` | `Action[]` | **Powerful**: Triggers a sequence of Action Engine steps (scroll, wait, etc.). |
| `custom` | N/A | Triggers the `onClick` handler provided in the action object. |

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

## Workflow Summary

1. **Build The UI:** Use `registerField` and `registerElement` from `useChalo` in your React components.
2. **Define Interactions:** Construct your `Mission` with conditions (`waitFor`), animations (`scroll`), and dom automations (`actionSequence`).
3. **Register Context:** Use `useChalo({ form: myRHFForm })` to seamlessly lock the UI automation to your native form validation.
4. **Activate:** Call `registerMission(mission)` and `startMission(mission.id)`. The `SmartDrawer` will mount and orchestrate the flow.
