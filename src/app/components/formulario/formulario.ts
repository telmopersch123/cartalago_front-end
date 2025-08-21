import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { FormValidator } from '../../Guards/Protetor.guard';
import { Product } from '../../models/Product';
import { ProductService } from '../../services/ProductService.service';
import { ErrorMensageComponent } from '../../shared/errorMensage/errorMensage.component';
import { FormatNumber } from '../../shared/formatNumber';
import { CurrencyValidators } from '../../shared/validators/validators';

import { InicializadoresService } from './services/Inicializadores.service';
import { SubmitService } from './services/SubmitService.service';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorMensageComponent,
    RouterModule,
  ],
  styleUrls: ['./formulario.scss'],
})
export class FormularioComponent implements OnInit, OnDestroy, FormValidator {
  isSubmitted: boolean = false;
  selectedFile: File | null = null;
  productToEdit?: Product;
  form: FormGroup = new FormGroup({});
  fileName: string = '';
  previewUrl: string | ArrayBuffer | null | undefined = null;
  precoPromocionalAtivo: boolean = false;
  opcoesList: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private submitService: SubmitService,
    private inicializadoresService: InicializadoresService,
  ) {}

  ngOnInit() {
    this.opcoesList = this.inicializadoresService.opcoesList;
    this.form = this.inicializadoresService.inicializarFormulario(
      this.opcoesList,
    );

    this.inicializadoresService.FormSubscription(this.form, this.destroy$);

    this.inicializadoresService.InitPopular(
      this.destroy$,
      this.form,
      this.opcoesList,
      (name) => (this.fileName = name),
      (url) => (this.previewUrl = url),
      (product) => {
        this.productToEdit = product;
        this.precoPromocionalAtivo = Boolean(
          product?.precoPromocional || false,
        );
      },
      this.route.paramMap,
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const formData = this.submitService.createFormData(
      this.form,
      this.opcoesList,
      this.selectedFile,
      this.precoPromocionalAtivo,
    );

    this.submitService
      .saveProduct(formData, this.productToEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitted = true;
        },
        error: () => {
          this.isSubmitted = false;
        },
      });
  }

  ///////////////////////

  onPrecoChange(event: Event, campo: AbstractControl | null) {
    //Código responsável por formatar o preço do produto
    const input = event.target as HTMLInputElement;
    const valorFormatado = FormatNumber.formatNumber(input.value);
    campo?.setValue(valorFormatado);
    input.value = valorFormatado;
  }

  isInvalid(formCampo: string): boolean {
    //Código responsável por verificar se o campo do formulário está inválido
    return CurrencyValidators.ValidatorNfIf(formCampo, this.form);
  }

  toggle(isPromocao: boolean) {
    //Código responsável por ativar ou desativar o preço promocional
    this.precoPromocionalAtivo = isPromocao;
    // CurrencyValidators.togglePromocao(this.precoPromocionalAtivo, this.form);
  }

  onFileSelected(event: Event) {
    //Código responsável por selecionar o arquivo da imagem
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (file) {
      this.selectedFile = file;
      this.form.get('file_image')?.setValue(file);
      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.form.get('file_image')?.setValue(null);
      this.fileName = '';
      this.previewUrl = null;
    }
  }

  hasValidator(): boolean {
    //Código responsável por verificar se o formulário foi alterado
    return this.form.dirty;
  }
}
