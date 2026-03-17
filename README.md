# 🪵 ProPiso&Deck

Um sistema de gestão e automação de orçamentos focado em projetos de instalação, restauração e manutenção de pisos de madeira e decks. 

## 🎯 Foco do Projeto

O **ProPiso&Deck** foi desenvolvido para resolver a complexidade da precificação no setor de pisos e decks de madeira. O sistema centraliza o cadastro de insumos (madeiras, químicos e ferragens) e oferece uma interface dinâmica onde o profissional pode montar propostas comerciais precisas em tempo real.

O objetivo principal é dar total controle sobre o que será fornecido pelo prestador de serviço e o que será adquirido pelo cliente, automatizando os cálculos de subtotais, mão de obra e gerando propostas com termos de aceite e controle automático de validade (expiração de propostas).

## ✨ Principais Funcionalidades

- **Catálogo de Materiais:** Gestão de insumos base (madeiras, colas, vernizes, pregos) organizados por categoria e unidade de medida.
- **Orçamentos Dinâmicos:** Inserção de materiais sob demanda com recálculo imediato de custos totais e parciais.
- **Gestão de Fornecimento:** Toggle intuitivo para definir se um item está incluso no valor final ou se será comprado à parte pelo cliente.
- **Controle de Prazos e Condições:** Geração automática de datas de validade (15 dias) e inclusão de termos de aceite e observações técnicas da obra.
- **Integração Cloud:** Dados sincronizados e armazenados de forma segura (via Firebase).

## 🚀 Tecnologias Utilizadas

- **[Angular 20](https://angular.dev/):** Framework principal da aplicação (SPA).
- **TypeScript:** Tipagem estática para maior segurança e previsibilidade do código.
- **SCSS:** Estilização responsiva, modular e baseada em CSS Grid/Flexbox.
- **Firebase:** (Firestore) Backend as a Service para persistência de dados.

---

## 🛠️ Instruções de Desenvolvimento

Este projeto foi gerado com o [Angular CLI](https://github.com/angular/angular-cli) versão 20.0.4.

### Servidor de Desenvolvimento Local

Para iniciar o servidor local, execute o comando abaixo no terminal:

```bash
ng serve
