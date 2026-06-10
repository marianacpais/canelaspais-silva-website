# Canelas Pais & Silva — Website

Landing page estática para **Canelas Pais & Silva, Lda** (`www.canelaspais-silva.pt`).
Implementada a partir do design book da marca (paleta Floresta + Dourado, tipografia Sora).

## Ficheiros

| Ficheiro | O que é |
|---|---|
| `index.html` | A página completa — HTML + CSS + JS, sem build step |
| `favicon.svg` | O símbolo da marca (gradientes por faceta), usado como favicon |

## Estrutura da página

- **Hero** — o símbolo constrói-se peça a peça (**C → P → S**), os gradientes acendem com o glow dourado, segura o logo completo ~4 s e faz loop suave.
- **Contacto** — formulário (nome, email, empresa, mensagem) + detalhes (email, morada, web).
- **Footer** — razão social e NIPC.
- **Toggle PT/EN** — alterna toda a copy da página.

## Abrir localmente

É estático — basta abrir `index.html` no browser. Para testar com servidor:

```sh
cd canelas-pais-silva-website
python3 -m http.server 8000   # → http://localhost:8000
```

## Activar o formulário (Formspree)

O formulário está cablado para o [Formspree](https://formspree.io) mas em **modo
demo** (mostra o sucesso sem enviar nada). Para o pôr a funcionar a sério:

1. Cria conta gratuita em formspree.io (50 mensagens/mês no plano free).
2. **+ New Form** → copia o endpoint (ex.: `https://formspree.io/f/xpwzqabc`).
3. Em `index.html`, substitui `YOUR_FORM_ID` na constante `FORMSPREE_URL`.

## Deploy (Cloudflare Pages)

O DNS do domínio está no Cloudflare, por isso o deploy mais simples é o
**Cloudflare Pages** (HTTPS automático, apex nativo, sem configuração de SSL):

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → escolhe este repo.
2. Build settings: **Framework preset = None**, **Build command =** (vazio),
   **Output directory =** `/` (a raiz — o site é estático, não tem build).
3. Após o primeiro deploy: **Custom domains** → adiciona `www.canelaspais-silva.pt`
   (e o apex `canelaspais-silva.pt` com redirect para o `www`, ou vice-versa).
   O Cloudflare cria os registos e o certificado sozinho.

Cada `git push` para `main` redeploya automaticamente.

## Acessibilidade

Respeita `prefers-reduced-motion`: com a opção activa, o logo aparece já
completo e a animação/loop não corre.
