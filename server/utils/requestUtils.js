const getBasicAuth = req => {
  const { authorization } = req.headers

  if (authorization) {
    const authentication = new Buffer(
      authorization.replace(/^Basic/, ""),
      "base64"
    )
      .toString("utf8")
      .split(":")

    if (authentication.length === 2) {
      return {
        name: authentication[0],
        password: authentication[1]
      }
    }
  }

  return {
    name: "",
    password: ""
  }
}

module.exports = {
  getBasicAuth
}
