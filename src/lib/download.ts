import type { EvidenceRecord } from '../types';

function normaliseBase64(input: string) {
  const trimmed = input.trim();
  const commaIndex = trimmed.indexOf(',');
  if (trimmed.startsWith('data:') && commaIndex !== -1) {
    return trimmed.slice(commaIndex + 1);
  }
  return trimmed;
}

function base64ToBlob(base64: string, mimeType: string) {
  const cleaned = normaliseBase64(base64);
  if (!cleaned) {
    return new Blob([], { type: mimeType || 'application/octet-stream' });
  }

  const byteCharacters = atob(cleaned);
  const byteArrays: BlobPart[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);
    for (let index = 0; index < slice.length; index += 1) {
      byteNumbers[index] = slice.charCodeAt(index);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: mimeType || 'application/octet-stream' });
}

function createFallbackBlob(record: EvidenceRecord) {
  const fallback = `Reconstructed placeholder for ${record.fileName}\nCase ID: ${record.caseId}\nDescription: ${record.description}`;
  return new Blob([fallback], { type: 'text/plain' });
}

function triggerBrowserDownload(blob: Blob, suggestedName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = suggestedName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function buildEvidenceBlob(record: EvidenceRecord) {
  if (record.fileContent) {
    return base64ToBlob(record.fileContent, record.fileType || 'application/octet-stream');
  }
  return createFallbackBlob(record);
}

export function downloadEvidenceRecord(record: EvidenceRecord) {
  const blob = buildEvidenceBlob(record);
  triggerBrowserDownload(blob, record.fileName || `evidence-${record.id}`);
}
