# README Draft del Fork

## Nombre tentativo
**Pi Security Fork**

> Nombre provisional. Se puede redefinir después.

## Qué es
Pi Security Fork es una especialización de Pi + Gentle-AI + Engram orientada a operaciones de seguridad, con perfiles separados para:

- SOC
- Blue Team
- Red Team

El objetivo es dejar de tratar la seguridad como un prompt genérico y pasar a una arquitectura con dominios claros, evidencia estructurada y control humano sobre acciones sensibles.

## Problema que resuelve
Los agentes generalistas sirven para asistir, pero en seguridad mezclan demasiadas responsabilidades sin suficiente trazabilidad. Este fork busca resolver eso con:

- especialización por rol
- memoria persistente útil
- policy layer explícita
- evidence layer común
- artifacts consistentes

## Principios

- evidencia antes que narrativa
- humano en control
- especialización por dominio
- memoria con criterio
- guardrails fuertes por defecto

## Perfiles

| Perfil | Objetivo |
|--------|----------|
| SOC | triage, correlación, severidad, escalamiento |
| Blue Team | detección, hunting, hardening, mejora de cobertura |
| Red Team | validación ofensiva autorizada, chaining, impacto |

## Arquitectura conceptual

- **Pi**: runtime principal
- **Gentle-AI**: orquestación, skills, subagentes, workflows
- **Engram**: memoria persistente

## Qué NO es

- un único agente omnisciente
- una herramienta ofensiva sin control
- un asistente que inventa hallazgos
- una capa caótica de prompts sin arquitectura

## Estado actual
En definición documental inicial:

- visión
- historias de dominio
- límites de dominio
- mapa de agentes
- policy layer
- evidence layer
- requerimientos
- UML

## Próximos pasos

1. clonar Pi
2. validar soporte Pi en Gentle-AI
3. crear fork en GitHub
4. inicializar repo local
5. bajar arquitectura a implementación

## Documentos clave

- `docs/01-soc-story.md`
- `docs/02-blue-team-story.md`
- `docs/03-red-team-story.md`
- `docs/05-fork-vision.md`
- `docs/11-requirements-functional.md`
- `docs/12-requirements-non-functional.md`
- `docs/13-uml-overview.md`

## Próximo paso
Convertir este borrador en el `README.md` real cuando el fork local esté inicializado.
