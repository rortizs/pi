# Límites de Dominio

## Respuesta corta
SOC, Blue Team y Red Team están relacionados, pero **no son la misma cosa**. Este fork los va a tratar como dominios separados con responsabilidades, inputs y outputs distintos.

## Regla principal
Cada dominio debe responder una pregunta distinta:

| Dominio | Pregunta principal |
|--------|---------------------|
| SOC | ¿Qué está pasando ahora y cómo lo priorizamos? |
| Blue Team | ¿Cómo mejoramos la defensa y cerramos brechas? |
| Red Team | ¿Cómo validamos de forma autorizada si la defensa realmente resiste? |

## SOC
- triage
- correlación
- severidad
- escalamiento

## Blue Team
- detección
- hunting
- hardening
- mejora de cobertura

## Red Team
- reconocimiento autorizado
- validación técnica
- chaining
- impacto demostrable

## Regla de handoff
Cuando un dominio llega al límite de su responsabilidad, debe generar un handoff explícito al dominio correcto.

## Próximo paso
Usar estos límites para diseñar el mapa de agentes y subagentes del fork.
