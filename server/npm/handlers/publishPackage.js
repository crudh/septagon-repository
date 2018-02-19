const getPackageVersion = package => Object.keys(package.versions)[0]

const createNewVersionPackage = (package, version) => {
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

const createNewMainPackage = (package, newVersionPackage) => {
  // _rev is missing
  // DONE: add only the new version first, it should use exact copy of newVersionPackage
  // add all versions (only the latest is sent on publish) in other function
  // DONE: make _attachments an empty object
  // write the binary (in other function)
  // create time from all the versions
  // DONE add homepage, keywords, repository, author, bugs, license, readmeFileName from the new version
  //     more?

  const attributesFromVersion = [
    "homepage, keywords, repository, author, bugs, license, readmeFileName"
  ].reduce(
    (acc, cur) =>
      newVersionPackage[cur] === undefined
        ? acc
        : {
            ...acc,
            [cur]: newVersionPackage[cur]
          },
    {}
  )

  return {
    ...package,
    versions: {
      [newVersionPackage.version]: newVersionPackage
    },
    ...attributesFromVersion,
    _attachments: {}
  }
}

const publishPackage = async (repo, name, package) => {
  const version = getPackageVersion(package)
  const newVersionPackage = createNewVersionPackage(package, version)
  const newMainPackage = createNewMainPackage(package, newVersionPackage)

  console.info(newMainPackage)

  //console.info(content)
  // - Do some validation, we don't want to create the dir too soon
  //    ie there is a version supplied, the version isn't published, the package name, more?
  // - Transform the JSON to a version specific "file"
  // - Update or create the main "file"
  // - Check if dir exist, otherwise create
  // - Write the binary/binaries
  // - Write both json files, the main one last in case we need to rollback
  // - Return
}

module.exports = publishPackage
