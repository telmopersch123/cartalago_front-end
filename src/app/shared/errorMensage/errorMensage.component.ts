import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FormatNumber } from '../formatNumber';

@Component({
  selector: 'app-error-mensage',
  imports: [CommonModule],
  standalone: true,
  template: `<!-- Mensagem de erro -->
    <div class="alert alert--error" role="alert" aria-live="assertive">
      <span class="alert__icon" aria-hidden="true"></span>
      <div class="alert__content">
        {{ campo !== '' ? 'O campo' : '' }}<strong> {{ campo }}</strong
        >{{ getMessage() }}
      </div>
    </div> `,
  styleUrl: './errorMensage.component.scss',
})
export class ErrorMensageComponent {
  @Input() campo?: string = ' ';
  @Input() message: AbstractControl | any = '';

  getMessage(): any {
    if (!this.message) return '';
    const value = this.message.value;
    switch (true) {
      case this.message.hasError('required'):
        return 'é obrigatório';

      case this.message.hasError('minlength') && value?.length > 0:
        return `deve ter pelo menos ${this.message.errors?.minlength.requiredLength} caracteres`;

      case this.message.hasError('maxlength'):
        return `deve ter no máximo ${this.message.errors?.maxlength.requiredLength} caracteres`;

      case this.message.hasError('maxValue'):
        return 'valor máximo permitido é R$ 1.000,00';

      case this.message.hasError('minValue'):
        return `deve ter o valor mínimo de R$ ${this.message.errors?.minValue.required},00`;

      case this.message.hasError('minSelected'):
        return `selecione pelo menos ${this.message.errors?.minSelected.required} opções`;

      case this.message.hasError('menorQueMinimo'):
        return `deve ser menor que o preço normal (máx: ${FormatNumber.formatNumber(this.message.errors?.menorQueMinimo.valorMaximo)})`;

      default:
        return '';
    }
  }
}
