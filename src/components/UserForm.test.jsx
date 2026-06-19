import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserContext } from '../context/context';
import { AuthCtx } from '../context/auth';
import UserForm from './UserForm';

// Default form field values for an authenticated user
const defaultUser = {
  sex: 'male',
  age: '30',
  heightCm: '180',
  weightKg: '80',
  activityKey: 'moderate',
  targetWeightKg: '75',
};

// Wrapper to provide UserContext and optional AuthCtx
function TestWrapper({ children, initialUser = {}, setUser = vi.fn(), auth = null }) {
  const [user, _setUser] = useState(initialUser);
  const actualSetUser = setUser.mock ? setUser : _setUser;

  const defaultAuth = {
    isAuthenticated: false,
    profile: null,
    updateProfile: vi.fn().mockResolvedValue(undefined),
  };

  return (
    <AuthCtx.Provider value={auth || defaultAuth}>
      <UserContext.Provider value={{ user, setUser: actualSetUser }}>
        {children}
      </UserContext.Provider>
    </AuthCtx.Provider>
  );
}

describe('UserForm', () => {
  describe('rendering', () => {
    it('renders the form title', () => {
      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      expect(screen.getByText('Your Details')).toBeInTheDocument();
      expect(screen.getByText('Metric')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      expect(screen.getByText('Biological Sex')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Height')).toBeInTheDocument();
      expect(screen.getByText('Current Weight')).toBeInTheDocument();
      expect(screen.getByText('Activity Level')).toBeInTheDocument();
    });

    it('renders sex selection buttons', () => {
      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('Female')).toBeInTheDocument();
    });

    it('renders all activity level options', () => {
      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      expect(screen.getByText('Sedentary (little to no exercise)')).toBeInTheDocument();
      expect(screen.getByText('Light (1–3 days/week)')).toBeInTheDocument();
      expect(screen.getByText('Moderate (3–5 days/week)')).toBeInTheDocument();
      expect(screen.getByText('Active (6–7 days/week)')).toBeInTheDocument();
      expect(screen.getByText('Athlete (2x/day training)')).toBeInTheDocument();
    });

    it('renders the calculate button by default', () => {
      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      expect(screen.getByText('Calculate My Plan')).toBeInTheDocument();
    });

    it('hides button when showButton is false', () => {
      render(
        <TestWrapper>
          <UserForm showButton={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('Calculate My Plan')).not.toBeInTheDocument();
    });

    it('shows target weight field by default (showAdvanced=true)', () => {
      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      expect(screen.getByText('Target Weight')).toBeInTheDocument();
    });

    it('hides target weight when showAdvanced is false', () => {
      render(
        <TestWrapper>
          <UserForm showAdvanced={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('Target Weight')).not.toBeInTheDocument();
    });
  });

  describe('pre-filling from user context', () => {
    it('populates fields from user context', () => {
      render(
        <TestWrapper initialUser={defaultUser}>
          <UserForm />
        </TestWrapper>
      );

      // Sex buttons: "male" button should have active class
      const maleBtn = screen.getByText('Male');
      expect(maleBtn).toHaveClass('active');

      // Input values via their type=number inputs
      const inputs = screen.getAllByRole('spinbutton');
      const ageInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Age'));
      const heightInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Height'));
      const weightInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Current Weight'));
      const targetInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Target Weight'));

      expect(ageInput).toHaveValue(30);
      expect(heightInput).toHaveValue(180);
      expect(weightInput).toHaveValue(80);
      expect(targetInput).toHaveValue(75);
    });

    it('displays empty fields when user context is empty', () => {
      render(
        <TestWrapper initialUser={{}}>
          <UserForm />
        </TestWrapper>
      );

      // "male" button should NOT have active class
      const maleBtn = screen.getByText('Male');
      expect(maleBtn).not.toHaveClass('active');
    });
  });

  describe('validation', () => {
    it('shows errors for all required fields when submitting empty form', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      await user.click(screen.getByText('Calculate My Plan'));

      expect(screen.getByText('Select your sex')).toBeInTheDocument();
      expect(screen.getByText('Enter a valid age (10–100)')).toBeInTheDocument();
      expect(screen.getByText('Enter height in cm (100–230)')).toBeInTheDocument();
      expect(screen.getByText('Enter weight in kg (30–250)')).toBeInTheDocument();
      expect(screen.getByText('Select activity level')).toBeInTheDocument();
      expect(screen.getByText('Enter target weight (40–200 kg)')).toBeInTheDocument();
    });

    it('does not validate target weight when showAdvanced is false', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserForm showAdvanced={false} />
        </TestWrapper>
      );

      await user.click(screen.getByText('Calculate My Plan'));

      // Should have all errors except target weight
      expect(screen.getByText('Select your sex')).toBeInTheDocument();
      expect(screen.queryByText('Enter target weight (40–200 kg)')).not.toBeInTheDocument();
    });

    it('clears error when user corrects a field', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialUser={{ sex: 'male' }}>
          <UserForm />
        </TestWrapper>
      );

      // Submit with only sex filled
      await user.click(screen.getByText('Calculate My Plan'));

      // Age error should appear
      expect(screen.getByText('Enter a valid age (10–100)')).toBeInTheDocument();

      // Find the age input specifically via its containing field-group
      const inputs = screen.getAllByRole('spinbutton');
      const ageField = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Age'));
      await user.type(ageField, '25');

      // Error should be cleared
      expect(screen.queryByText('Enter a valid age (10–100)')).not.toBeInTheDocument();
    });

    it('shows error for age below 10', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('spinbutton');
      const ageInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Age'));
      await user.type(ageInput, '5');
      await user.click(screen.getByText('Calculate My Plan'));

      expect(screen.getByText('Enter a valid age (10–100)')).toBeInTheDocument();
    });

    it('shows error for age above 100', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('spinbutton');
      const ageInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Age'));
      await user.type(ageInput, '120');
      await user.click(screen.getByText('Calculate My Plan'));

      expect(screen.getByText('Enter a valid age (10–100)')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls setUser and onCalculate when form is valid', async () => {
      const user = userEvent.setup();
      const setUser = vi.fn();
      const onCalculate = vi.fn();

      render(
        <TestWrapper setUser={setUser}>
          <UserForm onCalculate={onCalculate} />
        </TestWrapper>
      );

      // Fill sex
      await user.click(screen.getByText('Male'));

      // Fill age
      const inputs = screen.getAllByRole('spinbutton');
      const ageInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Age'));
      const heightInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Height'));
      const weightInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Current Weight'));
      const targetInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Target Weight'));

      await user.type(ageInput, '30');
      await user.type(heightInput, '180');
      await user.type(weightInput, '80');
      await user.type(targetInput, '75');

      // Select activity level
      await user.click(screen.getByText('Moderate (3–5 days/week)'));

      await user.click(screen.getByText('Calculate My Plan'));

      expect(setUser).toHaveBeenCalledTimes(1);
      expect(onCalculate).toHaveBeenCalledTimes(1);

      // Verify the data passed
      const formData = setUser.mock.calls[0][0];
      expect(formData.sex).toBe('male');
      expect(formData.age).toBe('30');
      expect(formData.heightCm).toBe('180');
      expect(formData.weightKg).toBe('80');
      expect(formData.targetWeightKg).toBe('75');
      expect(formData.activityKey).toBe('moderate');
    });

    it('does not call setUser when form is invalid', async () => {
      const user = userEvent.setup();
      const setUser = vi.fn();
      const onCalculate = vi.fn();

      render(
        <TestWrapper setUser={setUser}>
          <UserForm onCalculate={onCalculate} />
        </TestWrapper>
      );

      await user.click(screen.getByText('Calculate My Plan'));

      expect(setUser).not.toHaveBeenCalled();
      expect(onCalculate).not.toHaveBeenCalled();
    });
  });

  describe('auth integration', () => {
    it('does not show save button when not authenticated', () => {
      render(
        <TestWrapper
          initialUser={defaultUser}
          auth={{ isAuthenticated: false, profile: null, updateProfile: vi.fn() }}
        >
          <UserForm />
        </TestWrapper>
      );

      expect(screen.queryByText('Save to Profile')).not.toBeInTheDocument();
    });

    it('shows save button when authenticated', () => {
      render(
        <TestWrapper
          initialUser={defaultUser}
          auth={{
            isAuthenticated: true,
            profile: null,
            updateProfile: vi.fn().mockResolvedValue(undefined),
          }}
        >
          <UserForm />
        </TestWrapper>
      );

      expect(screen.getByText('Save to Profile')).toBeInTheDocument();
    });

    it('calls updateProfile when save button is clicked', async () => {
      const user = userEvent.setup();
      const updateProfile = vi.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper
          initialUser={defaultUser}
          auth={{
            isAuthenticated: true,
            profile: null,
            updateProfile,
          }}
        >
          <UserForm />
        </TestWrapper>
      );

      await user.click(screen.getByText('Save to Profile'));

      expect(updateProfile).toHaveBeenCalledTimes(1);
      expect(updateProfile).toHaveBeenCalledWith({
        sex: 'male',
        age: 30,
        height_cm: 180,
        weight_kg: 80,
        activity_key: 'moderate',
        target_weight_kg: 75,
      });
    });

    it('shows "Saved!" after successful save', async () => {
      const user = userEvent.setup();
      const updateProfile = vi.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper
          initialUser={defaultUser}
          auth={{
            isAuthenticated: true,
            profile: null,
            updateProfile,
          }}
        >
          <UserForm />
        </TestWrapper>
      );

      await user.click(screen.getByText('Save to Profile'));

      await waitFor(() => {
        expect(screen.getByText('Saved!')).toBeInTheDocument();
      });
    });

    it('pre-fills from auth profile when authenticated', () => {
      const profile = {
        sex: 'female',
        age: 25,
        height_cm: 165,
        weight_kg: 55,
        activity_key: 'active',
        target_weight_kg: 60,
      };

      render(
        <TestWrapper
          initialUser={{}}
          auth={{
            isAuthenticated: true,
            profile,
            updateProfile: vi.fn(),
          }}
        >
          <UserForm />
        </TestWrapper>
      );

      // "Female" button should be active
      expect(screen.getByText('Female')).toHaveClass('active');

      const inputs = screen.getAllByRole('spinbutton');
      const ageInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Age'));
      const heightInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Height'));
      const weightInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Current Weight'));
      const targetInput = inputs.find((el) => el.closest('.field-group')?.textContent?.includes('Target Weight'));

      expect(ageInput).toHaveValue(25);
      expect(heightInput).toHaveValue(165);
      expect(weightInput).toHaveValue(55);
      expect(targetInput).toHaveValue(60);
    });
  });

  describe('user interaction', () => {
    it('toggles sex selection between male and female', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      const maleBtn = screen.getByText('Male');
      const femaleBtn = screen.getByText('Female');

      // Initially neither active
      expect(maleBtn).not.toHaveClass('active');
      expect(femaleBtn).not.toHaveClass('active');

      await user.click(maleBtn);
      expect(maleBtn).toHaveClass('active');

      await user.click(femaleBtn);
      expect(femaleBtn).toHaveClass('active');
      expect(maleBtn).not.toHaveClass('active');
    });

    it('selects activity level on click', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserForm />
        </TestWrapper>
      );

      const activeBtn = screen.getByText('Active (6–7 days/week)').closest('.activity-chip');
      expect(activeBtn).not.toHaveClass('active');

      await user.click(activeBtn);
      expect(activeBtn).toHaveClass('active');
    });
  });
});
