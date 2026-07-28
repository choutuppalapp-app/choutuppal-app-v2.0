const net = require('net')

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'ca-central-1'
]

function checkHost(host) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(2000)
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    const fail = () => {
      socket.destroy()
      resolve(false)
    }
    socket.on('error', fail)
    socket.on('timeout', fail)
    socket.connect(6543, host)
  })
}

async function main() {
  console.log('Probing responsive poolers on port 6543...')
  for (const r of regions) {
    for (const prefix of ['aws-0', 'aws-1']) {
      const host = `${prefix}-${r}.pooler.supabase.com`
      const ok = await checkHost(host)
      if (ok) {
        console.log(`FOUND RESPONSIVE POOLER: ${host}`)
      }
    }
  }
  console.log('Done.')
}

main()
