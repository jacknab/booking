
import React from 'react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 text-2xl font-bold">Admin</div>
        <nav className="mt-4">
          <a href="/admin" className="block p-4 text-gray-700 hover:bg-gray-200">Dashboard</a>
          <a href="/admin/stock-items" className="block p-4 text-gray-700 hover:bg-gray-200">Stock Items</a>
          <a href="/admin/services" className="block p-4 text-gray-700 hover:bg-gray-200">Services</a>
          <a href="/admin/fulfillment" className="block p-4 text-gray-700 hover:bg-gray-200">Fulfillment</a>
          <a href="/admin/stores" className="block p-4 text-gray-700 hover:bg-gray-200">Stores</a>
          <a href="/admin/users" className="block p-4 text-gray-700 hover:bg-gray-200">Users</a>
          <a href="/admin/settings" className="block p-4 text-gray-700 hover:bg-gray-200">Settings</a>
          <a href="/admin/invoices" className="block p-4 text-gray-700 hover:bg-gray-200">Invoices</a>
          <a href="/admin/seo-regions" className="block p-4 text-gray-700 hover:bg-gray-200">SEO Pages</a>
        </nav>
      </div>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};
