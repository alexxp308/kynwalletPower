import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TermsDialog } from './TermsDialog';
it('FR-021 abre términos de demostración y vuelve al activador', async () => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
  render(<TermsDialog />);
  const trigger = screen.getByRole('button', { name: 'términos y condiciones' });
  await userEvent.click(trigger);
  expect(screen.getByText('Contenido de demostración, sin validez legal')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  expect(trigger).toHaveFocus();
});
