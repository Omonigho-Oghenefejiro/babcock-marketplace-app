import { describe, expect, it } from 'vitest';
import {
  fadeUpVariants,
  floatVariants,
  pageTransitionVariants,
  popVariants,
  pulseVariants,
  scaleHoverVariants,
  slideInLeftVariants,
  slideInRightVariants,
  staggerContainerVariants,
} from './animations';

describe('animation variants', () => {
  it('exports expected top-level variant states', () => {
    expect(fadeUpVariants).toHaveProperty('hidden');
    expect(fadeUpVariants).toHaveProperty('visible');
    expect(staggerContainerVariants).toHaveProperty('hidden');
    expect(staggerContainerVariants).toHaveProperty('visible');
    expect(scaleHoverVariants).toHaveProperty('initial');
    expect(scaleHoverVariants).toHaveProperty('hover');
    expect(scaleHoverVariants).toHaveProperty('tap');
    expect(slideInLeftVariants).toHaveProperty('hidden');
    expect(slideInRightVariants).toHaveProperty('visible');
    expect(popVariants).toHaveProperty('tap');
    expect(floatVariants).toHaveProperty('animate');
    expect(pulseVariants).toHaveProperty('animate');
    expect(pageTransitionVariants).toHaveProperty('exit');
  });

  it('keeps important transition characteristics', () => {
    expect(fadeUpVariants.hidden).toMatchObject({ opacity: 0, y: 20 });
    expect(fadeUpVariants.visible).toMatchObject({ opacity: 1, y: 0 });
    expect(staggerContainerVariants.visible).toHaveProperty('transition.staggerChildren', 0.1);
    expect(scaleHoverVariants.hover).toHaveProperty('scale', 1.03);
    expect(scaleHoverVariants.tap).toHaveProperty('scale', 0.98);
    expect(slideInLeftVariants.hidden).toHaveProperty('x', -50);
    expect(slideInRightVariants.hidden).toHaveProperty('x', 50);
    expect(popVariants.hover).toHaveProperty('transition.type', 'spring');
    expect(floatVariants.animate).toHaveProperty('y');
    expect(pulseVariants.animate).toHaveProperty('transition.repeat', Infinity);
    expect(pageTransitionVariants.exit).toHaveProperty('y', -20);
  });
});