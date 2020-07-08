import { Router } from 'express'

import sql = require('../lib/sql')
const { functions } = sql
import { RunQuery } from '../lib/connectionPool'
import { DEFAULT_SYSTEM_SCHEMAS } from '../lib/constants'
import { Functions } from '../lib/interfaces'

/**
 * @param {boolean} [includeSystemSchemas=false] - Return system schemas as well as user schemas
 */
interface QueryParams {
  includeSystemSchemas?: string
}

const router = Router()
router.get('/', async (req, res) => {
  try {
    const { data } = await RunQuery(req.headers.pg, functions)
    const query: QueryParams = req.query
    const includeSystemSchemas = query?.includeSystemSchemas === 'true'
    let payload: Functions.Function[] = data
    if (!includeSystemSchemas) payload = removeSystemSchemas(data)
    return res.status(200).json(payload)
  } catch (error) {
    console.log('throwing error')
    res.status(500).json({ error: 'Database error', status: 500 })
  }
})

const removeSystemSchemas = (data: Functions.Function[]) => {
  return data.filter((x) => !DEFAULT_SYSTEM_SCHEMAS.includes(x.schema))
}

export = router