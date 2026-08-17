import { requireSupabase } from './supabase'

export async function getVehicles() {
  const { data, error } = await requireSupabase().from('vehicles').select('*').order('manufacturer').order('name')
  if (error) throw error
  return data
}

export async function getVehicleParts(vehicleId) {
  const { data, error } = await requireSupabase().from('parts').select('*').eq('vehicle_id', vehicleId).order('category').order('name')
  if (error) throw error
  return data
}

export async function saveBuild({ id, vehicleId, name, state, stats }) {
  const client = requireSupabase()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Sign in to save a build.')

  const payload = { user_id: user.id, vehicle_id: vehicleId, name, state, stats }
  const query = id
    ? client.from('builds').update(payload).eq('id', id).select().single()
    : client.from('builds').insert(payload).select().single()
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function loadBuilds() {
  const client = requireSupabase()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []
  const { data, error } = await client.from('builds').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function saveRepair({ id, vehicleId, state, completed }) {
  const client = requireSupabase()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Sign in to save repair progress.')
  const payload = { user_id: user.id, vehicle_id: vehicleId, state, completed }
  const query = id
    ? client.from('repairs').update(payload).eq('id', id).select().single()
    : client.from('repairs').insert(payload).select().single()
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function recordTestRun({ buildId, telemetry }) {
  const client = requireSupabase()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Sign in to save test telemetry.')
  const { data, error } = await client.from('test_runs').insert({ user_id: user.id, build_id: buildId ?? null, telemetry }).select().single()
  if (error) throw error
  return data
}
