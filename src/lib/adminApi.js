import { base44 } from '@/api/base44Client';

function getToken() {
  return sessionStorage.getItem('transbill_admin_token');
}

export const adminApi = {
  update: (entity, id, data) =>
    base44.functions.invoke('adminWrite', { token: getToken(), entity, action: 'update', id, data })
      .then(r => r.data?.result),

  create: (entity, data) =>
    base44.functions.invoke('adminWrite', { token: getToken(), entity, action: 'create', data })
      .then(r => r.data?.result),

  delete: (entity, id) =>
    base44.functions.invoke('adminWrite', { token: getToken(), entity, action: 'delete', id })
      .then(r => r.data?.result),

  list: (entity) =>
    base44.functions.invoke('adminWrite', { token: getToken(), entity, action: 'list' })
      .then(r => r.data?.result || []),
};