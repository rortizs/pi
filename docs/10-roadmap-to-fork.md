# Roadmap hacia el Fork

## Respuesta corta
Antes de picar código, vamos a pasar por una secuencia ordenada: **documentar → formalizar requerimientos → clonar base → validar toolchain → crear fork → inicializar local → recién ahí implementar**.

## Secuencia propuesta

### Etapa 1 — Descubrimiento y visión
- historias de dominio
- visión del fork
- límites de dominio
- mapa de agentes
- policy layer
- evidence layer

### Etapa 2 — Requerimientos formales
- README inicial del fork
- RQ funcionales
- RQ no funcionales
- criterios de aceptación
- diagramas UML de alto nivel

### Etapa 3 — Preparación técnica
- clonar Pi localmente
- validar versión de Gentle-AI con soporte Pi
- revisar integración actual con Engram
- decidir estrategia de fork en GitHub

### Etapa 4 — Fundación del fork
- crear fork en tu cuenta
- configurar remoto `origin` y `upstream`
- inicializar estructura documental
- crear branch de arranque

### Etapa 5 — Diseño técnico detallado
- arquitectura del fork
- perfiles `soc`, `blue-team`, `red-team`
- contratos de agentes
- contratos de artifacts y memoria

### Etapa 6 — Implementación
- cambios mínimos del runtime
- assets, prompts y agentes
- guardrails
- memoria
- documentación viva

## Orden obligatorio
No vamos a empezar implementación antes de tener:

- README inicial
- RQ
- RQNF
- UML de contexto/arquitectura
- fork local inicializado

## Qué validaremos cuando toque clonar

| Validación | Propósito |
|-----------|-----------|
| repo Pi clonado | tener base real para el fork |
| Gentle-AI actualizado | asegurar soporte Pi vigente |
| integración con Engram entendida | no romper memoria desde el inicio |
| remotos bien definidos | trabajar limpio entre upstream y fork |

## Entregables previos a código

- `README.md`
- documento de `RQ`
- documento de `RQNF`
- UML de contexto
- UML de componentes/agentes
- backlog inicial de implementación

## Criterios de éxito

- llegamos al código con visión clara
- sabemos qué vamos a tocar y por qué
- el fork nace con base documental seria
- evitamos improvisación de arquitectura

## Próximo paso
Seguir bajando documentación formal hasta que estemos listos para clonar Pi y crear el fork con criterio.
