# Evidence Layer

## Objetivo
Forzar que el sistema trabaje con prueba estructurada y no con narrativa suelta.

## Campos mínimos

| Campo | Propósito |
|------|-----------|
| `observation` | qué se observó |
| `source` | de dónde salió |
| `timestamp` | cuándo ocurrió |
| `scope` | a qué aplica |
| `interpretation` | qué podría significar |
| `confidence` | qué tan confiable es |
| `validationStatus` | `pending`, `validated` o `rejected` |
| `toolInvocationId` | qué llamada MCP produjo la evidencia |
| `rawRef` | referencia al artefacto bruto cuando no conviene persistirlo completo |
| `rejectionReason` | motivo auditable cuando la evidencia queda rechazada |

## Contrato SOC/MCP

El seam inicial vive en `packages/coding-agent/src/core/security/`:

- `contracts.ts` define los contratos de Pi para `SocTaskRequest`, `McpToolInvocationRequest`, `McpToolInvocationResult`, `EvidenceRecord`, `HumanApprovalCheckpoint` y `HandoffArtifact`.
- `policy.ts` clasifica invocaciones Kali MCP: acciones destructivas o fuera de scope se deniegan; acciones high-impact requieren aprobación humana; workflows MCP-only siguen siendo válidos sin Gemini CLI.
- `evidence.ts` normaliza resultados MCP a `EvidenceRecord` con estado inicial `pending` y obliga razón auditable para pasar a `rejected`.
- `engram-adapter.ts` declara la frontera de persistencia: decisiones, invocaciones, evidencia, validaciones y handoffs deben escribirse con topic linkage estable, sin ejecutar escrituras reales desde este contrato.

## Lifecycle de validación

1. Un workflow SOC crea una intención con scope y operador explícitos.
2. La política permite, bloquea o exige aprobación humana antes de invocar Kali MCP.
3. El resultado MCP se normaliza como evidencia `pending` con `source`, `timestamp`, `scope`, `toolInvocationId` y `rawRef`.
4. El revisor valida la evidencia como `validated` o la marca `rejected` con `rejectionReason`.
5. El handoff referencia `evidenceIds`; ninguna conclusión importante debe viajar sin vínculo a evidencia.

## Regla central
Ninguna conclusión importante debe existir sin vínculo a evidencia.

## Próximo paso
Conectar adaptadores reales de Engram y Kali MCP en cambios futuros, manteniendo este contrato sin Gemini CLI obligatorio y sin ejecución autónoma de herramientas.
