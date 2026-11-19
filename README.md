# Quadro

Quadro infinito pessoal, feito para desenhar com mesa digitalizadora, escrever, montar mapas mentais, tabelas com fórmulas, imagens e setas. Tem abas de quadros, estética *liquid glass* e tema claro/escuro.

É feito em JavaScript puro, sem dependências e sem build. É só abrir o `index.html` ou publicar no GitHub Pages. Tudo fica salvo no navegador (IndexedDB).

## Recursos

- **Quadro infinito** com zoom (Ctrl + rodinha ou pinça) e movimento (Espaço + arrastar, botão do meio, dois dedos ou a ferramenta Mão).
- **Caneta com pressão**, marca-texto e borracha. Os traços são suavizados e a espessura acompanha a pressão.
- **Botões da caneta configuráveis** (⚙): segurar para apagar, segurar para mover o quadro, alternar entre caneta e seleção, alternar entre caneta e borracha, ou desfazer. A ponta de borracha da caneta apaga sozinha. Tem uma área de teste para ver quais botões a mesa envia.
- **Só a caneta desenha**: com essa opção, o dedo só move o quadro e a palma é ignorada enquanto você escreve.
- **Mapas mentais**: crie uma nota (N), selecione e aperte **Tab** para criar uma ramificação ligada por seta, ou **Shift+Tab** para criar um ramo irmão. As setas acompanham os elementos quando você os arrasta.
- **Tabelas** (G) com fórmulas no estilo planilha: `=SOMA(B2:B5)`, `=MEDIA(...)`, `=MIN`, `=MAX`, `=CONT`, `=ARRED(A1;2)` e contas como `=A2*B2`. Aceita vírgula decimal. Dá para colar direto do Excel ou do Google Sheets, ou importar CSV.
- **Formas** (retângulo, elipse, losango) com texto dentro, **setas** e **linhas** que grudam nas formas, **texto** com negrito/itálico (Ctrl+B / Ctrl+I) e **imagens** (colar, arrastar ou inserir).
- **Abas**: vários quadros. Clique duplo renomeia; arrastar reorganiza.
- **Tema claro/escuro** com interruptor de sol e lua (dá para arrastar) e transição circular. No modo automático, acompanha o tema do sistema.
- **Exportar** em PNG ou SVG (o quadro todo ou só o que estiver selecionado), além de **backup** de todos os quadros em JSON.
- Desfazer e refazer por quadro, duplicar, copiar e colar entre abas, e trazer para frente ou enviar para trás.

## Atalhos

Todos os atalhos abaixo podem ser trocados em **Configurações → Atalhos de teclado**. Cada ação aceita mais de uma combinação (por exemplo `Ctrl+Z` e `Ctrl+Alt+J` para desfazer), com Ctrl, Alt e Shift. Se uma combinação já estiver em uso, ela passa para a nova ação.

| Ferramenta | Tecla | | Ação | Tecla |
|---|---|---|---|---|
| Selecionar | V | | Ramificar | Tab |
| Mão | H / Espaço | | Ramo irmão | Shift+Tab |
| Caneta | P | | Editar | Enter / clique duplo |
| Marca-texto | M | | Desfazer / refazer | Ctrl+Z / Ctrl+Shift+Z |
| Borracha | E | | Duplicar | Ctrl+D |
| Retângulo / Elipse / Losango | R / O / D | | Excluir | Delete |
| Seta / Linha | A / L | | Zoom 100% | Ctrl+0 |
| Texto | T (ou clique duplo no vazio) | | Enquadrar tudo | Shift+1 |
| Nota | N | | Todos os atalhos | ? |
| Tabela / Imagem | G / I | | | |

## Publicar no GitHub Pages

Settings → Pages → *Deploy from a branch* → `main` / `(root)`. O endereço fica `https://<usuário>.github.io/quadro-infinito/`.

## Dicas para a mesa digitalizadora

- No Windows, deixe o **Windows Ink** ligado no driver (Wacom, XP-Pen, Huion…) para o navegador receber a pressão.
- Se o driver estiver mandando "clique direito" no botão lateral, funciona igual: o Quadro trata isso como botão lateral.
- Se preferir, mapeie os botões para teclas (P, E, V, Ctrl+Z…) no próprio driver.
