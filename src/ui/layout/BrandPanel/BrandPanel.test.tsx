import { render, screen } from '@testing-library/react';
import { BrandPanel } from './BrandPanel';
it('FR-020 variante de Registro sin alterar contenido por defecto de Login', () => {
  const { rerender } = render(<BrandPanel />);
  expect(screen.getByText(/Tu dinero,/)).toBeInTheDocument();
  rerender(<BrandPanel variant="registration" />);
  expect(screen.getByText(/Comienza tu/)).toBeInTheDocument();
  expect(screen.getByText(/Crea tu cuenta en minutos/)).toBeInTheDocument();
});
