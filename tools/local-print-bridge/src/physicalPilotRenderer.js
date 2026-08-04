const ESC = 0x1b
const GS = 0x1d

const PILOT_TEXT = 'ALPHA-TECH PHYSICAL PRINT PILOT'

const renderPhysicalPilotEscPos = ({ feedLines = 3, partialCut = true } = {}) => {
  const safeFeedLines = Math.max(1, Math.min(10, Number(feedLines) || 3))
  const chunks = [
    Buffer.from([ESC, 0x40]),
    Buffer.from([ESC, 0x61, 0x01]),
    Buffer.from([ESC, 0x45, 0x01]),
    Buffer.from(`${PILOT_TEXT}\n`, 'ascii'),
    Buffer.from([ESC, 0x45, 0x00]),
    Buffer.from('ONE-SHOT TEST / NO CUSTOMER DATA\n', 'ascii'),
    Buffer.from([ESC, 0x64, safeFeedLines]),
  ]

  if (partialCut) chunks.push(Buffer.from([GS, 0x56, 0x01]))
  return Buffer.concat(chunks)
}

export { PILOT_TEXT, renderPhysicalPilotEscPos }
export default renderPhysicalPilotEscPos
