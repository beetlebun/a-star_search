// --------------------------------------------------------------------------------------------------------------
// configuracoes
const colunas = 4; // colunas do labirinto
const linhas = 8; // linhas do labirinto

const lab = new Array(colunas);

let abertos = [];
let fechados = [];

// coordenadas pontos inicial e final
// ponto inicial = [0, 0]
const x_inicial = 0;
const y_inicial = 0;

// ponto final = [0, 4]
const x_final = 0;
const y_final = 4;

// coordenadas obstaculos
const coordenadas_obstaculos = [[0, 2], [1, 3], [2, 2]];

let ponto_inicial; // ponto inicial (origem) do labiritinto
let ponto_final; // ponto final (destino) do labirinto
let caminho = [];
// --------------------------------------------------------------------------------------------------------------

// heuristica distancia de manhattan -- por padrao será a utilizada
const heuristica_manhattan = (ponto, ponto_final) => {
    const distancia_x = Math.abs(ponto_final.x - ponto.x);
    const distancia_y = Math.abs(ponto_final.y - ponto.y);

    return distancia_x + distancia_y;
}

// heuristica distancia euclidiana -- por padrao nao esta sendo implementada mas basta alterar na chamada da funçao heuristica no algoritmo do A*
const heuristica_euclidiana = (ponto, ponto_final) => {
    const distancia_x = ponto_final.x - ponto.x;
    const distancia_y = ponto_final.y - ponto.y;

    return Math.sqrt(distancia_x * distancia_x + distancia_y + distancia_y);
}

class Ponto {
    constructor(x, y) {
        this.x = x; // localizaçao x no labirinto
        this.y = y; // localizaçao y no labirinto
        this.f = 0; // f(n) -- custo ou distancia total -- f(n) = g(n) + h(n)
        this.g = 0; // g(n) -- custo ou distancia da origem até o ponto atual
        this.h = 0; // h(n) -- custo ou distancia estimado do ponto atual até destino
        this.vizinhos = []; // vizinhos do ponto
        this.pai = undefined; // nó pai do ponto
        this.eh_obstaculo = this.verificar_se_eh_obstaculo();
    }

    verificar_se_eh_obstaculo = () => {
        for (let z = 0; z < coordenadas_obstaculos.length; z++) {
            if (this.x == coordenadas_obstaculos[z][0] && this.y == coordenadas_obstaculos[z][1]) {
                return true;
            }
        }
        return false;
    }

    // atualiza os vizinhos do ponto -- a ordem pode afetar no caminho final (os primeiros if serão considerados como caminhos prioritários), eh possivel alterar a ordem dos if
    atualizar_vizinhos = (lab) => {
        const i = this.x;
        const j = this.y;

        // vizinho topo
        if (i > 0 && !lab[i - 1][j].eh_obstaculo) {
            this.vizinhos.push(lab[i - 1][j]);
        }

        // vizinho direita
        if (j < linhas - 1 && !lab[i][j + 1].eh_obstaculo) {
            this.vizinhos.push(lab[i][j + 1]);
        }

        // vizinho embaixo
        if (i < colunas - 1 && !lab[i + 1][j].eh_obstaculo) {
            this.vizinhos.push(lab[i + 1][j]);
        }

        // vizinho esquerda
        if (j > 0 && !lab[i][j - 1].eh_obstaculo) {
            this.vizinhos.push(lab[i][j - 1]);
        }
    }

    toString = () => {
        return this.eh_obstaculo ? `[----]` : `[${this.x}, ${this.y}]`;
    }
}

const inicializar_labirinto = () => {
    for (let i = 0; i < colunas; i++) {
        lab[i] = new Array(linhas);
    }

    for (let i = 0; i < colunas; i++) {
        for (let j = 0; j < linhas; j++) {
            lab[i][j] = new Ponto(i, j);
        }
    }

    for (let i = 0; i < colunas; i++) {
        for (let j = 0; j < linhas; j++) {
            lab[i][j].atualizar_vizinhos(lab);
        }
    }

    ponto_inicial = lab[x_inicial][y_inicial];
    ponto_final = lab[x_final][y_final];

    abertos.push(ponto_inicial);
}

const a_estrela = () => {
    while (abertos.length > 0) {
        let menor_indice = 0;

        for (let i = 0; i < abertos.length; i++) {
            if (abertos[i].f < abertos[menor_indice].f) {
                menor_indice = i;
            }
        }

        let ponto_atual = abertos[menor_indice];

        if (ponto_atual == ponto_final) {
            let aux = ponto_atual;
            caminho.push(aux);
            while (aux.pai) {
                caminho.push(aux.pai);
                aux = aux.pai;
            }
            
            // retorna o caminho traçado
            return caminho.reverse();
        }

        // remove ponto atual da lista de abertos e adiciona na lista de fechados
        abertos.splice(menor_indice, 1);
        fechados.push(ponto_atual);

        let vizinhos = ponto_atual.vizinhos;

        for (let i = 0; i < vizinhos.length; i++) {
            let vizinho = vizinhos[i];

            // ignora caso tenha encontrado um ponto que seja um obstáculo
            if (vizinho.eh_obstaculo) {
                continue;
            }

            if (!fechados.includes(vizinho)) {
                let possivel_g = ponto_atual.g + 1;

                if (!abertos.includes(vizinho)) {
                    abertos.push(vizinho);
                } else if (possivel_g >= vizinho.g) {
                    continue;
                }

                vizinho.g = possivel_g;
                vizinho.h = heuristica_manhattan(vizinho, ponto_final); // possivel alterar para euclidiana --> heuristica_euclidiana(vizinho, ponto_final);
                vizinho.f = vizinho.g + vizinho.h;
                vizinho.pai = ponto_atual;
            }
        }
    }

    // resposta para solucao nao encontrada
    return [];
}

const executar = () => {
    inicializar_labirinto();

    if (ponto_inicial.eh_obstaculo) {
        console.log("Ponto inicial não pode ser obstáculo");
        return;
    }

    if (ponto_final.eh_obstaculo) {
        console.log("Ponto final não pode ser obstáculo");
        return;
    }

    for (let i = 0; i < colunas; i++) {
        console.log(lab[i].toString());
    }

    console.log(`\nPonto inicial: [${x_inicial}, ${y_inicial}]`);
    console.log(`Ponto final: [${x_final}, ${y_final}]`);
    console.log("\n---SOLUCAO ENCONTRADA---");
    const caminho_resultado = a_estrela();
    console.log(caminho_resultado.toString());
    console.log("---");
}

executar();