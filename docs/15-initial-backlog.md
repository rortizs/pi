# Backlog Inicial

## Objetivo
Traducir la visión y los requerimientos a un backlog base previo a implementación.

## Epic 1 — Fundación del fork

### Historia 1.1
Como arquitecto del fork,
quiero clonar Pi y validar el stack Gentle-AI/Engram,
para partir de una base real y compatible.

### Historia 1.2
Como maintainer,
quiero crear el fork en GitHub y configurarlo localmente,
para poder trabajar con `origin` y `upstream` limpios.

## Epic 2 — Base documental oficial

### Historia 2.1
Como colaborador,
quiero un README claro,
para entender el propósito, la arquitectura y el roadmap.

### Historia 2.2
Como arquitecto,
quiero RQ y RQNF explícitos,
para evitar implementación improvisada.

### Historia 2.3
Como equipo,
queremos diagramas UML iniciales,
para compartir una visión común del sistema.

## Epic 3 — Arquitectura de dominios

### Historia 3.1
Como sistema,
quiero perfiles separados para SOC, Blue Team y Red Team,
para no mezclar responsabilidades.

### Historia 3.2
Como orquestador,
quiero derivar cada caso al dominio correcto,
para mejorar precisión y mantenibilidad.

## Epic 4 — Policy layer

### Historia 4.1
Como maintainer,
quiero reglas explícitas de acciones permitidas, aprobadas y bloqueadas,
para reducir riesgo operativo.

### Historia 4.2
Como usuario,
quiero saber cuándo una acción necesita aprobación,
para mantener control humano real.

## Epic 5 — Evidence layer

### Historia 5.1
Como analista,
quiero que cada conclusión esté enlazada a evidencia,
para confiar en los hallazgos.

### Historia 5.2
Como reviewer,
quiero distinguir hipótesis de findings confirmados,
para auditar mejor la calidad del trabajo.

## Epic 6 — Memoria persistente

### Historia 6.1
Como operador,
quiero recuperar contexto de investigaciones previas,
para no recomenzar desde cero en cada sesión.

### Historia 6.2
Como maintainer,
quiero que la memoria guarde valor y no ruido,
para sostener calidad a lo largo del tiempo.

## Orden sugerido de implementación

1. fundación del fork
2. README + RQ + RQNF + UML
3. arquitectura de perfiles
4. policy layer
5. evidence layer
6. memoria persistente especializada

## Próximo paso
Con esta base documental lista, el próximo hito será preparar el clonado de Pi y la verificación del stack antes de crear el fork real.
