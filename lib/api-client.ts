/**
 * API жауаптарын стандартты пішімге келтіруге арналған көмекші функциялар
 */

export async function unwrapResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Сұраныс сәтсіздікке ұшырады: ${res.status}`);
  }
  const json = await res.json();
  // Егер жауап { success: true, data: ... } пішімінде болса, data-ны қайтарамыз
  if (json && typeof json === 'object' && 'data' in json && json.success !== false) {
    return json.data;
  }
  return json;
}

export function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}
