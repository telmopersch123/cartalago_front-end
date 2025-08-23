import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ParamMap } from '@angular/router';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../models/Product';
import { ProductService } from '../../../services/ProductService.service';

import { FormatNumber } from '../../../shared/formatNumber';
import { CurrencyValidators } from '../../../shared/validators/validators';

@Injectable({
  providedIn: 'root',
})
export class InicializadoresService {
  opcoesList = ['Lançamento', 'Sustentável', 'Edição Limitada', 'Mais Vendido'];

  constructor(
    private fb: FormBuilder,

    private productService: ProductService,
  ) {}

  inicializarFormulario(opcoesList: string[]): FormGroup {
    return this.fb.group({
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
      descricao: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(250),
        ],
      ],
      preco: [
        '',
        [
          Validators.required,
          CurrencyValidators.ValueValid(5, 'min'),
          CurrencyValidators.ValueValid(1000000, 'max'),
        ],
      ],
      checkbox_group: this.fb.array(
        opcoesList.map(() => new FormControl(false)),
        CurrencyValidators.MinSelectedCheckboxes(2),
      ),
      precoPromocional: [''],
      file_image: ['', Validators.required],
    });
  }

  FormSubscription(
    form: FormGroup,
    destroy$: Subject<void>,
    precoPromocionalAtivo$: Observable<boolean>,
  ): void {
    const precoControl = form.get('preco');
    let precoPromocionalControl = form.get('precoPromocional');

    let ativoAtual = false;

    precoPromocionalAtivo$.pipe(takeUntil(destroy$)).subscribe((ativo) => {
      ativoAtual = ativo;
      if (!ativo) {
        precoPromocionalControl?.clearValidators();
        precoPromocionalControl?.reset();
        precoPromocionalControl?.updateValueAndValidity({ emitEvent: false });
      } else {
        this.atualizarValidator(precoPromocionalControl, form);
      }
    });

    // Subscribe no precoControl
    precoControl?.valueChanges.pipe(takeUntil(destroy$)).subscribe(() => {
      if (ativoAtual) {
        this.atualizarValidator(precoPromocionalControl, form);
      }
    });

    // Subscribe no precoPromocionalControl
    precoPromocionalControl?.valueChanges
      .pipe(takeUntil(destroy$))
      .subscribe(() => {
        if (ativoAtual) {
          this.atualizarValidator(precoPromocionalControl, form);
        }
      });
  }

  atualizarValidator(
    precoPromocionalControl: AbstractControl | null,
    form: FormGroup,
  ) {
    precoPromocionalControl?.setValidators([
      Validators.required,
      CurrencyValidators.valorMaiorQueZero(),
      CurrencyValidators.atualizarErroPrecoPromocional(form),
    ]);
    precoPromocionalControl?.updateValueAndValidity({ emitEvent: false });
  }

  InitPopular(
    destroy$: Subject<void>,
    form: FormGroup,
    opcoesList: string[],
    setFileName: (name: string) => void,
    setPreviewUrl: (url: string | ArrayBuffer | null) => void,
    setProduct: (p: Product | undefined) => void,
    route: Observable<ParamMap>,
  ) {
    route
      .pipe(
        takeUntil(destroy$),
        switchMap((params) => {
          const id = params.get('id');
          if (id) return this.productService.getProductById(id);
          return of(undefined);
        }),
      )
      .subscribe((product) => {
        form.reset();

        if (product) {
          this.popularForm(
            product,
            form,
            opcoesList,
            setFileName,
            setPreviewUrl,
          );
          setProduct(product);
        }
      });
  }

  popularForm(
    product: Product,
    form: FormGroup,
    opcoesList: string[],
    setFileName: (name: string) => void,
    setPreviewUrl: (url: string | ArrayBuffer | null) => void,
  ): boolean {
    form.patchValue({
      nome: product.nome,
      descricao: product.descricao,
      preco: FormatNumber.formatNumber(product.preco),
      precoPromocional: FormatNumber.formatNumber(
        product.precoPromocional || 0,
      ),
      file_image: product.file_image,
    });

    const checkboxes = form.get('checkbox_group') as FormArray;
    checkboxes.controls.forEach((control) => control.setValue(false)); // Limpa checkboxes
    product?.checkbox_group?.forEach((tipo) => {
      const index = opcoesList.indexOf(tipo);
      if (index >= 0) {
        checkboxes.at(index).setValue(true);
      }
    });

    if (product.file_image) {
      setFileName(product.file_image);
      setPreviewUrl(`${environment.apiUrl}/uploads/${product.file_image}`);
    }

    return !!product.precoPromocional;
  }

  ngOnDestroy(destroy$: Subject<void>): void {
    destroy$.next();
    destroy$.complete();
  }
}
