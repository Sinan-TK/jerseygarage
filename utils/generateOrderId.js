const generateRandomCode = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return result;
};

export const generateOrderId = () => {
  // Get today's date: YYYYMMDD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const datePart = `${yyyy}${mm}${dd}`;

  // Random part (6 chars)
  const randomPart = generateRandomCode(6);

  return `#ORD-${datePart}-${randomPart}`;
};
