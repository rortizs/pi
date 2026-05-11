# Historia: Gentle-AI + Engram + Pi

## Respuesta corta
La plataforma objetivo combina:

- **Pi** como runtime/agente
- **Gentle-AI** como ecosistema, disciplina y orquestación
- **Engram** como memoria persistente y capa de continuidad

## Qué es cada cosa

| Componente | Rol |
|-----------|-----|
| Pi | Agente base y runtime con paquetes, subagentes y comandos |
| Gentle-AI | Capa de persona, workflows, SDD, skills y estructura operativa |
| Engram | Memoria persistente para decisiones, hallazgos y contexto |

## Problema que resuelve
Un agente solo, sin memoria ni disciplina, termina siendo un chatbot con herramientas. La combinación busca un sistema más serio para trabajo técnico y de seguridad.

## Objetivo
Queremos una historia base para un fork donde Pi se convierta en una plataforma especializada en seguridad, usando Gentle-AI como marco operativo y Engram como memoria durable.

## Alcance funcional
La integración debería permitir:

1. cambiar de perfiles operativos según contexto
2. usar subagentes especializados
3. conservar hallazgos, decisiones y evidencia entre sesiones
4. separar tareas de exploración, validación, documentación y respuesta
5. soportar SOC, Blue Team y Red Team como capacidades distintas

## Principios de arquitectura

- **separación de dominios**: SOC, Blue y Red no se mezclan en un solo prompt gigante
- **memoria con criterio**: Engram guarda decisiones, evidencia y contexto valioso
- **subagentes especializados**: cada rol hace una cosa bien
- **evidencia antes que narrativa**: no se aceptan conclusiones sin soporte
- **humano en control**: acciones riesgosas requieren aprobación explícita

## Requisitos del fork

| Tema | Requisito |
|------|-----------|
| Extensibilidad | Debe permitir agregar roles y skills nuevos |
| Memoria | Debe persistir hallazgos y decisiones útiles |
| Seguridad | Debe bloquear acciones destructivas por defecto |
| Trazabilidad | Debe quedar claro qué agente hizo qué |
| Especialización | Debe haber perfiles separados por función |

## Capacidades deseadas

- perfil `soc`
- perfil `blue-team`
- perfil `red-team`
- skills de validación de findings
- workflows de investigación y reporte
- artefactos reutilizables para incidentes, detecciones y campañas

## No es
Esto NO es:

- un único agente omnisciente
- una colección caótica de prompts
- automatización ofensiva sin límites
- memoria acumulada sin curación ni criterio

## Criterios de éxito

- Pi corre como runtime principal
- Gentle-AI aporta orden, skills y workflows
- Engram preserva contexto útil entre sesiones
- SOC, Blue Team y Red Team operan como historias y capacidades separadas

## Próximo paso
Estas historias van a servir como base para definir requerimientos formales, estructura del fork y roadmap de implementación.
