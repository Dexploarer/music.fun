import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '../../../test/test-utils';
import { SecuritySettingsForm } from '../SecuritySettingsForm';

const updateSecuritySettings = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    userProfile: {
      id: '1',
      email: 'test@example.com',
      security_settings: { sessionTimeout: 15, passwordExpiryDays: 90 },
      two_factor_auth: { isEnabled: false }
    },
    updateSecuritySettings
  })
}));

vi.mock('react-hot-toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('SecuritySettingsForm', () => {
  it('renders default values', () => {
    render(<SecuritySettingsForm />);

    expect(screen.getByLabelText('Session Timeout (minutes)')).toHaveValue(15);
    expect(screen.getByLabelText('Password Expiry (days)')).toHaveValue(90);
    expect(screen.getByText('Enable')).toBeInTheDocument();
  });

  it('updates settings on save', async () => {
    render(<SecuritySettingsForm />);
    fireEvent.change(screen.getByLabelText('Session Timeout (minutes)'), {
      target: { value: 20 }
    });
    fireEvent.click(screen.getByText('Save'));

    expect(updateSecuritySettings).toHaveBeenCalledWith({
      sessionTimeout: 20,
      passwordExpiryDays: 90
    });
  });
});
