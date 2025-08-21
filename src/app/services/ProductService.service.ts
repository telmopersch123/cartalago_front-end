import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/Product';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient) {}

  //Listar todos os produtos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  //Buscar produto por ID
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
  //Criar produto com upload de imagem
  createProduct(product: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
  //Atualizar produto com upload de imagem
  updateProduct(id: string, product: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }
  //Remover produto
  deleteProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/${id}`);
  }
}
