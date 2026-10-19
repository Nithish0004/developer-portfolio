/**
 * ThreeUI AnimatedTopDock Proximity Spring Controller
 * Exact Proximity + Spring Physics from ThreeUI AnimatedTopDock (revision 5a736cd)
 * 
 * - Connected physical dock behavior: small → medium → LARGE → medium → small
 * - Proximity field (radius = 122) with Hermite cubic transfer
 * - Dynamic cell expansion in BOTH width (widthGrowth = 17) and height (heightGrowth = 16)
 * - Hanging drop effect below navbar (drop = 3.5 + vertical height growth)
 * - Centered label inside expanding cell
 * - Spring kinematics: spring = 0.19, damping = 0.70
 * - Idle sleep: stops RAF completely at rest
 */

export interface TopDockOptions {
  proximity?: number;
  spring?: number;
  damping?: number;
  widthGrowth?: number;
  heightGrowth?: number;
  drop?: number;
  lockTrack?: boolean;
}

export const TOP_DOCK_DEFAULTS: Required<TopDockOptions> = {
  proximity: 122,
  spring: 0.19,
  damping: 0.70,
  widthGrowth: 17,
  heightGrowth: 16,
  drop: 3.5,
  lockTrack: true,
};

interface DockItemState {
  element: HTMLElement;
  indicator: HTMLElement | null;
  baseWidth: number;
  baseHeight: number;
  center: number;
  value: number;
  velocity: number;
  target: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function createTopDockController(
  root: HTMLElement,
  options: TopDockOptions = {}
) {
  const opts = { ...TOP_DOCK_DEFAULTS, ...options };
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const precisionQuery = window.matchMedia('(hover:hover) and (pointer:fine)');

  const items: DockItemState[] = Array.from(
    root.querySelectorAll<HTMLElement>('[data-dock-item]')
  ).map((element) => ({
    element,
    indicator: element.querySelector<HTMLElement>('[data-dock-indicator]'),
    baseWidth: 0,
    baseHeight: 0,
    center: 0,
    value: 0,
    velocity: 0,
    target: 0,
  }));

  let enabled = false;
  let pointerActive = false;
  let dirty = false;
  let rafId = 0;
  let isVisible = true;
  let cachedRootRect = { left: 0, right: 0, top: 0, bottom: 0 };

  const canAnimate = () =>
    !reducedQuery.matches &&
    root.clientWidth > 0 &&
    window.innerWidth > 600 &&
    precisionQuery.matches;

  const measure = () => {
    enabled = canAnimate();

    // Release inline styles to measure true resting geometry
    if (opts.lockTrack) root.style.width = '';
    for (const state of items) {
      state.element.style.width = '';
      state.element.style.height = '';
      state.element.style.transform = '';
      state.element.style.backgroundColor = 'transparent';
      state.element.style.borderColor = 'transparent';
      state.element.style.boxShadow = 'none';
      state.element.style.color = '';
      state.element.dataset.dockNear = 'false';
      if (state.indicator) {
        state.indicator.style.width = '0px';
        state.indicator.style.opacity = '0';
      }
    }

    const rRect = root.getBoundingClientRect();
    cachedRootRect = {
      left: rRect.left,
      right: rRect.right,
      top: rRect.top,
      bottom: rRect.bottom,
    };

    for (const state of items) {
      const rect = state.element.getBoundingClientRect();
      state.baseWidth = rect.width;
      state.baseHeight = rect.height;
      state.center = rect.left + rect.width * 0.5;
      state.value = 0;
      state.velocity = 0;
      state.target = 0;

      // Lock resting dimensions
      state.element.style.width = `${state.baseWidth.toFixed(1)}px`;
      state.element.style.height = `${state.baseHeight.toFixed(1)}px`;
    }

    // Lock track width to prevent shifting outer navbar elements
    if (opts.lockTrack) {
      root.style.width = `${root.getBoundingClientRect().width.toFixed(2)}px`;
    }

    pointerActive = false;
    dirty = false;
    root.dataset.dockState = enabled ? 'idle' : 'static';
    root.dataset.dockMax = '0.00';
  };

  const applyLayout = () => {
    for (const state of items) {
      const value = clamp(state.value, 0, 1.15);

      if (value > 0.001) {
        // 1. Expand in both width and height
        const currentWidth = state.baseWidth + opts.widthGrowth * value;
        const currentHeight = state.baseHeight + opts.heightGrowth * value;
        state.element.style.width = `${currentWidth.toFixed(1)}px`;
        state.element.style.height = `${currentHeight.toFixed(1)}px`;

        // 2. Hanging drop effect: translate downward so bottom extends below navbar
        const dropY = value * opts.drop;
        state.element.style.transform = `translate3d(0, ${dropY.toFixed(2)}px, 0)`;

        // 3. Tactile clay expanding pill surface appearance
        const alpha = clamp(value * 1.25, 0, 1);
        state.element.style.backgroundColor = `rgba(255, 255, 255, ${(0.88 * alpha).toFixed(2)})`;
        state.element.style.borderColor = `rgba(255, 255, 255, ${(0.95 * alpha).toFixed(2)})`;
        state.element.style.boxShadow = `0 ${(8 + 12 * value).toFixed(0)}px ${(18 + 14 * value).toFixed(0)}px -4px rgba(180, 165, 148, ${(0.22 + 0.18 * value).toFixed(2)}), inset 0 2px 3px 0 rgba(255, 255, 255, ${(0.95 * alpha).toFixed(2)}), inset 0 -2px 4px 0 rgba(170, 150, 130, ${(0.14 * alpha).toFixed(2)})`;
        state.element.style.color = '#1f1c19';

        // 4. Smooth terracotta bottom indicator
        if (state.indicator) {
          const indicatorWidth = Math.round(18 + 14 * value);
          state.indicator.style.width = `${indicatorWidth}px`;
          state.indicator.style.opacity = `${clamp(value * 1.5, 0, 1).toFixed(2)}`;
        }
      } else {
        state.element.style.width = state.baseWidth > 0 ? `${state.baseWidth.toFixed(1)}px` : '';
        state.element.style.height = state.baseHeight > 0 ? `${state.baseHeight.toFixed(1)}px` : '';
        state.element.style.transform = '';
        state.element.style.backgroundColor = 'transparent';
        state.element.style.borderColor = 'transparent';
        state.element.style.boxShadow = 'none';
        state.element.style.color = '';
        if (state.indicator) {
          state.indicator.style.width = '0px';
          state.indicator.style.opacity = '0';
        }
      }
    }
  };

  const draw = () => {
    if (!isVisible || document.hidden) {
      rafId = 0;
      return;
    }

    if (enabled && dirty) {
      let moving = false;
      let maxValue = 0;

      for (const state of items) {
        // Organic ThreeUI spring simulation
        state.velocity += (state.target - state.value) * opts.spring;
        state.velocity *= opts.damping;
        state.value += state.velocity;

        if (Math.abs(state.target - state.value) < 0.001 && Math.abs(state.velocity) < 0.001) {
          state.value = state.target;
          state.velocity = 0;
        } else {
          moving = true;
        }

        maxValue = Math.max(maxValue, clamp(state.value, 0, 1.15));
      }

      applyLayout();
      root.dataset.dockMax = maxValue.toFixed(2);

      if (!moving) {
        dirty = false;
        if (items.every((state) => state.target === 0)) {
          root.dataset.dockState = 'idle';
          rafId = 0;
          return;
        }
      }
    }

    rafId = requestAnimationFrame(draw);
  };

  const setTargets = (clientX: number) => {
    if (!enabled || !isVisible || document.hidden) return;

    for (let index = 0; index < items.length; index += 1) {
      const state = items[index];
      // ThreeUI continuous hermite proximity curve: smooth transfer between neighbors
      const proximity = clamp(1 - Math.abs(clientX - state.center) / Math.max(1, opts.proximity), 0, 1);
      const influence = proximity * proximity * (3 - 2 * proximity);
      state.target = influence;
      state.element.dataset.dockNear = influence > 0.08 ? 'true' : 'false';
    }

    pointerActive = true;
    dirty = true;
    root.dataset.dockState = 'active';

    if (!rafId) {
      rafId = requestAnimationFrame(draw);
    }
  };

  const reset = () => {
    pointerActive = false;
    dirty = true;
    items.forEach((state) => {
      state.target = 0;
      state.element.dataset.dockNear = 'false';
    });

    if (!rafId) {
      rafId = requestAnimationFrame(draw);
    }
  };

  const focusItem = (item: HTMLElement) => {
    if (!enabled) return;
    const index = items.findIndex((state) => state.element === item);
    if (index < 0) return;

    items.forEach((state, itemIndex) => {
      state.target = itemIndex === index ? 1 : Math.abs(itemIndex - index) === 1 ? 0.28 : 0;
      state.element.dataset.dockNear = state.target > 0.08 ? 'true' : 'false';
    });

    pointerActive = false;
    dirty = true;
    root.dataset.dockState = 'focus';

    if (!rafId) {
      rafId = requestAnimationFrame(draw);
    }
  };

  const onPointerEnter = (event: PointerEvent) => {
    setTargets(event.clientX);
  };

  const onPointerMove = (event: PointerEvent) => {
    setTargets(event.clientX);
  };

  const onWindowPointerMove = (event: PointerEvent) => {
    if (!pointerActive) return;
    const paddingX = 40;
    const paddingYTop = 30;
    const paddingYBottom = 60; // Extra clearance below for the hanging drop
    const outside =
      event.clientX < cachedRootRect.left - paddingX ||
      event.clientX > cachedRootRect.right + paddingX ||
      event.clientY < cachedRootRect.top - paddingYTop ||
      event.clientY > cachedRootRect.bottom + paddingYBottom;

    if (outside) {
      reset();
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    const item = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-dock-item]');
    if (item) focusItem(item);
  };

  const onFocusOut = () => {
    requestAnimationFrame(() => {
      if (!root.contains(document.activeElement)) reset();
    });
  };

  const onClick = () => reset();

  let released = false;
  const remeasure = () => {
    if (!released) measure();
  };

  document.fonts?.ready.then(remeasure);

  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(root);

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry?.isIntersecting ?? true;
    if (!isVisible && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (isVisible && dirty && !rafId) {
      rafId = requestAnimationFrame(draw);
    }
  }, { threshold: 0 });
  intersectionObserver.observe(root);

  const onVisibilityChange = () => {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    } else if (dirty && isVisible && !rafId) {
      measure();
      rafId = requestAnimationFrame(draw);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerleave', reset);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  root.addEventListener('click', onClick);
  window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  reducedQuery.addEventListener('change', measure);
  precisionQuery.addEventListener('change', measure);

  measure();

  return () => {
    released = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (opts.lockTrack) root.style.width = '';
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    root.removeEventListener('pointerenter', onPointerEnter);
    root.removeEventListener('pointermove', onPointerMove);
    root.removeEventListener('pointerleave', reset);
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
    root.removeEventListener('click', onClick);
    window.removeEventListener('pointermove', onWindowPointerMove);
    window.removeEventListener('resize', measure);
    reducedQuery.removeEventListener('change', measure);
    precisionQuery.removeEventListener('change', measure);
  };
}
