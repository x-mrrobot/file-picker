# FILE PICKER

Um seletor de arquivos e pastas leve, responsivo e sem dependências, feito com HTML5, CSS3 e JavaScript puro. Projetado para uso independente ou integrado com ambientes como o Tasker no Android, ele permite navegação hierárquica, seleção múltipla, busca e cache de diretórios via localStorage.

---

## Tabela de Conteúdos

- [Demonstração](#demonstração)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como Utilizar](#como-utilizar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Demonstração

<p align="center">
  <img src="assets/preview.jpg" alt="Demonstração do seletor" />
</p>

---

## Funcionalidades

- **Navegação Hierárquica** com botão "voltar" e breadcrumbs interativos.
- **Seleção múltipla** de arquivos e pastas com contador e cópia dos caminhos.
- **Busca** dentro do diretório atual.
- **Listagem com Metadados** (tamanho de arquivos, número de itens em pastas).
- **Rendimento otimizado** com scroll infinito e cache via localStorage.
- **Internacionalização (i18n)**: Português (padrão), Inglês e Espanhol.
- **Compatível com Tasker (Android)** via script shell `file-picker.sh`.

---

## Tecnologias

- **Frontend**: HTML5 + CSS3 + JavaScript
- **Estilização**: CSS puro com variáveis CSS e responsividade via media queries.
- **Icones**: [Font Awesome](https://fontawesome.com)
- **Backend (opcional)**: Script Bash `file-picker.sh` para integração com Tasker ou outro ambiente hospedeiro.

---

## Como Utilizar

### Uso Isolado (modo demonstração)

1. Clone o repositório:

   ```
   git clone https://github.com/x-mrrobot/file-picker.git
   ```

2. Navegue para a pasta do projeto:

   ```
   cd file-picker
   ```

3. Acesse `index.html` no navegador (clique no arquivo ou abra com um servidor local).

A navegação usará dados mockados via `data.js`.

### Uso com Tasker (Android)

Para usar o seletor de arquivos diretamente no Tasker:

1. **Importe o projeto** via [TaskerNet](https://taskernet.com/shares/?user=AS35m8k%2FEQCE%2BJiPvkN1cJcjBE7Yh%2B%2Fa8zZeifxINYS7E94XnS26HrYYgsweBVnbf2VB9WJdrS5k&id=Project%3AFILE+PICKER).
3. **Mostre a cena** executando a tarefa **FP - FILE PICKER**
4. **Receba o resultado da seleção** na aba toque no link do webview.

### Uso Integrado em outros ambientes

1. O ambiente hospedeiro deve:
   - Executar comandos via `file-picker.sh`
   - Expor métodos:
     - `execute(command, ...args)`
     - `terminate()`
     - `submitSelection(items)`
2. Comandos esperados no script:
   - `list_directory "caminho"`
   - `get_sd_card`
   - `get_subfolder_item_count "caminho"`

---

## Estrutura do Projeto

```
.
├── index.html             # Entrada principal
├── css/
│   └── index.css          # Estilo completo
├── js/
│   ├── index.js           # Lógica principal da aplicação
│   ├── data.js            # Dados mockados para testes
│   └── web-environment.js # Simulação do ambiente hospedeiro
└── file-picker.sh         # Script shell para integração real
```

---

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

- Abrir *issues* com sugestões ou problemas.
- Enviar *pull requests* com melhorias, correções ou novas funcionalidades.

---

## Licença

Este projeto está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).