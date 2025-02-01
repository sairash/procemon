import Procemon from "./procemon";
export interface Env {}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const params = url.searchParams;

    const size = params.get('size') || '32';
    const color = params.get('color') || 'white';
    const background = params.get('background') || 'black';

    const p = new Procemon(parseInt(size));
    const svg = p.plot_svg(background, color);


    return new Response(svg, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
};