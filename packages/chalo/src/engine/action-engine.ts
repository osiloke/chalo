import {
  Action,
  ActionConfig,
  ActionResult,
  ExecutionContext,
  ActionHandler,
  ActionType,
  RetryConfig,
  ClickActionConfig,
  ScrollActionConfig,
  FillFieldActionConfig,
  FieldValueSource,
  ApiCallActionConfig,
  WaitActionConfig,
  ConditionalActionConfig,
  NavigateActionConfig,
  CustomActionConfig,
  SuccessCondition,
} from '../types';

// --- VALUE RESOLVER ---

/**
 * Resolves a fill_field value that may be:
 * - A literal (string, number, etc.)
 * - A FieldValueSource ref: { type: 'ref', field: 'otherField' }
 * - A FieldValueSource fn: { type: 'fn', generator: () => value }
 */
function resolveFillValue(value: unknown, ctx: ExecutionContext): unknown {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const src = value as FieldValueSource;
    if (src.type === 'ref' && 'field' in src) {
      return ctx.variables[src.field];
    }
    if (src.type === 'fn' && 'generator' in src && typeof src.generator === 'function') {
      return (src.generator as () => unknown)();
    }
  }
  return value;
}

// --- BUILT-IN ACTION HANDLERS ---

const clickHandler: ActionHandler = async (config: ActionConfig) => {
  const clickConfig = config as ClickActionConfig;
  // Prefer named field resolution (mirrors fill_field pattern)
  const targetSelector = clickConfig.field
    ? `[data-chalo-field="${clickConfig.field}"], #chalo-${clickConfig.field}`
    : clickConfig.selector;
  if (!targetSelector) throw new Error('Click action requires either "field" or "selector".');
  const el = document.querySelector(targetSelector);
  if (!el) throw new Error(`Element not found: ${targetSelector}`);
  (el as HTMLElement).click();
  return { clicked: targetSelector };
};

const scrollHandler: ActionHandler = async (config: ActionConfig) => {
  const { selector, behavior = 'smooth', field } = config as ScrollActionConfig & { field?: string };
  const targetSelector = field ? `[data-chalo-field="${field}"], #chalo-${field}` : selector;
  if (targetSelector) {
    const el = document.querySelector<HTMLElement>(targetSelector);
    if (!el) throw new Error(`Element not found: ${targetSelector}`);
    el.scrollIntoView({ behavior, block: 'center' });
    // Brief highlight to show the target was found
    el.style.transition = 'outline 0.2s';
    el.style.outline = '3px solid rgba(99, 102, 241, 0.6)';
    el.style.outlineOffset = '4px';
    setTimeout(() => {
      el.style.outline = 'none';
    }, 2000);
    return { scrolled: targetSelector };
  } else {
    window.scrollTo({ top: document.body.scrollHeight, behavior });
    return { scrolled: 'bottom' };
  }
};

const fillFieldHandler: ActionHandler = async (config: ActionConfig, ctx: ExecutionContext) => {
  const { field, value } = config as FillFieldActionConfig;
  // Resolve dynamic values (refs, functions) before storing
  const resolvedValue = resolveFillValue(value, ctx);
  // Store the resolved value in execution context variables
  ctx.variables[field] = resolvedValue;
  // Also sync to the store/form so React controlled inputs stay in sync
  if (ctx.updateField) {
    ctx.updateField(field, resolvedValue, 'valid');
  }
  // Try to fill the actual DOM element using chalo field markers
  const el = document.querySelector<HTMLInputElement | HTMLSelectElement>(
    `[data-chalo-field="${field}"], #chalo-${field}, [name="${field}"], #${field}`
  );
  if (el) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      || Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
    nativeInputValueSetter?.call(el, resolvedValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  return { field, value: resolvedValue };
};

const apiCallHandler: ActionHandler = async (config: ActionConfig) => {
  const { url, method = 'GET', headers, body } = config as ApiCallActionConfig;
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  const data = await response.json();
  return { url, status: response.status, data };
};

const waitHandler: ActionHandler = async (config: ActionConfig) => {
  const { durationMs } = config as WaitActionConfig;
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  return { waited: durationMs };
};

const conditionalHandler: ActionHandler = async (config: ActionConfig, ctx: ExecutionContext) => {
  const { condition } = config as ConditionalActionConfig;
  const result = evaluateCondition(condition, ctx);
  return { conditionMet: result };
};

const navigateHandler: ActionHandler = async (config: ActionConfig) => {
  const { path } = config as NavigateActionConfig;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  return { navigated: path };
};

// --- CONDITION EVALUATION ---

function evaluateCondition(condition: SuccessCondition | undefined, ctx: ExecutionContext): boolean {
  if (!condition) return true;
  switch (condition.type) {
    case 'field_value':
      if (!condition.field) return false;
      return ctx.variables[condition.field] == condition.value;
    case 'field_touched':
      if (!condition.field) return false;
      return ctx.variables[`__touched_${condition.field}`] === true;
    case 'element_exists': {
      if (!condition.field) return false;
      const selector = `[data-chalo-field="${condition.field}"], #chalo-${condition.field}`;
      const el = document.querySelector(selector);
      return condition.exists === false ? !el : !!el;
    }
    case 'custom':
      if (condition.predicate) {
        return condition.predicate(ctx.variables, ctx.variables);
      }
      return false;
    default:
      return true;
  }
}

// --- HANDLER REGISTRY ---

const builtInHandlers: Record<ActionType, ActionHandler> = {
  click: clickHandler,
  scroll: scrollHandler,
  fill_field: fillFieldHandler,
  api_call: apiCallHandler,
  wait: waitHandler,
  conditional: conditionalHandler,
  navigate: navigateHandler,
  custom: async (_config) => {
    const { handlerId } = _config as CustomActionConfig;
    throw new Error(`No handler registered for custom action: ${handlerId}`);
  },
};

// --- RETRY WRAPPER ---

async function withRetry<T>(fn: () => Promise<T>, retry?: RetryConfig): Promise<{ result: T; attempts: number }> {
  const maxAttempts = retry?.maxAttempts ?? 1;
  const delayMs = retry?.delayMs ?? 1000;
  const backoff = retry?.backoff ?? 'fixed';

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      return { result, attempts: attempt };
    } catch (e) {
      lastError = e as Error;
      if (attempt < maxAttempts) {
        const delay = backoff === 'exponential' ? delayMs * Math.pow(2, attempt - 1) : delayMs;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// --- DEPENDENCY RESOLVER (topological sort) ---

function resolveExecutionOrder(actions: Action[]): Action[] {
  const actionMap = new Map(actions.map((a) => [a.id, a]));
  const visited = new Set<string>();
  const result: Action[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const action = actionMap.get(id);
    if (!action) return;
    action.dependsOn?.forEach((dep) => visit(dep));
    result.push(action);
  }

  actions.forEach((a) => visit(a.id));
  return result;
}

// --- PUBLIC ENGINE API ---

export class ActionEngine {
  private handlers = new Map<ActionType, ActionHandler>(Object.entries(builtInHandlers) as [ActionType, ActionHandler][]);
  private abortController: AbortController | null = null;

  registerHandler(type: ActionType, handler: ActionHandler): void {
    this.handlers.set(type, handler);
  }

  getHandler(type: ActionType): ActionHandler | undefined {
    return this.handlers.get(type);
  }

  async executeAction(action: Action, context: ExecutionContext): Promise<ActionResult> {
    // Check condition
    if (action.condition && !evaluateCondition(action.condition, context)) {
      return { id: action.id, status: 'skipped', attempts: 0 };
    }

    // Check dependencies
    if (action.dependsOn?.length) {
      const failedDeps = action.dependsOn.filter(
        (depId) => context.results[depId]?.status === 'failed' || context.results[depId]?.status === 'cancelled'
      );
      if (failedDeps.length > 0) {
        return { id: action.id, status: 'skipped', attempts: 0, error: `Dependencies failed: ${failedDeps.join(', ')}` };
      }
    }

    const handler = this.handlers.get(action.type);
    if (!handler) {
      return { id: action.id, status: 'failed', attempts: 0, error: `No handler for action type: ${action.type}` };
    }

    context.currentActionId = action.id;
    const result: ActionResult = {
      id: action.id,
      status: 'running',
      attempts: 0,
      startedAt: Date.now(),
    };

    try {
      const { result: data, attempts } = await withRetry(
        () => handler(action.config, context),
        action.retry
      );
      result.status = 'success';
      result.data = data;
      result.attempts = attempts;
      result.completedAt = Date.now();
    } catch (e) {
      result.status = 'failed';
      result.error = (e as Error).message;
      result.attempts = action.retry?.maxAttempts ?? 1;
      result.completedAt = Date.now();
    }

    context.results[action.id] = result;
    context.currentActionId = null;
    return result;
  }

  async executeSequence(actions: Action[], context: ExecutionContext, onProgress?: (results: Record<string, ActionResult>) => void): Promise<Record<string, ActionResult>> {
    this.abortController = new AbortController();
    const ordered = resolveExecutionOrder(actions);

    for (const action of ordered) {
      if (this.abortController.signal.aborted) {
        // Mark remaining actions as cancelled
        const remaining = ordered.filter((a) => !context.results[a.id]);
        remaining.forEach((a) => {
          context.results[a.id] = { id: a.id, status: 'cancelled', attempts: 0 };
        });
        break;
      }

      await this.executeAction(action, context);
      onProgress?.({ ...context.results });
    }

    this.abortController = null;
    return context.results;
  }

  cancel(): void {
    this.abortController?.abort();
  }
}

// Singleton instance for store use
export const actionEngine = new ActionEngine();
