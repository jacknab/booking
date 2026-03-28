import React, { useState, useEffect, useCallback } from 'react';
import { dbSingle, dbUpdate } from '../../services/db.js';
import { getStoreId } from '../../config';

interface StoreRow {
  store_number: number;
  storeid: number;
  store_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  password_hash?: string | null; // We won't display this, but it's in the data structure
  password_salt?: string | null;
  db_access_enabled?: boolean | null;
}

export const UsersManager: React.FC = () => {
  const [storeId, setStoreIdState] = useState<string>('');
  const [row, setRow] = useState<StoreRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [store_name, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [password_hash, setPasswordHash] = useState('');
  const [password_salt, setPasswordSalt] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [db_access_enabled, setDbAccessEnabled] = useState(true);

  useEffect(() => {
    setStoreIdState(getStoreId());
  }, []);

  const fetchStoreData = useCallback(async () => {
    const id = Number(storeId);
    if (Number.isNaN(id) || !id) return;
    try {
      setError(null);
      const fetchedRow = await dbSingle(
        'store',
        ['store_number', 'storeid', 'store_name', 'phone_number', 'email', 'password_hash', 'password_salt', 'db_access_enabled'],
        { eq: { store_number: id } }
      ) as StoreRow | undefined;

      if (fetchedRow) {
        setRow(fetchedRow);
        setStoreName(String(fetchedRow.store_name || ''));
        setEmail(String(fetchedRow.email || ''));
        setPhoneNumber(String(fetchedRow.phone_number || ''));
        setPasswordHash(String(fetchedRow.password_hash || ''));
        setPasswordSalt(String(fetchedRow.password_salt || ''));
        setDbAccessEnabled(fetchedRow.db_access_enabled ?? true);
      } else {
        setError('Store not found.');
      }
    } catch (e) {
      console.error('Error fetching store data:', e);
      setError('Failed to load store details.');
    }
  }, [storeId]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  const startEdit = () => { setEditing(true); setError(null); };
  const cancelEdit = () => {
    setEditing(false);
    if (row) {
      setStoreName(String(row.store_name || ''));
      setEmail(String(row.email || ''));
      setPhoneNumber(String(row.phone_number || ''));
      setDbAccessEnabled(row.db_access_enabled ?? true);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      const id = Number(storeId);
      if (Number.isNaN(id) || !id) throw new Error('Missing store configuration');

      const values: Partial<StoreRow> = {
        store_name: store_name.trim() || null,
        email: email.trim() || null,
        phone_number: phone_number.trim() || null,
        db_access_enabled: db_access_enabled,
      };

      if (showPasswordFields) {
        if (!newPassword || newPassword !== confirmPassword) {
          throw new Error('New password and confirmation do not match.');
        }
        // Hash the new password
        const { hash, salt } = await hashPassword(newPassword);
        values.password_hash = hash;
        values.password_salt = salt;
      }

      await dbUpdate(
        'store',
        values,
        { store_number: id }
      );
      setEditing(false);
      setShowPasswordFields(false); // Hide password fields after saving
      setNewPassword(''); // Clear password fields
      setConfirmPassword(''); // Clear password fields
      // Re-fetch data to ensure UI is updated with latest saved values
      await fetchStoreData(); 
    } catch (e) {
      console.error('Error saving store data:', e);
      setError(e instanceof Error ? e.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Function to hash password using Web Crypto API
  const hashPassword = async (password: string) => {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes salt
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 }, // This is just a placeholder for deriveKey, actual key length is 32 bytes (256 bits)
      true,
      ['encrypt', 'decrypt']
    );

    const hashBuffer = await crypto.subtle.exportKey('raw', derivedKey);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

    return { hash: hashHex, salt: saltHex };
  };

  return (
    <div className="w-full text-white border border-[#333333] rounded-2xl shadow-sm p-8" style={{ background: '#151515' }}>
      {!row ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="title" style={{ marginTop: 0 }}>Store Account Details</h3>
          </div>
          <p className="help">Set your Store ID in settings to load store account details.</p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="title" style={{ marginTop: 0 }}>Store Account Details</h3>
            <div className="form-actions" style={{ display: 'flex', gap: 10 }}>
              {!editing ? (
                <button className="cta-black" onClick={startEdit} disabled={!row}>Edit</button>
              ) : (
                <>
                  <button className="cta-black" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                  <button className="cta-disabled" onClick={cancelEdit}>Cancel</button>
                </>
              )}
            </div>
          </div>
          {error && <span className="help">{error}</span>}
          <div className="space-y-4 mt-4">
            <div className="border border-[#333333] rounded-2xl p-4" style={{ background: '#1e1e1e' }}>
              <div className="text-sm font-semibold mb-2">Store Information</div>
              <div className="grid grid-cols-1 gap-4">
                  <div className="field">
                    <div className="field-label">Store ID</div>
                    <input 
                      className="input-light"
                      value={row.store_number}
                      disabled
                      style={{ background: '#242424', color: '#fff', border: '1px solid #333', borderRadius: 12 }}
                    />
                  </div>
                  <div className="field">
                    <div className="field-label">Store Name</div>
                    <input 
                      className="input-light"
                      value={store_name}
                      onChange={e => setStoreName(e.target.value)}
                      disabled={!editing}
                      style={{ background: '#242424', color: '#fff', border: '1px solid #333', borderRadius: 12 }}
                    />
                  </div>
                  <div className="field">
                    <div className="field-label">Email Address</div>
                    <input 
                      className="input-light"
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={!editing}
                      style={{ background: '#242424', color: '#fff', border: '1px solid #333', borderRadius: 12 }}
                    />
                  </div>
                  <div className="field">
                    <div className="field-label">Phone Number</div>
                    <input 
                      className="input-light"
                      type="tel" 
                      value={phone_number}
                      onChange={e => setPhoneNumber(e.target.value)}
                      disabled={!editing}
                      style={{ background: '#242424', color: '#fff', border: '1px solid #333', borderRadius: 12 }}
                    />
                  </div>
                  <div className="field flex items-center justify-between">
                    <div className="field-label mb-0">Database Access Enabled</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={db_access_enabled}
                        onChange={(e) => setDbAccessEnabled(e.target.checked)}
                        disabled={!editing}
                      />
                      <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white after:peer-checked:bg-[#151515]"></div>
                    </label>
                  </div>
                  <div>
                    <div className="field-label">Password</div>
                    {!showPasswordFields && (
                      <button
                        className="mt-1 px-3 py-1 cta-black"
                        onClick={() => setShowPasswordFields(true)}
                        disabled={!editing}
                      >
                        Change Password
                      </button>
                    )}
                    {showPasswordFields && (
                      <>
                        <input
                          type="password"
                          className="input-light mt-1"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="New Password"
                          disabled={!editing}
                          style={{ background: '#242424', color: '#fff', border: '1px solid #333', borderRadius: 12 }}
                        />
                        <input
                          type="password"
                          className="input-light mt-2"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Confirm New Password"
                          disabled={!editing}
                          style={{ background: '#242424', color: '#fff', border: '1px solid #333', borderRadius: 12 }}
                        />
                        <button
                          className="mt-2 px-3 py-1 cta-disabled"
                          onClick={() => {
                            setShowPasswordFields(false);
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          disabled={!editing}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
};
