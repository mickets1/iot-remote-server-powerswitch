import { Client } from '@elastic/elasticsearch'
import fs from 'fs-extra'

/**
 * Elasticsearch INIT.
 *
 * @returns {object} - Elasticsearch client.
 */
export async function elasticInit () {
  try {
  /**
   * Express middleware for communicating with elasticsearch
   */
    const client = new Client({
      node: 'https://localhost:9200',
      auth: { username: process.env.ELASTIC_USERNAME, password: process.env.ELASTIC_PASSWORD },
      tls: {
        ca: fs.readFileSync('./elastic/http_ca.crt'),
        rejectUnauthorized: false
      },
      log: 'info',
      apiVersion: '8.1.2'
    })

    // Create index if it doesn't exist.
    if (!await client.indices.exists({ index: 'docker' })) {
      await client.indices.create({ index: 'docker' })
    }

    // init mappings
    await client.index({
      index: 'docker',
      document: {
        ts: 0,
        serverinfo: 'init',
        temp: 'init',
        humidity: 'init'
      }
    })

    return client
  } catch (e) {
  }
}
