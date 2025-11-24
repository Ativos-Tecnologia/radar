# 🎨 Logos do Sistema Radar

## 📁 Localização

As logos devem ser colocadas nesta pasta: `front-end/public/`

## 📋 Arquivos Necessários

### Logo para Tema Claro
- **Nome do arquivo:** `logo-dark.png`
- **Descrição:** Logo em azul escuro
- **Usado quando:** Tema claro está ativo
- **Dimensões sugeridas:** 240x80px (ou proporcional)
- **Formato:** PNG com fundo transparente

### Logo para Tema Escuro
- **Nome do arquivo:** `logo-light.png`
- **Descrição:** Logo branca
- **Usado quando:** Tema escuro está ativo
- **Dimensões sugeridas:** 240x80px (ou proporcional)
- **Formato:** PNG com fundo transparente

## 📐 Especificações Técnicas

### Dimensões
- **Largura máxima:** 120px (ajustada automaticamente)
- **Altura máxima:** 32px (h-8 no Tailwind)
- **Proporção:** Mantida automaticamente

### Formatos Aceitos
- PNG (recomendado - suporta transparência)
- SVG (alternativa - escalável)
- JPG/JPEG (não recomendado - sem transparência)
- WEBP (moderno - boa compressão)

## 🎯 Onde a Logo Aparece

A logo é exibida no **header superior** do dashboard, ao lado do botão de menu.

### Comportamento
- **Tema Claro:** Mostra `logo-dark.png` (azul escuro)
- **Tema Escuro:** Mostra `logo-light.png` (branca)
- **Transição:** Automática ao alternar o tema
- **Responsivo:** Ajusta-se automaticamente ao tamanho da tela

## 📝 Estrutura de Arquivos

```
front-end/
├── public/
│   ├── logo-dark.png     ← Logo azul escuro (tema claro)
│   ├── logo-light.png    ← Logo branca (tema escuro)
│   └── README-LOGOS.md   ← Este arquivo
```

## 🔧 Como Alterar

### Substituir as Logos
1. Prepare suas imagens nos formatos corretos
2. Renomeie para `logo-dark.png` e `logo-light.png`
3. Coloque na pasta `front-end/public/`
4. Reinicie o servidor de desenvolvimento (se estiver rodando)

### Ajustar Tamanho
Edite o arquivo `front-end/src/components/dashboard-layout.tsx`:

```tsx
<Image
  src={theme === 'light' ? '/logo-dark.png' : '/logo-light.png'}
  alt="Radar Logo"
  width={120}        // ← Ajustar largura
  height={40}        // ← Ajustar altura
  priority
  className="h-8 w-auto"  // ← Ajustar classe Tailwind
/>
```

### Usar SVG (Alternativa)
Se preferir usar SVG:

1. Renomeie para `logo-dark.svg` e `logo-light.svg`
2. Atualize o código:
```tsx
<Image
  src={theme === 'light' ? '/logo-dark.svg' : '/logo-light.svg'}
  alt="Radar Logo"
  width={120}
  height={40}
  priority
  className="h-8 w-auto"
/>
```

## ✅ Checklist

- [ ] Logo azul escuro criada (`logo-dark.png`)
- [ ] Logo branca criada (`logo-light.png`)
- [ ] Ambas com fundo transparente
- [ ] Arquivos colocados em `front-end/public/`
- [ ] Testado no tema claro
- [ ] Testado no tema escuro
- [ ] Tamanho adequado no header

## 🎨 Dicas de Design

### Para Logo Azul Escuro (Tema Claro)
- Cor sugerida: `#1e3a8a` ou similar
- Contraste bom com fundo branco
- Legível e profissional

### Para Logo Branca (Tema Escuro)
- Cor: `#ffffff` puro
- Contraste bom com fundo escuro
- Mesma forma da logo azul

### Otimização
- Comprimir imagens para web
- Manter qualidade visual
- Tamanho de arquivo < 50KB cada

## 🚀 Deploy

Ao fazer deploy em produção, certifique-se de:
1. Incluir ambas as logos no build
2. Verificar se os caminhos estão corretos
3. Testar em ambos os temas
4. Verificar carregamento rápido

## 📞 Suporte

Se tiver problemas:
1. Verifique se os nomes dos arquivos estão corretos
2. Confirme que estão na pasta `public/`
3. Limpe o cache do Next.js: `rm -rf .next`
4. Reinicie o servidor: `npm run dev`
