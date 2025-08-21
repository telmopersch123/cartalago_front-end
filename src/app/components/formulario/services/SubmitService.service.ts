import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from '../../../models/Product';
import { ProductService } from '../../../services/ProductService.service';
import { FormatNumber } from '../../../shared/formatNumber';
import { Messages } from '../../../shared/mensagesPersonalizadas/mensages';

@Injectable({
  providedIn: 'root',
})
export class SubmitService {
  private productService: ProductService;
  private router: Router;
  constructor(ProductService: ProductService, router: Router) {
    this.productService = ProductService;
    this.router = router;
  }
  saveProduct(
    formData: FormData,
    productToEdit: Product | undefined,
  ): Observable<void> {
    //código responsável por salvar ou editar os valores do formulário no backend
    const action = productToEdit
      ? this.productService.updateProduct(productToEdit.id, formData)
      : this.productService.createProduct(formData);

    return new Observable<void>((observer) => {
      action.subscribe({
        next: () => {
          this.router.navigate(['/crud']);
          const mensagem = productToEdit
            ? 'Produto atualizado com sucesso!'
            : 'Produto criado com sucesso!';
          Messages.Mensagem(mensagem, 'success');
          observer.next();
        },
        error: (error) => {
          const errorMessage =
            error.status === 400
              ? 'Dados inválidos. Verifique os campos e tente novamente.'
              : 'Ocorreu um erro ao salvar o produto. Tente novamente mais tarde.';
          Messages.Mensagem(errorMessage, 'error');
          console.error('Erro ao salvar produto:', error);
          observer.error(error);
        },
      });
    });
  }

  createFormData(
    form: FormGroup,
    opcoesList: string[],
    selectedFile: File | null,
    precoPromocionalAtivo: boolean,
  ): FormData {
    //código responsavel por criar um FormData com os dados do formulário para enviar pro backend
    const formData = new FormData();
    formData.append('nome', form.get('nome')?.value);
    formData.append('descricao', form.get('descricao')?.value);
    formData.append(
      'preco',
      FormatNumber.parsePrice(form.get('preco')?.value).toString(),
    );

    const tiposSelecionados = form.value.checkbox_group
      .map((checked: boolean, i: number) => {
        return checked ? opcoesList[i] : null;
      })
      .filter((tipo: string | null) => tipo !== null);
    formData.append('checkbox_group', JSON.stringify(tiposSelecionados));

    if (precoPromocionalAtivo && form.get('precoPromocional')?.value) {
      const precoNumber = FormatNumber.parsePrice(
        form.get('precoPromocional')?.value,
      );
      formData.append('precoPromocional', precoNumber.toString());
    }

    const file: File | null = selectedFile;
    if (file) {
      formData.append('file_image', file);
    }
    return formData;
  }
}
