export type RecuperarSenhaPayload = {
  username?: string;    

    new_pass: string;
    uid: string;
    token: string;
    new_pass_confirm: string;
  };


  export type EsqueciSenhaPayload = {
    username: string;    
  };

  