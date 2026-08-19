export const resolveQrCodeComponent = (moduleValue) => {
  const candidates = [
    moduleValue?.default?.default,
    moduleValue?.default?.QRCode,
    moduleValue?.QRCode,
    moduleValue?.default,
    moduleValue,
  ];

  return (
    candidates.find(
      (candidate) =>
        typeof candidate === 'function' ||
        Boolean(candidate && typeof candidate === 'object' && candidate.$$typeof),
    ) || null
  );
};

export default resolveQrCodeComponent;
