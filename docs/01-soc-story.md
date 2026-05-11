# Historia: SOC

## Respuesta corta
Un SOC existe para **detectar, priorizar, investigar y coordinar respuesta** frente a eventos de seguridad en tiempo real o casi real.

## Qué es
Un Security Operations Center no es solo un equipo mirando alertas. Es una capacidad operativa que conecta:

- monitoreo
- triage
- investigación
- escalamiento
- respuesta coordinada
- mejora continua de detecciones

## Problema que resuelve
Sin SOC, la organización tiene herramientas pero no tiene **capacidad sostenida de defensa operacional**. Los eventos llegan, pero nadie los convierte en decisiones rápidas y consistentes.

## Objetivo
Queremos una historia base para un fork orientado a SOC donde el agente pueda ayudar a:

1. recibir alertas
2. clasificar criticidad
3. correlacionar contexto
4. proponer próximos pasos
5. documentar evidencia
6. escalar a Blue Team, IR o liderazgo cuando corresponda

## Alcance funcional
El modo SOC debería cubrir:

- ingestión de contexto de alertas
- enriquecimiento con evidencia adicional
- clasificación inicial
- hipótesis de investigación
- timeline del incidente
- recomendación de escalamiento
- generación de reportes operativos

## No es
Esto NO es:

- un motor de explotación
- un reemplazo de un analista humano
- una consola que toma acciones destructivas sin aprobación
- una capa de “LLM magic” que inventa hallazgos

## Requisitos de diseño

| Tema | Requisito |
|------|-----------|
| Evidencia | Toda conclusión debe enlazar evidencia concreta |
| Trazabilidad | Cada alerta investigada debe dejar rastro reproducible |
| Seguridad | Acciones sensibles requieren confirmación humana |
| Velocidad | Debe ayudar a bajar tiempo de triage |
| Consistencia | Debe producir salidas repetibles y comparables |

## Capacidades deseadas en el fork

- agente `soc-analyst`
- agente `incident-triage`
- agente `alert-correlator`
- plantillas para reportes de incidente
- scoring de confianza por hallazgo
- separación entre observación, inferencia y recomendación

## Criterios de éxito

- una alerta puede pasar de input bruto a hipótesis documentada
- el sistema distingue severidad, impacto y urgencia
- el agente propone escalamiento correcto
- cada conclusión muestra qué evidencia la sostiene

## Próximo paso
Esta historia se usará como requisito semilla para definir agentes, prompts, workflows y reglas operativas del modo SOC.
