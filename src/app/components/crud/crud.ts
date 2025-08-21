import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../models/Product';
import { ProductService } from '../../services/ProductService.service';
import { Messages } from '../../shared/mensagesPersonalizadas/mensages';

@Component({
  selector: 'app-crud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud.html',
  styleUrl: './crud.scss',
})
export class Crud {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    //Código responsavel por carregar os produtos ao iniciar
    this.productService.getProducts().subscribe({
      next: (data) => (this.products = data),
      error: (error) => console.log(error),
    });
  }

  deleteProduct(id: string) {
    // Código responsavel por deletar os produtos com base no id
    Messages.MensagemErroPergunta().then((confirm: boolean) => {
      if (!confirm) return;
      this.productService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: (error) => console.log(error),
      });
    });
  }

  editProduct(product: Product) {
    //  Código responsavel por redirecionar para editar os produtos com base no id
    this.router.navigate(['form', product.id]);
  }

  createProduct() {
    // Código responsavel por redirecionar para criar os produtos
    this.router.navigate(['form']);
  }
}
