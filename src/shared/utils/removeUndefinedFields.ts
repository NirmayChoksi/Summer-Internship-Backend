export const removeUndefinedFields = <T extends Record<string, unknown>>(
  data: T,
) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );
};
