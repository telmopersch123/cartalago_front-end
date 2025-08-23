import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
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
  precoPromocionalAtivo$ = new BehaviorSubject<boolean>(false);
  opcoesList: string[] = [];
  isLoading: boolean = false;
  isLoadingImage: boolean = false;
  products: Product[] = [];
  jaExiste: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private submitService: SubmitService,
    private inicializadoresService: InicializadoresService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.opcoesList = this.inicializadoresService.opcoesList;
    this.form = this.inicializadoresService.inicializarFormulario(
      this.opcoesList,
    );

    this.inicializadoresService.FormSubscription(
      this.form,
      this.destroy$,
      this.precoPromocionalAtivo$,
    );

    this.inicializadoresService.InitPopular(
      this.destroy$,
      this.form,
      this.opcoesList,
      (name) => (this.fileName = name),
      (url) => (this.previewUrl = url),
      (product) => {
        this.productToEdit = product;
        this.precoPromocionalAtivo$.next(
          Boolean(product?.precoPromocional || false),
        );

        if (product?.file_image) {
          this.isLoadingImage = true;
          this.previewUrl = product.file_image;
          this.fileName = product.file_image.split('/').pop() || '';
        }
        this.isLoading = false;
      },
      this.route.paramMap,
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.renderer.removeStyle(document.body, 'overflow');
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    this.productService
      .getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((products) => {
        this.jaExiste = products.some(
          (p) => p.nome === this.form.get('nome')?.value,
        );
        if (this.jaExiste && !this.productToEdit) {
          this.isLoading = false;
          this.isSubmitted = false;
          return;
        }

        const formData = this.submitService.createFormData(
          this.form,
          this.opcoesList,
          this.selectedFile,
          this.precoPromocionalAtivo$.getValue(),
        );

        this.submitService
          .saveProduct(formData, this.productToEdit)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isSubmitted = true;
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
              this.isSubmitted = false;
            },
          });
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
    this.precoPromocionalAtivo$.next(isPromocao);
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
      reader.onerror = () => {
        this.previewUrl = null;
        this.fileName = '';
        this.form.get('file_image')?.setValue(null);
        this.selectedFile = null;
      };

      reader.readAsDataURL(file);
    } else {
      this.form.get('file_image')?.setValue(null);
      this.fileName = '';
      this.previewUrl = null;
    }
  }
  // quando a imagem terminar de carregar
  onImageLoad() {
    this.isLoadingImage = false;
    this.cdr.detectChanges();
  }

  // se der erro no carregamento
  onImageError() {
    this.isLoadingImage = false;
    this.previewUrl = null;
    this.fileName = '';
    this.selectedFile = null;
    this.form.get('file_image')?.setValue(null);
    this.cdr.detectChanges();
  }
  hasValidator(): boolean {
    //Código responsável por verificar se o formulário foi alterado
    return this.form.dirty;
  }
}
