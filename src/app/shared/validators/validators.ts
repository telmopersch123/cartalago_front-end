import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { FormatNumber } from '../formatNumber';

export class CurrencyValidators {
  static ValidatorNfIf(campo: string, form: FormGroup): boolean {
    // Validação de campos do form, se for invalido, retorna true
    const control = form.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  static ValueValid(value: number, type: 'min' | 'max'): ValidatorFn {
    // Validação de preços, de menor, e maior no formulário
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      let valor = control.value;
      valor = valor.replace('R$', '').trim().replace(/\./g, '');
      valor = valor.replace(',', '.');
      let numericValue = parseFloat(valor);
      if (isNaN(numericValue)) return null;
      if (type === 'min') {
        return numericValue < value
          ? { minValue: { required: value, actual: numericValue } }
          : null;
      }
      if (type === 'max') {
        return numericValue > value
          ? { maxValue: { required: value, actual: numericValue } }
          : null;
      }
      return null;
    };
  }

  static atualizarErroPrecoPromocional(form: FormGroup): ValidatorFn {
    // Validação do campo preço promocional e preço normal, se preço promoção e mais alto, retorna erro
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const precoNormal = FormatNumber.parsePrice(form.get('preco')?.value);
      const precoPromo = FormatNumber.parsePrice(control.value);

      if (precoPromo >= precoNormal) {
        return { menorQueMinimo: { valorMaximo: precoNormal } };
      }

      return null;
    };
  }

  static valorMaiorQueZero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      let valor = control.value;
      valor = valor.replace('R$', '').trim().replace(/\./g, '');
      valor = valor.replace(',', '.');
      let numericValue = parseFloat(valor);
      if (isNaN(numericValue)) return null;
      return numericValue > 0 ? null : { valorZero: true };
    };
  }

  static MinSelectedCheckboxes(min = 2): ValidatorFn {
    // validação de checkbox de mínimo selcionados
    return (formArray: AbstractControl): ValidationErrors | null => {
      if (!(formArray instanceof FormArray)) return null;

      const totalSelected = formArray.controls
        .map((control) => control.value)
        .reduce((prev, next) => (next ? prev + 1 : prev), 0);

      return totalSelected >= min
        ? null
        : { minSelected: { required: min, actual: totalSelected } };
    };
  }

  // static togglePromocao(enable: boolean, form: FormGroup) {
  //   const precoControl = form.get('precoPromocional');
  //   if (!precoControl) return;

  //   if (enable) {
  //     precoControl.setValidators([
  //       Validators.required,
  //       CurrencyValidators.ValueValid(2, 'min'),
  //       CurrencyValidators.ValueValid(1000000, 'max'),
  //     ]);
  //     precoControl.enable();
  //   } else {
  //     precoControl.reset();
  //     precoControl.clearValidators();
  //     precoControl.disable();
  //   }

  //   precoControl.updateValueAndValidity();
  // }
}
