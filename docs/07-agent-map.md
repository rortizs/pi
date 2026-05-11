# Mapa de Agentes

## Estructura base

| Nivel | Agente | Rol |
|------|--------|-----|
| 1 | `security-orchestrator` | decide flujo, dominio y delegación |
| 2 | `soc-analyst` | triage y correlación operativa |
| 2 | `blue-team-investigator` | defensa, hunting y mejora de cobertura |
| 2 | `red-team-operator` | emulación ofensiva autorizada |
| transversal | `evidence-reviewer` | verifica calidad de evidencia |
| transversal | `report-writer` | convierte resultados en artifacts útiles |

## Regla
El fork no debe crecer como prompt monolítico. Debe crecer como red de agentes especializados.

## Próximo paso
Definir la policy layer y la evidence layer sobre esta estructura.
