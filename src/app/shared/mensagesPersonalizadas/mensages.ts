import Swal, { SweetAlertIcon } from 'sweetalert2';

export class Messages {
  static MensagemErroPergunta(): Promise<boolean> {
    return Swal.fire({
      title: 'Você tem certeza?',
      text: ' Deseja excluir o produto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, quero Apagar!',
      scrollbarPadding: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Apagado!',
          text: 'Produto escolhido foi apagado com sucesso.',
          icon: 'success',
        });
        return true;
      }
      return false;
    });
  }

  static Mensagem(mensagem: string, type: SweetAlertIcon): void {
    Swal.fire({
      title: 'Pronto!',
      text: mensagem,
      icon: type,
      scrollbarPadding: false,
    });
  }

  static MensagemSair(): Promise<boolean> {
    return Swal.fire({
      title: 'Você realmentre que sair sem salvar?',
      showDenyButton: true,
      showConfirmButton: false,
      showCancelButton: true,
      denyButtonText: `Sim, sair sem salvar`,
      cancelButtonText: 'Não',
      scrollbarPadding: false,
    }).then((result) => {
      if (result.isDenied) {
        return true;
      } else {
        return false;
      }
    });
  }
}
