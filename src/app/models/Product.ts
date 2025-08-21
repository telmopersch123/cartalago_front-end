export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoPromocional?: number;
  checkbox_group: string[];
  file_image: string;
}
