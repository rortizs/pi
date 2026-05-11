# Pi Security Fork

Fork especializado de `earendil-works/pi` orientado a operaciones de seguridad con perfiles separados para:

- SOC
- Blue Team
- Red Team

## Atribución

Este proyecto es un fork de [earendil-works/pi](https://github.com/earendil-works/pi).

- Upstream original: `earendil-works/pi`
- Fork mantenido por: [`rortizs`](https://github.com/rortizs)

La licencia original se mantiene en [`LICENSE`](LICENSE).

## Objetivo

La meta de este fork es convertir Pi + Gentle-AI + Engram en una plataforma especializada para seguridad, evitando el modelo de “agente genérico que hace de todo”.

La arquitectura buscada separa dominios, evidencia, memoria y políticas operativas.

## Problema que resuelve

Los agentes generalistas ayudan, pero en seguridad mezclan demasiadas responsabilidades:

- triage
- investigación
- hardening
- emulación ofensiva
- reporting

Eso degrada trazabilidad, control y mantenibilidad.

## Principios

- evidencia antes que narrativa
- humano en control
- especialización por dominio
- memoria persistente con criterio
- guardrails fuertes por defecto

## Perfiles objetivo

| Perfil | Objetivo |
|--------|----------|
| SOC | triage, correlación, severidad, escalamiento |
| Blue Team | detección, hunting, hardening, mejora de cobertura |
| Red Team | validación ofensiva autorizada, chaining, impacto |

## Stack conceptual

| Componente | Rol |
|-----------|-----|
| Pi | runtime principal |
| Gentle-AI | orquestación, skills, workflows, subagentes |
| Engram | memoria persistente |

## Estado actual

Fase de definición documental inicial.

Ver documentos base en [`docs/`](docs/README.md):

- visión del fork
- límites de dominio
- mapa de agentes
- policy layer
- evidence layer
- requerimientos funcionales
- requerimientos no funcionales
- UML inicial

## Próximos pasos

1. consolidar documentación base
2. bajar requerimientos a arquitectura implementable
3. diseñar perfiles y agentes especializados
4. integrar guardrails, evidence layer y memoria especializada

## Desarrollo

Este fork hereda la estructura monorepo de Pi y conserva el upstream como base técnica.

Antes de cambios de implementación, revisar:

- [`AGENTS.md`](AGENTS.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`docs/README.md`](docs/README.md)

## Licencia

MIT. Ver [`LICENSE`](LICENSE).
