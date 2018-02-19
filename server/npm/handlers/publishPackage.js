const getPackageVersion = package => Object.keys(package.versions)[0]

const getVersionPackage = (package, version) => {
  const { readme, readmeFilename, ...versionPackage } = package.versions[
    version
  ]

  const { integrity, ...versionDist } = versionPackage.dist

  //console.info(cleanedVersionPackage)
  // DONE: _from and _directories are missing - USE if supplied, otherwise default to "." and {}
  // DONE copy dist.shasum to _shasum
  // DONE: remove dist.integrity
  // error handling?
  // DONE

  return {
    ...versionPackage,
    dist: versionDist,
    _from: versionPackage._from || ".",
    _directories: versionPackage._directories || {},
    _shasum: versionDist._shasum
  }
}

const getMainPackage = package => {
  const { versions, ...mainPackage } = package

  // _rev is missing
  // add all versions (only the latest is sent on publish)
  // make _attachments an empty object and write the binary
  // create time from all the versions
  // add homepage, keywords, repository, author, bugs, license, readmeFileName from the new version
  //     more?

  return mainPackage
}

const publishPackage = async (repo, name, package) => {
  const version = getPackageVersion(package)
  const versionPackage = getVersionPackage(package, version)
  const mainPackage = getMainPackage(package)

  console.info(mainPackage)

  //console.info(content)
  // - Do some validation, we don't want to create the dir too soon
  //    ie there is a version supplied, the version isn't published, more?
  // - Transform the JSON to a version specific "file"
  // - Update or create the main "file"
  // - Check if dir exist, otherwise create
  // - Write the binary/binaries
  // - Write both json files, the main one last in case we need to rollback
  // - Return
}

module.exports = publishPackage
