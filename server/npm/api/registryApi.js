const logger = require("winston")
const user = require("../handlers/user")

const getRegistryInfo = (req, res) =>
  res.json({ registry_name: req.params.repo })

const ping = (req, res) => res.json({})

const login = (req, res) => {
  const userName = req.params.username
  const { name, password } = req.body

  if (userName !== name) {
    logger.error(`Failed login, username mismatch: ${name} and ${userName}`)
    return res.status(401).json({ ok: false })
  }

  return user
    .login(name, password)
    .then(() => res.status(201).json({ ok: true }))
    .catch(() => {
      logger.error(`Failed login: ${name}`)
      res.status(401).json({ ok: false })
    })
}

module.exports = {
  getRegistryInfo,
  ping,
  login
}
