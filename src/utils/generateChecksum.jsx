import SparkMD5 from 'spark-md5'

export const generateChecksum = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const hash = SparkMD5.ArrayBuffer.hash(reader.result)
        resolve(hash)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}
