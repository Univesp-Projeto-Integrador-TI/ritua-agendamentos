// Monta caminhos a partir da localização deste arquivo, para funcionar em qualquer pasta (ex.: GitHub Pages em /nome-do-repositorio/).
export const asset = name => new URL(`../images/${name}`, import.meta.url).href;
export const page = name => new URL(`../pages/${name}`, import.meta.url).href;
export const home = () => new URL("../../../index.html", import.meta.url).href;
