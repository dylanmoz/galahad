// @flow

export default function moveArrayElement(arr: any[], from: number, to: number) {
  const newArr = arr.slice(0)
  const val = newArr[from]

  newArr.splice(from, 1)
  newArr.splice(to, 0, val)

  return newArr
}
