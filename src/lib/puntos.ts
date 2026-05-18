/**
 * Calcula puntos de quiniela:
 * - 3 puntos si atina el resultado (ganó local, ganó visitante, empate)
 * - 3 puntos ADICIONALES si también atina el marcador exacto
 */
export function calcularPuntos(
  golesLocal: number,
  golesVisitante: number,
  predLocal: number,
  predVisitante: number
): number {
  const resultadoReal = Math.sign(golesLocal - golesVisitante);
  const resultadoPred = Math.sign(predLocal - predVisitante);

  let puntos = 0;

  if (resultadoReal === resultadoPred) {
    puntos += 3; // Atinó resultado
    if (golesLocal === predLocal && golesVisitante === predVisitante) {
      puntos += 3; // Atinó marcador exacto
    }
  }

  return puntos;
}

/**
 * Determina si un partido ya se jugó (fecha pasada y tiene resultado)
 */
export function partidoJugado(fechaHora: Date | string, golesLocal: number | null, golesVisitante: number | null): boolean {
  const fecha = new Date(fechaHora);
  return fecha < new Date() && golesLocal !== null && golesVisitante !== null;
}

/**
 * Determina si un partido ya empezó
 */
export function partidoEmpezado(fechaHora: Date | string): boolean {
  return new Date(fechaHora) < new Date();
}
