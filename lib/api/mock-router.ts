import type { ApiResponse } from './client';
import { mockInventoryData, mockCategories, mockSuppliers } from '@/lib/data/inventory-demo';
import { users as userDemoData } from '@/lib/data/user-demo';
import { mockTransactionData } from '@/lib/data/transaction-demo';
import { TUBAN_DATA } from '@/lib/data/tuban-data';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type DummyUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  nip?: string;
};

type DummyRole = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type DummyPermission = {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  isActive: boolean;
};

const nowIso = () => new Date().toISOString();

const rolePermissionsMap: Record<string, string[]> = {
  Admin: ['users.read', 'users.write', 'inventory.read', 'inventory.write', 'transactions.read', 'transactions.write', 'settings.read', 'settings.write'],
  Dinas: ['inventory.read', 'transactions.read', 'reports.read'],
  POPT: ['inventory.read', 'transactions.read', 'transactions.process'],
  PPL: ['inventory.read', 'transactions.read', 'transactions.create'],
};

const roleDescriptions: Record<string, string> = {
  Admin: 'Akses penuh sistem',
  Dinas: 'Pengawasan dan pelaporan',
  POPT: 'Operasional pengendalian',
  PPL: 'Pengajuan dan monitoring lapangan',
};

let usersStore: DummyUser[] = userDemoData.map((user) => ({
  id: user.id,
  email: user.email || `${user.nip}@obatku.local`,
  name: user.name,
  role: user.role,
  permissions: user.permissions && user.permissions.length > 0 ? user.permissions : (rolePermissionsMap[user.role] || []),
  avatar: user.avatar,
  phone: user.phone,
  address: user.address,
  isActive: user.status === 'active',
  lastLogin: user.lastLogin,
  createdAt: user.createdAt || nowIso(),
  updatedAt: user.updatedAt || nowIso(),
  nip: user.nip,
}));

let rolesStore: DummyRole[] = Object.keys(rolePermissionsMap).map((roleName, index) => ({
  id: `role-${index + 1}`,
  name: roleName,
  description: roleDescriptions[roleName] || roleName,
  permissions: rolePermissionsMap[roleName] || [],
  isActive: true,
  createdAt: nowIso(),
  updatedAt: nowIso(),
}));

let permissionsStore: DummyPermission[] = Array.from(new Set(rolesStore.flatMap((role) => role.permissions))).map((permission, index) => {
  const [module = 'general', action = 'read'] = permission.split('.');
  return {
    id: `perm-${index + 1}`,
    name: permission,
    description: `Permission ${permission}`,
    module,
    action,
    isActive: true,
  };
});

let medicinesStore = mockInventoryData.map((item, index) => ({
  id: item.id,
  name: item.name,
  genericName: item.content,
  category: item.category.name,
  categoryId: item.category.id,
  supplier: item.supplier,
  supplierId: mockSuppliers.find((supplier) => supplier.name === item.supplier)?.id || `supplier-${index + 1}`,
  description: item.notes,
  activeIngredient: item.content,
  dosageForm: item.unit,
  strength: item.content,
  unit: item.unit,
  barcode: item.barcode,
  sku: item.barcode || `SKU-${item.id}`,
  image: '',
  isActive: true,
  requiresPrescription: false,
  createdAt: item.entryDate instanceof Date ? item.entryDate.toISOString() : nowIso(),
  updatedAt: item.lastUpdated instanceof Date ? item.lastUpdated.toISOString() : nowIso(),
}));

let categoriesStore = mockCategories.map((category) => ({
  id: category.id,
  name: category.name,
  description: category.description,
  parentId: undefined as string | undefined,
  parent: undefined,
  children: [],
  isActive: true,
  createdAt: nowIso(),
  updatedAt: nowIso(),
}));

let suppliersStore = mockSuppliers.map((supplier) => ({
  id: supplier.id,
  name: supplier.name,
  code: `SUP-${supplier.id}`,
  contactPerson: supplier.name,
  email: `supplier${supplier.id}@obatku.local`,
  phone: supplier.contact || '-',
  address: supplier.address || '-',
  city: supplier.address || '-',
  state: 'Jawa Timur',
  postalCode: '62300',
  country: 'Indonesia',
  taxId: undefined,
  isActive: true,
  createdAt: nowIso(),
  updatedAt: nowIso(),
}));

let stockStore = mockInventoryData.map((item, index) => ({
  id: `stock-${index + 1}`,
  medicineId: item.id,
  medicine: medicinesStore.find((medicine) => medicine.id === item.id) || medicinesStore[0],
  batchNumber: item.batchNumber || `BATCH-${index + 1}`,
  quantity: item.stock,
  unitPrice: item.pricePerUnit || 0,
  sellingPrice: item.pricePerUnit || 0,
  expiryDate: item.expiryDate instanceof Date ? item.expiryDate.toISOString() : new Date().toISOString(),
  manufacturingDate: item.entryDate instanceof Date ? item.entryDate.toISOString() : new Date().toISOString(),
  supplier: item.supplier,
  supplierId: mockSuppliers.find((supplier) => supplier.name === item.supplier)?.id || `supplier-${index + 1}`,
  location: item.storageLocation,
  isActive: true,
  createdAt: item.entryDate instanceof Date ? item.entryDate.toISOString() : nowIso(),
  updatedAt: item.lastUpdated instanceof Date ? item.lastUpdated.toISOString() : nowIso(),
}));

let transactionStore = mockTransactionData.map((transaction) => ({
  ...transaction,
  submissionDate: transaction.submissionDate instanceof Date ? transaction.submissionDate.toISOString() : transaction.submissionDate,
  createdAt: transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt,
  updatedAt: transaction.updatedAt instanceof Date ? transaction.updatedAt.toISOString() : transaction.updatedAt,
}));

let farmerGroupStore = Array.from(
  new Map(
    mockTransactionData
      .map((item) => item.farmerGroup)
      .filter(Boolean)
      .map((group) => [group.id, {
        id: group.id,
        name: group.name,
        leader: group.leader,
        district: group.district,
        village: group.village,
        memberCount: 30,
        establishedDate: '2020-01-01',
        status: 'ACTIVE',
      }])
  ).values()
);

let commoditiesStore = Array.from(
  new Map(
    mockTransactionData
      .map((item) => item.farmingDetails?.commodity)
      .filter(Boolean)
      .map((commodity, index) => [commodity, {
        id: `commodity-${index + 1}`,
        name: commodity,
        category: 'Pertanian',
        description: `Komoditas ${commodity}`,
        commonPestTypes: [],
        status: 'ACTIVE',
      }])
  ).values()
);

let pestTypeStore = Array.from(
  new Map(
    mockTransactionData
      .flatMap((item) => item.farmingDetails?.pestType || [])
      .filter(Boolean)
      .map((pestType, index) => [pestType, {
        id: `pest-${index + 1}`,
        name: pestType,
        category: 'Hama',
        description: `Jenis hama ${pestType}`,
        affectedCommodities: [],
        severity: 'MEDIUM',
        status: 'ACTIVE',
      }])
  ).values()
);

function parseEndpoint(endpoint: string) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    const url = new URL(endpoint);
    const cleanedPath = url.pathname.replace(/^\/api/, '');
    return {
      path: cleanedPath,
      searchParams: url.searchParams,
    };
  }

  const [rawPath, rawQuery = ''] = endpoint.split('?');
  const cleanedPath = rawPath.replace(/^\/api/, '');
  return {
    path: cleanedPath,
    searchParams: new URLSearchParams(rawQuery),
  };
}

function ok<T>(data: T, message = 'Dummy data response'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    statusCode: 200,
  };
}

function messageResponse(message: string): ApiResponse<{ message: string }> {
  return ok({ message }, message);
}

function paginate<T>(items: T[], searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.max(1, Number(searchParams.get('limit') || 10));
  const search = (searchParams.get('search') || '').toLowerCase();
  const filteredItems = search
    ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(search))
    : items;
  const start = (page - 1) * limit;
  const pagedItems = filteredItems.slice(start, start + limit);

  return {
    data: pagedItems,
    pagination: {
      page,
      limit,
      total: filteredItems.length,
      totalPages: Math.ceil(filteredItems.length / limit) || 1,
      hasNext: start + limit < filteredItems.length,
      hasPrev: page > 1,
    },
  };
}

function buildCsv(items: any[]): string {
  if (!items.length) {
    return '';
  }

  const headers = Object.keys(items[0]);
  const rows = items.map((item) =>
    headers
      .map((header) => {
        const rawValue = item[header] ?? '';
        const value = typeof rawValue === 'object' ? JSON.stringify(rawValue) : String(rawValue);
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  return `${headers.join(',')}\n${rows.join('\n')}`;
}

export function getDummyExportBlob(endpoint: string): Blob {
  const { path } = parseEndpoint(endpoint);
  if (path.includes('/v1/inventory/medicines')) {
    const csv = buildCsv(medicinesStore);
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  if (path.includes('/v1/users')) {
    const csv = buildCsv(usersStore);
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  return new Blob(['id,name\n1,Demo'], { type: 'text/csv;charset=utf-8;' });
}

export async function getDummyApiResponse(
  endpoint: string,
  method: HttpMethod,
  body?: any,
): Promise<ApiResponse<any>> {
  const { path, searchParams } = parseEndpoint(endpoint);

  if (path === '/v1/auth/login' && method === 'POST') {
    const primaryUser = usersStore[0];
    return ok({
      user: {
        id: primaryUser.id,
        name: primaryUser.name,
        nip: primaryUser.nip || '000000000000000000',
        email: primaryUser.email,
        phone: primaryUser.phone,
        role: primaryUser.role,
        permissions: primaryUser.permissions,
        avatar: primaryUser.avatar,
        avatarUrl: primaryUser.avatar,
        lastLogin: nowIso(),
        status: primaryUser.isActive ? 'active' : 'inactive',
      },
      tokens: {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      },
    }, 'Login dummy berhasil');
  }

  if (path === '/v1/auth/logout' && method === 'POST') {
    return messageResponse('Logout dummy berhasil');
  }

  if (path === '/v1/auth/refresh' && method === 'POST') {
    return ok({
      tokens: {
        accessToken: 'dummy-access-token-refreshed',
        refreshToken: 'dummy-refresh-token-refreshed',
        expiresIn: 3600,
      },
    }, 'Refresh token dummy berhasil');
  }

  if (path === '/v1/auth/profile' && method === 'GET') {
    const primaryUser = usersStore[0];
    return ok({
      user: {
        id: primaryUser.id,
        name: primaryUser.name,
        nip: primaryUser.nip || '000000000000000000',
        email: primaryUser.email,
        phone: primaryUser.phone,
        role: primaryUser.role,
        permissions: primaryUser.permissions,
        avatar: primaryUser.avatar,
        avatarUrl: primaryUser.avatar,
        lastLogin: primaryUser.lastLogin,
        status: primaryUser.isActive ? 'active' : 'inactive',
      },
    }, 'Profile dummy berhasil');
  }

  if (path === '/v1/auth/profile/change-password' && method === 'POST') {
    return messageResponse('Password berhasil diubah (dummy)');
  }

  if (path === '/v1/auth/login/reset-password' && method === 'POST') {
    return messageResponse('Reset password berhasil (dummy)');
  }

  if (path === '/v1/users/stats' && method === 'GET') {
    const activeUsers = usersStore.filter((user) => user.isActive).length;
    const usersByRole = usersStore.reduce<Record<string, number>>((result, user) => {
      result[user.role] = (result[user.role] || 0) + 1;
      return result;
    }, {});
    return ok({
      totalUsers: usersStore.length,
      activeUsers,
      inactiveUsers: usersStore.length - activeUsers,
      usersByRole,
      recentRegistrations: Math.min(3, usersStore.length),
    });
  }

  if (path === '/v1/users/profile' && method === 'PUT') {
    const primaryUser = usersStore[0];
    const updated = { ...primaryUser, ...body, updatedAt: nowIso() };
    usersStore[0] = updated;
    return ok(updated, 'Profile dummy diperbarui');
  }

  if (path === '/v1/users/permissions' && method === 'GET') {
    const moduleFilter = searchParams.get('module');
    const data = moduleFilter
      ? permissionsStore.filter((permission) => permission.module === moduleFilter)
      : permissionsStore;
    return ok(data);
  }

  if (path.startsWith('/v1/users/roles')) {
    const roleId = path.split('/')[4];
    if (!roleId && method === 'GET') {
      return ok(paginate(rolesStore, searchParams));
    }
    if (roleId && method === 'GET') {
      return ok(rolesStore.find((role) => role.id === roleId) || rolesStore[0]);
    }
    if (!roleId && method === 'POST') {
      const created = {
        id: `role-${Date.now()}`,
        isActive: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        ...body,
      };
      rolesStore.unshift(created);
      return ok(created, 'Role dummy dibuat');
    }
    if (roleId && method === 'PUT') {
      rolesStore = rolesStore.map((role) => role.id === roleId ? { ...role, ...body, updatedAt: nowIso() } : role);
      return ok(rolesStore.find((role) => role.id === roleId) || null, 'Role dummy diperbarui');
    }
    if (roleId && method === 'DELETE') {
      rolesStore = rolesStore.filter((role) => role.id !== roleId);
      return messageResponse('Role dummy dihapus');
    }
  }

  if (path.startsWith('/v1/users')) {
    const userId = path.split('/')[3];
    if (!userId && method === 'GET') {
      return ok(paginate(usersStore, searchParams));
    }
    if (userId && method === 'GET') {
      return ok(usersStore.find((user) => user.id === userId) || usersStore[0]);
    }
    if (!userId && method === 'POST') {
      const created = {
        id: `user-${Date.now()}`,
        permissions: [],
        isActive: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        ...body,
      };
      usersStore.unshift(created);
      return ok(created, 'User dummy dibuat');
    }
    if (userId && method === 'PUT') {
      usersStore = usersStore.map((user) => user.id === userId ? { ...user, ...body, updatedAt: nowIso() } : user);
      return ok(usersStore.find((user) => user.id === userId) || null, 'User dummy diperbarui');
    }
    if (userId && method === 'PATCH' && path.endsWith('/status')) {
      usersStore = usersStore.map((user) => user.id === userId ? { ...user, isActive: !!body?.isActive, updatedAt: nowIso() } : user);
      return ok(usersStore.find((user) => user.id === userId) || null, 'Status user dummy diperbarui');
    }
    if (userId && method === 'POST' && path.endsWith('/reset-password')) {
      return messageResponse('Reset password user dummy berhasil');
    }
    if (method === 'POST' && path.endsWith('/bulk-status')) {
      const userIds: string[] = body?.userIds || [];
      usersStore = usersStore.map((user) => userIds.includes(user.id) ? { ...user, isActive: !!body?.isActive, updatedAt: nowIso() } : user);
      return messageResponse('Bulk status user dummy berhasil');
    }
    if (method === 'POST' && path.endsWith('/bulk-delete')) {
      const userIds: string[] = body?.userIds || [];
      usersStore = usersStore.filter((user) => !userIds.includes(user.id));
      return messageResponse('Bulk delete user dummy berhasil');
    }
    if (userId && method === 'DELETE') {
      usersStore = usersStore.filter((user) => user.id !== userId);
      return messageResponse('User dummy dihapus');
    }
  }

  if (path === '/v1/inventory/medicines/stats' && method === 'GET') {
    const totalStock = stockStore.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = stockStore.filter((item) => item.quantity < 10).length;
    const expiringCount = stockStore.filter((item) => new Date(item.expiryDate).getTime() <= Date.now() + 30 * 24 * 60 * 60 * 1000).length;
    const totalValue = stockStore.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const categoryDistribution = medicinesStore.reduce<Record<string, number>>((result, medicine) => {
      result[medicine.category] = (result[medicine.category] || 0) + 1;
      return result;
    }, {});
    const supplierDistribution = medicinesStore.reduce<Record<string, number>>((result, medicine) => {
      result[medicine.supplier] = (result[medicine.supplier] || 0) + 1;
      return result;
    }, {});

    return ok({
      totalMedicines: medicinesStore.length,
      totalStock,
      lowStockCount,
      expiringCount,
      totalValue,
      categoryDistribution,
      supplierDistribution,
    });
  }

  if (path.startsWith('/v1/inventory/medicines')) {
    const medicineId = path.split('/')[4];
    if (!medicineId && method === 'GET') {
      return ok(paginate(medicinesStore, searchParams));
    }
    if (medicineId && method === 'GET') {
      return ok(medicinesStore.find((medicine) => medicine.id === medicineId) || medicinesStore[0]);
    }
    if (!medicineId && method === 'POST') {
      const created = {
        id: `medicine-${Date.now()}`,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        isActive: true,
        ...body,
      };
      medicinesStore.unshift(created);
      return ok(created, 'Obat dummy dibuat');
    }
    if (medicineId && method === 'PUT') {
      medicinesStore = medicinesStore.map((medicine) => medicine.id === medicineId ? { ...medicine, ...body, updatedAt: nowIso() } : medicine);
      return ok(medicinesStore.find((medicine) => medicine.id === medicineId) || null, 'Obat dummy diperbarui');
    }
    if (medicineId && method === 'DELETE') {
      medicinesStore = medicinesStore.filter((medicine) => medicine.id !== medicineId);
      return messageResponse('Obat dummy dihapus');
    }
    if (medicineId && method === 'POST' && path.endsWith('/image')) {
      return ok({
        url: '/images/dummy/medicine-image.png',
        medicineId,
      }, 'Upload gambar dummy berhasil');
    }
  }

  if (path.startsWith('/v1/inventory/stock')) {
    const stockId = path.split('/')[4];
    if (!stockId && method === 'GET') {
      return ok(paginate(stockStore, searchParams));
    }
    if (stockId && method === 'GET') {
      return ok(stockStore.find((stock) => stock.id === stockId) || stockStore[0]);
    }
    if (!stockId && method === 'POST') {
      const created = {
        id: `stock-${Date.now()}`,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        isActive: true,
        ...body,
      };
      stockStore.unshift(created);
      return ok(created, 'Stok dummy dibuat');
    }
    if (stockId && method === 'PUT') {
      stockStore = stockStore.map((stock) => stock.id === stockId ? { ...stock, ...body, updatedAt: nowIso() } : stock);
      return ok(stockStore.find((stock) => stock.id === stockId) || null, 'Stok dummy diperbarui');
    }
    if (stockId && method === 'DELETE') {
      stockStore = stockStore.filter((stock) => stock.id !== stockId);
      return messageResponse('Stok dummy dihapus');
    }
    if (method === 'POST' && path.endsWith('/adjustments')) {
      return ok({
        id: `adjustment-${Date.now()}`,
        ...body,
        adjustedAt: nowIso(),
      }, 'Penyesuaian stok dummy berhasil');
    }
  }

  if (path.startsWith('/v1/inventory/categories')) {
    const categoryId = path.split('/')[4];
    if (!categoryId && method === 'GET') {
      return ok(paginate(categoriesStore, searchParams));
    }
    if (categoryId && method === 'GET') {
      return ok(categoriesStore.find((category) => category.id === categoryId) || categoriesStore[0]);
    }
    if (!categoryId && method === 'POST') {
      const created = {
        id: `category-${Date.now()}`,
        isActive: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        ...body,
      };
      categoriesStore.unshift(created);
      return ok(created, 'Kategori dummy dibuat');
    }
    if (categoryId && method === 'PUT') {
      categoriesStore = categoriesStore.map((category) => category.id === categoryId ? { ...category, ...body, updatedAt: nowIso() } : category);
      return ok(categoriesStore.find((category) => category.id === categoryId) || null, 'Kategori dummy diperbarui');
    }
    if (categoryId && method === 'DELETE') {
      categoriesStore = categoriesStore.filter((category) => category.id !== categoryId);
      return messageResponse('Kategori dummy dihapus');
    }
  }

  if (path.startsWith('/v1/inventory/suppliers')) {
    const supplierId = path.split('/')[4];
    if (!supplierId && method === 'GET') {
      return ok(paginate(suppliersStore, searchParams));
    }
    if (supplierId && method === 'GET') {
      return ok(suppliersStore.find((supplier) => supplier.id === supplierId) || suppliersStore[0]);
    }
    if (!supplierId && method === 'POST') {
      const created = {
        id: `supplier-${Date.now()}`,
        isActive: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        ...body,
      };
      suppliersStore.unshift(created);
      return ok(created, 'Supplier dummy dibuat');
    }
    if (supplierId && method === 'PUT') {
      suppliersStore = suppliersStore.map((supplier) => supplier.id === supplierId ? { ...supplier, ...body, updatedAt: nowIso() } : supplier);
      return ok(suppliersStore.find((supplier) => supplier.id === supplierId) || null, 'Supplier dummy diperbarui');
    }
    if (supplierId && method === 'DELETE') {
      suppliersStore = suppliersStore.filter((supplier) => supplier.id !== supplierId);
      return messageResponse('Supplier dummy dihapus');
    }
  }

  if (path.startsWith('/v1/transactions')) {
    const transactionId = path.split('/')[3];
    if (!transactionId && method === 'GET') {
      return ok(paginate(transactionStore, searchParams));
    }
    if (transactionId && method === 'GET') {
      return ok(transactionStore.find((transaction) => transaction.id === transactionId) || transactionStore[0]);
    }
    if (path.endsWith('/upload') && method === 'POST') {
      return ok({
        filename: 'dummy-upload.pdf',
        url: '/uploads/dummy-upload.pdf',
      }, 'Upload dummy berhasil');
    }
    if (!transactionId && method === 'POST') {
      const created = {
        id: `TXN-${Date.now()}`,
        status: 'submitted',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        ...body,
      };
      transactionStore.unshift(created);
      return ok(created, 'Transaksi dummy dibuat');
    }
    if (transactionId && method === 'POST' && path.endsWith('/approve')) {
      transactionStore = transactionStore.map((transaction) => transaction.id === transactionId ? { ...transaction, status: 'ready_distribution', updatedAt: nowIso() } : transaction);
      return messageResponse('Transaksi dummy disetujui');
    }
    if (transactionId && method === 'POST' && path.endsWith('/process')) {
      transactionStore = transactionStore.map((transaction) => transaction.id === transactionId ? { ...transaction, status: 'distributing', updatedAt: nowIso() } : transaction);
      return messageResponse('Transaksi dummy diproses');
    }
    if (transactionId && method === 'POST' && path.endsWith('/complete')) {
      transactionStore = transactionStore.map((transaction) => transaction.id === transactionId ? { ...transaction, status: 'completed', updatedAt: nowIso() } : transaction);
      return messageResponse('Transaksi dummy diselesaikan');
    }
  }

  if (path.startsWith('/v1/master-data/farmer-groups')) {
    const id = path.split('/')[4];
    if (!id && method === 'GET') {
      return ok(paginate(farmerGroupStore, searchParams));
    }
    if (id && method === 'GET') {
      return ok(farmerGroupStore.find((item) => item.id === id) || farmerGroupStore[0]);
    }
    if (!id && method === 'POST') {
      const created = { id: `fg-${Date.now()}`, ...body };
      farmerGroupStore.unshift(created);
      return ok(created);
    }
    if (id && method === 'PUT') {
      farmerGroupStore = farmerGroupStore.map((item) => item.id === id ? { ...item, ...body } : item);
      return ok(farmerGroupStore.find((item) => item.id === id) || null);
    }
    if (id && method === 'DELETE') {
      farmerGroupStore = farmerGroupStore.filter((item) => item.id !== id);
      return messageResponse('Farmer group dummy dihapus');
    }
  }

  if (path.startsWith('/v1/master-data/commodities')) {
    const id = path.split('/')[4];
    if (path.endsWith('/categories') && method === 'GET') {
      return ok(Array.from(new Set(commoditiesStore.map((item) => item.category))));
    }
    if (!id && method === 'GET') {
      return ok(paginate(commoditiesStore, searchParams));
    }
    if (id && method === 'GET') {
      return ok(commoditiesStore.find((item) => item.id === id) || commoditiesStore[0]);
    }
    if (!id && method === 'POST') {
      const created = { id: `commodity-${Date.now()}`, ...body };
      commoditiesStore.unshift(created);
      return ok(created);
    }
    if (id && method === 'PUT') {
      commoditiesStore = commoditiesStore.map((item) => item.id === id ? { ...item, ...body } : item);
      return ok(commoditiesStore.find((item) => item.id === id) || null);
    }
    if (id && method === 'DELETE') {
      commoditiesStore = commoditiesStore.filter((item) => item.id !== id);
      return messageResponse('Commodity dummy dihapus');
    }
  }

  if (path.startsWith('/v1/master-data/pest-types')) {
    const id = path.split('/')[4];
    if (path.endsWith('/categories') && method === 'GET') {
      return ok(Array.from(new Set(pestTypeStore.map((item) => item.category))));
    }
    if (!id && method === 'GET') {
      return ok(paginate(pestTypeStore, searchParams));
    }
    if (id && method === 'GET') {
      return ok(pestTypeStore.find((item) => item.id === id) || pestTypeStore[0]);
    }
    if (!id && method === 'POST') {
      const created = { id: `pest-${Date.now()}`, ...body };
      pestTypeStore.unshift(created);
      return ok(created);
    }
    if (id && method === 'PUT') {
      pestTypeStore = pestTypeStore.map((item) => item.id === id ? { ...item, ...body } : item);
      return ok(pestTypeStore.find((item) => item.id === id) || null);
    }
    if (id && method === 'DELETE') {
      pestTypeStore = pestTypeStore.filter((item) => item.id !== id);
      return messageResponse('Pest type dummy dihapus');
    }
  }

  if (path === '/v1/master-data/districts' && method === 'GET') {
    return ok(TUBAN_DATA.map((district, index) => ({ id: `district-${index + 1}`, name: district.name })));
  }

  if (path === '/v1/master-data/villages' && method === 'GET') {
    const districtFilter = searchParams.get('district');
    const villages = districtFilter
      ? (TUBAN_DATA.find((district) => district.name === districtFilter)?.villages || [])
      : TUBAN_DATA.flatMap((district) => district.villages);
    return ok(villages.map((village, index) => ({ id: `village-${index + 1}`, name: village.name })));
  }

  if (path.startsWith('/v1/reports/transactions') && method === 'GET') {
    return ok({
      downloadUrl: '/reports/dummy-transactions.csv',
      generatedAt: nowIso(),
    });
  }

  return ok(null, `Dummy fallback untuk ${method} ${path}`);
}