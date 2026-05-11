# Historia: Red Team

## Respuesta corta
Red Team existe para **emular adversarios de forma autorizada** y revelar fallas reales de personas, procesos y tecnología.

## Qué es
Red Team no es “tirar exploits”. Es una disciplina de validación ofensiva controlada, con objetivos, reglas de engagement y foco en impacto real.

## Problema que resuelve
Muchas organizaciones creen estar seguras porque tienen controles declarados. Red Team valida si esos controles realmente frenan, detectan o contienen un ataque.

## Objetivo
Queremos una historia base para un fork donde el modo Red Team ayude a:

1. planificar campañas autorizadas
2. modelar cadenas de ataque
3. validar hallazgos con evidencia
4. documentar impacto realista
5. separar claramente exploración, validación y reporte

## Alcance funcional
El modo Red Team debería cubrir:

- reconocimiento autorizado
- validación técnica de superficie expuesta
- chaining de vulnerabilidades
- scoring de confianza por hallazgo
- generación de narrativa de ataque
- documentación de evidencia reproducible

## No es
Esto NO es:

- explotación indiscriminada
- automatización ofensiva sin autorización
- un agente que “adivina” vulnerabilidades
- una herramienta que omite validación o proof-of-execution

## Requisitos de diseño

| Tema | Requisito |
|------|-----------|
| Autorización | Todo flujo debe asumir alcance explícito |
| Validación | No se reporta nada sin evidencia reproducible |
| Seguridad | Acciones peligrosas requieren confirmación humana |
| Realismo | Debe priorizar cadenas de impacto real |
| Reportabilidad | Cada finding debe traducirse a riesgo entendible |

## Capacidades deseadas en el fork

- agente `red-team-operator`
- agente `recon-analyst`
- agente `exploit-validator`
- agente `attack-chain-analyst`
- integración con validación anti-hallucination

## Criterios de éxito

- los hallazgos tienen prueba, impacto y alcance claros
- el sistema diferencia hipótesis de vulnerabilidad vs vulnerabilidad confirmada
- las cadenas de ataque muestran por qué importan
- la salida sirve tanto para técnicos como para liderazgo

## Próximo paso
Esta historia va a guiar el diseño del modo ofensivo autorizado, con guardrails fuertes y validación estricta.
