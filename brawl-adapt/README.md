# Brawl Adapt — Protótipo Fase 1

Primeiro passo do "Brawl Stars da Adapt": um protótipo solo pra sentir o
movimento, a mira e o tiro antes de entrar em multiplayer de verdade.

## Rodar

Só abrir o `index.html` no navegador. Não precisa de servidor, build ou
instalação — é HTML/CSS/JS puro, sem dependências além das fontes do Google
Fonts.

Pra subir no GitHub Pages:

1. Cria um repositório novo no GitHub
2. Sobe estes arquivos na raiz do repositório
3. Em Settings → Pages, ativa o GitHub Pages apontando pra branch principal
4. O jogo fica disponível em `https://<seu-usuario>.github.io/<repo>/`

## Controles

- **WASD** — mover (o corpo do personagem acompanha a direção do movimento)
- **Mouse** — mirar (a arma sempre aponta pro cursor, independente de pra
  onde você está andando — dá pra atirar de lado enquanto foge, por exemplo)
- **Clique** (segurar ou clicar) — atirar. 3 tiros no pente, recarrega um
  por vez sozinho
- **Espaço** — usa o Super quando a barra estiver cheia. Carrega acertando
  qualquer coisa, seja Pilar de Report ou Caixa de Briefing
- **R** — reinicia a arena (personagem volta ao centro, caixas voltam
  inteiras)

## O que tem nessa fase

- Movimento e mira desacoplados, igual ao joystick duplo do jogo original
- Munição com recarga automática e cooldown de tiro
- Super que carrega com dano e libera um disparo em leque mais forte, com
  tremida de tela
- **Pilares de Report** — obstáculos indestrutíveis, bloqueiam tiro e
  movimento
- **Caixas de Briefing** — obstáculos destrutíveis (3 hits), explodem em
  partículas e voltam a aparecer depois de alguns segundos pra dar pra
  testar à vontade
- **Zonas de Baixo CTR** — áreas de "arbusto": o personagem fica
  parcialmente transparente dentro delas, protótipo da mecânica de stealth
  do jogo original
- Feedback visual: flash de disparo, faísca de impacto, sombra do
  personagem, vinheta de arena

## O que não tem ainda (de propósito)

Essa fase é só sobre o feel do movimento e da mira, sozinho. Ainda não tem:

- Multiplayer — isso é a fase 2, com Supabase Realtime sincronizando os
  jogadores num canal por sala
- Sistema de sala/lobby
- Os brawlers de verdade baseados no time de tráfego — isso é a fase 3,
  depois de fechar o elenco e o "vibe" de cada um
- Vida, dano no jogador e condição de vitória (isso entra junto com o
  multiplayer, quando existir alguém pra brigar)

## Design

Paleta escura com teal, dourado e detalhes em vermelho, tipografia Barlow
Condensed (títulos/HUD) + DM Sans (texto) — a mesma linha visual usada nas
apresentações internas da Adapt, adaptada pro clima arcade.

Os obstáculos brincam com o universo de tráfego pago em vez de usar
grama/pedra genéricas: Pilares de Report (paredes) e Caixas de Briefing
(crates destrutíveis) seguem a mesma lógica de piada interna que o Adaptia
RPG já usa com o Dragão do CPA Alto e companhia.

## Estrutura de arquivos

```
brawl-adapt/
  index.html          tela de menu, canvas e HUD
  style.css            HUD, menu, tipografia e paleta
  js/
    utils.js           matemática e colisão (clamp, ângulos, círculo x retângulo)
    constants.js        dimensão da arena, paleta de cores, layout dos obstáculos
    particles.js         sistema de partículas (impacto, explosão, disparo)
    entities.js           Player, Wall, Crate, Projectile
    input.js              teclado e mouse
    main.js                 loop do jogo, física, renderização, HUD
  README.md
```

## Próximos passos

1. Fechar o elenco do time de tráfego e o "vibe" de cada pessoa (isso
   define ataque + Super de cada brawler)
2. Plugar Supabase Realtime pra sincronizar dois ou mais jogadores na
   mesma arena
3. Sistema de sala — criar/entrar, reaproveitando o padrão de sessão que
   já existe no Adaptia
4. Trocar o personagem genérico pelos brawlers de verdade
