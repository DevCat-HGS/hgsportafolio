import stack from "./data/stack.json";
import { checked } from "./json";
import type { Tech } from "./types";

/**
 * Tecnologías de cada grupo del stack. Los iconos están en /public/icons: los de skillicons.dev que usa el README;
 * SAP de simple-icons y OData dibujado aquí, con el mismo marco oscuro de 256 px;
 * y Lambda, API Gateway y Bedrock de los AWS Architecture Icons oficiales, con esquinas redondeadas.
 */
export const stackTech: Record<string, readonly Tech[]> = checked<Record<string, readonly Tech[]>>(stack);
