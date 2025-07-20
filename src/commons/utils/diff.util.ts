export const getDifferingKeys = <T extends Record<string, any>>( obj1: T, obj2: T ): Array<keyof T> => {
  return (Object.keys(obj1) as Array<keyof T>).filter(
    key => obj1[key] !== obj2[key]
  )
}

export const getUpdatedFields = <T extends Record<string, any>>( before: T, after: T ): Partial<T> => {
  let result: Partial<T> = {}

  const diffKeys = getDifferingKeys(before, after)
  diffKeys.forEach(key => {
    result[key] = after[key]
  })

  return result
}