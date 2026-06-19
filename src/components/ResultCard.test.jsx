import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultCard from './ResultCard';

describe('ResultCard', () => {
  describe('rendering with known title', () => {
    it('renders the BMR card with correct title and description', () => {
      render(
        <ResultCard
          title="BMR"
          kcal={1780}
          proteinG={0}
          fatG={0}
          carbsG={0}
        />
      );

      expect(screen.getByText('BMR')).toBeInTheDocument();
      expect(screen.getByText('Resting energy burn')).toBeInTheDocument();
    });

    it('renders the TDEE (Maintenance) card with correct title', () => {
      render(
        <ResultCard
          title="TDEE (Maintenance)"
          kcal={2500}
          proteinG={144}
          fatG={69}
          carbsG={313}
        />
      );

      expect(screen.getByText('TDEE (Maintenance)')).toBeInTheDocument();
      expect(screen.getByText('Daily energy to maintain weight')).toBeInTheDocument();
    });

    it('renders the Cut (Deficit) card with correct title', () => {
      render(
        <ResultCard
          title="Cut (Deficit)"
          kcal={2000}
          proteinG={144}
          fatG={69}
          carbsG={200}
        />
      );

      expect(screen.getByText('Cut (Deficit)')).toBeInTheDocument();
      expect(screen.getByText('Calorie deficit for fat loss')).toBeInTheDocument();
    });

    it('renders the Bulk (Surplus) card with correct title', () => {
      render(
        <ResultCard
          title="Bulk (Surplus)"
          kcal={2750}
          proteinG={144}
          fatG={69}
          carbsG={380}
        />
      );

      expect(screen.getByText('Bulk (Surplus)')).toBeInTheDocument();
      expect(screen.getByText('Calorie surplus for muscle gain')).toBeInTheDocument();
    });
  });

  describe('rendering with unknown title', () => {
    it('falls back to ChartBarIcon and empty description', () => {
      render(
        <ResultCard
          title="Unknown Goal"
          kcal={2000}
          proteinG={50}
          fatG={30}
          carbsG={100}
        />
      );

      expect(screen.getByText('Unknown Goal')).toBeInTheDocument();
      // Should not have description text
      expect(screen.queryByText('Resting energy burn')).not.toBeInTheDocument();
    });
  });

  describe('kcal display', () => {
    it('renders kcal with locale formatting', () => {
      render(
        <ResultCard
          title="BMR"
          kcal={1780}
          proteinG={0}
          fatG={0}
          carbsG={0}
        />
      );

      expect(screen.getByText('1,780')).toBeInTheDocument();
      expect(screen.getByText('kcal/day')).toBeInTheDocument();
    });

    it('renders zero kcal', () => {
      render(
        <ResultCard
          title="BMR"
          kcal={0}
          proteinG={0}
          fatG={0}
          carbsG={0}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('macro display', () => {
    it('shows macros when they are greater than zero', () => {
      render(
        <ResultCard
          title="TDEE (Maintenance)"
          kcal={2500}
          proteinG={144}
          fatG={69}
          carbsG={313}
        />
      );

      expect(screen.getByText('Protein')).toBeInTheDocument();
      expect(screen.getByText('Fat')).toBeInTheDocument();
      expect(screen.getByText('Carbs')).toBeInTheDocument();
      expect(screen.getByText('144g')).toBeInTheDocument();
      expect(screen.getByText('69g')).toBeInTheDocument();
      expect(screen.getByText('313g')).toBeInTheDocument();
    });

    it('hides macros section when all are zero', () => {
      render(
        <ResultCard
          title="BMR"
          kcal={1780}
          proteinG={0}
          fatG={0}
          carbsG={0}
        />
      );

      expect(screen.queryByText('Protein')).not.toBeInTheDocument();
      expect(screen.queryByText('Fat')).not.toBeInTheDocument();
    });

    it('shows macros when at least one is positive', () => {
      render(
        <ResultCard
          title="BMR"
          kcal={1780}
          proteinG={144}
          fatG={0}
          carbsG={0}
        />
      );

      expect(screen.getByText('Protein')).toBeInTheDocument();
    });
  });

  describe('staggerIndex', () => {
    it('applies animation delay from staggerIndex prop', () => {
      render(
        <ResultCard
          title="BMR"
          kcal={1780}
          proteinG={0}
          fatG={0}
          carbsG={0}
          staggerIndex={3}
        />
      );

      const card = screen.getByText('BMR').closest('.result-card');
      expect(card).toHaveStyle({ animationDelay: '0.24s' });
    });

    it('uses 0s delay when staggerIndex is 0', () => {
      render(
        <ResultCard
          title="BMR"
          kcal={1780}
          proteinG={0}
          fatG={0}
          carbsG={0}
          staggerIndex={0}
        />
      );

      const card = screen.getByText('BMR').closest('.result-card');
      expect(card).toHaveStyle({ animationDelay: '0s' });
    });
  });

  describe('default props', () => {
    it('renders with just the default props', () => {
      render(<ResultCard />);

      // Should render empty title
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('kcal/day')).toBeInTheDocument();
    });
  });
});
