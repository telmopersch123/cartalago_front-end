import type { CanDeactivateFn } from '@angular/router';
import { Messages } from '../shared/mensagesPersonalizadas/mensages';

export interface FormValidator {
  hasValidator(): boolean;
}

export const protetorGuard: CanDeactivateFn<unknown> = (
  component,
  currentRoute,
  currentState,
  nextState,
) => {
  const formComponent = component as FormValidator & { isSubmitted: boolean };

  if (
    formComponent.hasValidator &&
    formComponent.hasValidator() &&
    !formComponent.isSubmitted
  ) {
    return Messages.MensagemSair();
  }

  return true;
};
