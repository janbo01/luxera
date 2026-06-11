import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../utils/constants'
import type { UserProfile, Address, Order, OrderStatus } from '../types'
import * as userApi from '../api/user'
import * as orderApi from '../api/order'

function adaptAddress(a: userApi.ApiAddress): Address {
  return {
    id: a.id,
    label: a.title,
    fullName: a.recipient_name,
    phone: userApi.fromE164(a.recipient_phone),
    province: a.province,
    city: a.city,
    street: a.full_address,
    postalCode: a.postal_code,
    isDefault: a.is_default,
  }
}

function adaptOrder(o: orderApi.ApiOrder): Order {
  const statusMap: Record<string, OrderStatus> = {
    pending: 'pending',
    paid: 'processing',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
  }
  return {
    id: o.id,
    date: new Date(o.created_at).toLocaleDateString('fa-IR'),
    status: statusMap[o.status] ?? 'pending',
    items: o.items.map((it) => ({
      productId: it.product_id,
      name: it.title,
      qty: it.quantity,
      price: parseFloat(it.price_at_purchase),
      illus: '',
    })),
    total: parseFloat(o.total_amount),
    address: o.shipping_address_id,
    trackingCode: o.tracking_code ?? null,
  }
}

interface AuthState {
  isLoggedIn: boolean
  token: string | null
  profile: UserProfile | null
  addresses: Address[]
  orders: Order[]
  requestOTP: (phone: string) => Promise<void>
  verifyOTP: (phone: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profile: UserProfile) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  deleteAvatar: () => Promise<void>
  fetchAddresses: () => Promise<void>
  addAddress: (data: Omit<Address, 'id'>) => Promise<void>
  updateAddress: (id: string, data: Partial<Omit<Address, 'id'>>) => Promise<void>
  removeAddress: (id: string) => Promise<void>
  setDefaultAddress: (id: string) => Promise<void>
  fetchOrders: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      token: null,
      profile: null,
      addresses: [],
      orders: [],

      requestOTP: async (phone) => {
        await userApi.requestOTP(phone)
      },

      verifyOTP: async (phone, otp) => {
        const { token } = await userApi.verifyOTP(phone, otp)
        set({ isLoggedIn: true, token })
        try {
          const [profile] = await Promise.all([
            userApi.getProfile(),
            get().fetchAddresses(),
            get().fetchOrders(),
          ])
          set({
            profile: {
              name: profile.full_name,
              phone: userApi.fromE164(profile.phone),
              email: profile.email,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
              birthDate: profile.birth_date,
              gender: profile.gender,
              nationalId: profile.national_id,
              avatarUrl: profile.avatar_url,
            },
          })
        } catch {
          // profile fetch errors are non-fatal
        }
      },

      logout: async () => {
        const { token } = get()
        if (token) {
          try {
            await userApi.signout(token)
          } catch {
            /* ignore */
          }
        }
        set({ isLoggedIn: false, token: null, profile: null, addresses: [], orders: [] })
      },

      updateProfile: async (profile) => {
        const updated = await userApi.updateProfile({
          fullName: profile.name,
          email: profile.email,
          birthDate: profile.birthDate,
          gender: profile.gender,
          nationalId: profile.nationalId,
        })
        set({
          profile: {
            name: updated.full_name,
            phone: userApi.fromE164(updated.phone),
            email: updated.email,
            createdAt: updated.created_at,
            updatedAt: updated.updated_at,
            birthDate: updated.birth_date,
            gender: updated.gender,
            nationalId: updated.national_id,
            avatarUrl: updated.avatar_url,
          },
        })
      },

      uploadAvatar: async (file) => {
        const { avatar_url } = await userApi.uploadAvatar(file)
        set((state) => ({
          profile: state.profile ? { ...state.profile, avatarUrl: avatar_url } : state.profile,
        }))
      },

      deleteAvatar: async () => {
        await userApi.deleteAvatar()
        set((state) => ({
          profile: state.profile ? { ...state.profile, avatarUrl: undefined } : state.profile,
        }))
      },

      fetchAddresses: async () => {
        const raw = await userApi.listAddresses()
        set({ addresses: raw.map(adaptAddress) })
      },

      addAddress: async (data) => {
        const created = await userApi.createAddress({
          title: data.label,
          full_address: data.street,
          city: data.city,
          province: data.province,
          postal_code: data.postalCode,
          is_default: data.isDefault,
          recipient_name: data.fullName,
          recipient_phone: userApi.toE164(data.phone),
        })
        set((state) => {
          const adapted = adaptAddress(created)
          const addresses = adapted.isDefault
            ? state.addresses.map((a) => ({ ...a, isDefault: false })).concat(adapted)
            : [...state.addresses, adapted]
          return { addresses }
        })
      },

      updateAddress: async (id, data) => {
        const current = get().addresses.find((a) => a.id === id)
        if (!current) return
        const merged = { ...current, ...data }
        const updated = await userApi.updateAddress(id, {
          title: merged.label,
          full_address: merged.street,
          city: merged.city,
          province: merged.province,
          postal_code: merged.postalCode,
          is_default: merged.isDefault,
          recipient_name: merged.fullName,
          recipient_phone: userApi.toE164(merged.phone),
        })
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === id ? adaptAddress(updated) : a)),
        }))
      },

      removeAddress: async (id) => {
        await userApi.deleteAddress(id)
        set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) }))
      },

      setDefaultAddress: async (id) => {
        await userApi.setDefaultAddress(id)
        set((state) => ({
          addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        }))
      },

      fetchOrders: async () => {
        const res = await orderApi.listOrders()
        set({ orders: (res.orders ?? []).map(adaptOrder) })
      },

      clearSession: () => {
        set({ isLoggedIn: false, token: null, profile: null, addresses: [], orders: [] })
      },
    }),
    {
      name: STORAGE_KEYS.auth,
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        token: state.token,
        profile: state.profile,
      }),
    },
  ),
)
