import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../utils/constants'
import type { UserProfile, Address, Order } from '../types'
import * as userApi from '../api/user'
import * as orderApi from '../api/order'

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

function adaptProfile(p: userApi.ApiProfile): UserProfile {
  return {
    name: p.full_name,
    phone: userApi.fromE164(p.phone),
    email: p.email,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    birthDate: p.birth_date,
    gender: p.gender,
    nationalId: p.national_id,
    avatarUrl: p.avatar_url,
  }
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
          set({ profile: adaptProfile(profile) })
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
        get().clearSession()
      },

      updateProfile: async (profile) => {
        const updated = await userApi.updateProfile({
          fullName: profile.name,
          email: profile.email,
          birthDate: profile.birthDate,
          gender: profile.gender,
          nationalId: profile.nationalId,
        })
        set({ profile: adaptProfile(updated) })
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
        set({ addresses: raw.map(userApi.adaptAddress) })
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
          const adapted = userApi.adaptAddress(created)
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
          addresses: state.addresses.map((a) => (a.id === id ? userApi.adaptAddress(updated) : a)),
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
        set({ orders: (res.orders ?? []).map(orderApi.adaptOrder) })
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
