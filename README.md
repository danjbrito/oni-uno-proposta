# Proposta de site — ONI UNO

Proposta visual de redesign do site institucional da ONI UNO (ateliê de gelato), com versões **computador** e **mobile**.

## Cardápios por loja (QR)

Páginas pensadas para QR code no balcão:

- Sudoeste: `cardapio-sudoeste.html`
- Asa Norte: `cardapio-asa-norte.html`

O site principal (`index.html`) aponta para esses cardápios em vez de listar sabores e preços.

## Gestão online

A página `gestao.html` (link **Gestão do cardápio** na barra da proposta) permite à equipe:

- ligar e desligar sabores da vitrine de cada loja
- incluir, editar ou remover sabores
- ajustar nomes, descrições e preços de tamanhos, sobremesas e cafeteria

As alterações aparecem na hora nas páginas de cardápio deste navegador, sem gerar HTML de novo. Senha de acesso: pedir à equipe da proposta.

## Como visualizar

Abra `index.html` no navegador, ou sirva a pasta localmente:

```bash
cd proposta-site
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

Use a barra no topo (**Computador** / **Mobile**) para alternar a pré-visualização.

## Base da proposta

- Conteúdo e estrutura: [oni-uno.com](https://www.oni-uno.com) e [oni-uno.com/home](https://www.oni-uno.com/home)
- Tom e atmosfera: Instagram [@oniunogelato](https://www.instagram.com/oniunogelato)
- Imagens: banco anexado em `images/`

## Direção criativa

- Marca em primeiro plano no hero (ONI UNO como sinal principal)
- Fotografia lifestyle + ingredientes (tom do Instagram)
- Logo oficial circular (laranja) do site oni-uno.com
- Paleta: laranja da marca `#f05a2f`, teal (copos), papel claro
- Tipografia alinhada ao site atual: Fira Sans (títulos) + Montserrat (UI/texto)
