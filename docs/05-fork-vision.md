# Visión del Fork

## Respuesta corta
Este fork busca convertir a Pi + Gentle-AI + Engram en una **plataforma especializada de operaciones de seguridad**, con perfiles separados para SOC, Blue Team y Red Team.

## Propósito
El objetivo no es construir otro agente genérico. El objetivo es construir un sistema que ayude a equipos de seguridad a:

- investigar mejor
- documentar mejor
- validar mejor
- decidir mejor

Todo con memoria persistente, especialización por rol y guardrails fuertes.

## Problema que queremos resolver
Hoy los agentes generalistas sirven para asistir, pero mezclan demasiadas cosas:

- investigan
- redactan
- razonan
- ejecutan
- opinan

Y muchas veces lo hacen sin límites de dominio, sin trazabilidad y sin evidencia suficiente.

En seguridad eso es inaceptable.

## Propuesta
Este fork usará:

- **Pi** como runtime principal
- **Gentle-AI** como marco operativo, skills, workflows y disciplina
- **Engram** como memoria persistente para contexto, decisiones y evidencia

Sobre esa base se crearán perfiles separados:

- `soc`
- `blue-team`
- `red-team`

## Principio central
**Separar capacidades antes de implementar features.**

Si mezclamos SOC, Blue Team y Red Team en un solo agente gigante, el diseño nace roto.

## Usuarios objetivo

| Usuario | Necesidad principal |
|--------|----------------------|
| Analista SOC | triage, correlación, escalamiento, reportes |
| Blue Teamer | hunting, detección, hardening, mejora de cobertura |
| Red Teamer | emulación autorizada, validación, chaining, reporte técnico |
| Líder técnico | trazabilidad, consistencia, artifacts reutilizables |

## Principios no negociables

1. **Evidencia antes que narrativa**
2. **Humano en control**
3. **Especialización por rol**
4. **Memoria útil, no ruido acumulado**
5. **Hallazgos verificables**
6. **Acciones sensibles con aprobación explícita**

## Próximo paso
Usar este documento como marco de producto/arquitectura para convertir las historias actuales en requerimientos más formales.
